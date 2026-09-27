#!/usr/bin/env python3
"""
Real-time Drone Dataset Simulator - Fixed Version
This simulator generates realistic drone data and serves it via HTTP API
"""

import json
import time
import random
import math
from datetime import datetime
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from threading import Thread
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

class DroneSimulator:
    def __init__(self):
        self.current_frame = 0
        self.is_running = False
        self.frames = []  # Store all frames
        self.current_position = {
            'latitude': 12.9716,  # Bangalore coordinates
            'longitude': 77.5946,
            'altitude': 100.0
        }
        self.velocity = {'x': 0, 'y': 0, 'z': 0}
        self.battery_level = 100.0
        self.mission_start_time = datetime.now()
        
    def generate_realistic_movement(self):
        """Generate realistic drone movement patterns"""
        t = self.current_frame * 0.1  # Time factor
        
        # Different flight patterns
        patterns = ['circle', 'figure_eight', 'straight_line', 'hover']
        current_pattern = patterns[self.current_frame % 4]
        
        if current_pattern == 'circle':
            radius = 0.001
            self.current_position['latitude'] += radius * math.cos(t) * 0.01
            self.current_position['longitude'] += radius * math.sin(t) * 0.01
            self.velocity = {'x': -math.sin(t) * 2, 'y': math.cos(t) * 2, 'z': 0}
            
        elif current_pattern == 'figure_eight':
            self.current_position['latitude'] += 0.0001 * math.sin(t)
            self.current_position['longitude'] += 0.0001 * math.sin(2 * t) / 2
            self.velocity = {'x': math.cos(t) * 1.5, 'y': math.cos(2*t), 'z': 0}
            
        elif current_pattern == 'straight_line':
            self.current_position['latitude'] += 0.00005
            self.current_position['longitude'] += 0.00002
            self.velocity = {'x': 3, 'y': 1, 'z': 0}
            
        else:  # hover
            self.current_position['latitude'] += random.uniform(-0.000001, 0.000001)
            self.current_position['longitude'] += random.uniform(-0.000001, 0.000001)
            self.velocity = {'x': random.uniform(-0.1, 0.1), 'y': random.uniform(-0.1, 0.1), 'z': 0}
        
        # Altitude variation
        self.current_position['altitude'] = 100 + 20 * math.sin(t * 0.5)
        self.velocity['z'] = 10 * math.cos(t * 0.5)
        
        # Battery drain
        self.battery_level = max(0, self.battery_level - 0.02)
        
    def generate_frame_data(self):
        """Generate a single frame of drone data"""
        self.generate_realistic_movement()
        
        frame_data = {
            'frame_id': self.current_frame,
            'timestamp': datetime.now().isoformat(),
            'timestamp_iso': int(time.time() * 1000),
            'flight_time': int((datetime.now() - self.mission_start_time).total_seconds()),
            'latitude': round(self.current_position['latitude'], 6),
            'longitude': round(self.current_position['longitude'], 6),
            'altitude': round(self.current_position['altitude'], 2),
            'battery_level': round(self.battery_level, 1),
            'temperature': round(25 + random.uniform(-5, 15), 1),
            'humidity': round(45 + random.uniform(-10, 20), 1),
            'wind_speed': round(random.uniform(0, 15), 1),
            'gps_satellites': random.randint(8, 15),
            'signal_strength': random.randint(70, 100),
            'pitch': round(random.uniform(-15, 15), 2),
            'roll': round(random.uniform(-15, 15), 2),
            'yaw': round(random.uniform(0, 360), 2),
            'speed': round(math.sqrt(sum(v**2 for v in self.velocity.values())), 2),
            'mode': 'AUTO' if self.current_frame % 3 != 0 else 'GUIDED',
            'armed': True,
            'image_url': f'https://picsum.photos/640/480?random={self.current_frame}'
        }
        
        return frame_data
    
    def start_simulation(self):
        """Start the simulation loop"""
        self.is_running = True
        print("🚁 Drone simulator started!")
        print("📡 Generating real-time telemetry data...")
        print("🌐 Frontend should connect to: http://localhost:5000")
        
        while self.is_running:
            frame_data = self.generate_frame_data()
            self.frames.append(frame_data)
            
            # Keep only last 100 frames
            if len(self.frames) > 100:
                self.frames.pop(0)
            
            print(f"📊 Frame {self.current_frame}: "
                  f"Lat: {frame_data['latitude']:.6f}, "
                  f"Lng: {frame_data['longitude']:.6f}, "
                  f"Alt: {frame_data['altitude']:.1f}m, "
                  f"Battery: {frame_data['battery_level']:.1f}%")
            
            self.current_frame += 1
            time.sleep(1)  # Generate frame every second
    
    def stop_simulation(self):
        """Stop the simulation"""
        self.is_running = False
        print("🛑 Drone simulator stopped!")

# Global simulator instance
drone_sim = DroneSimulator()

# Routes for your existing frontend
@app.route('/')
def index():
    return jsonify({
        'message': 'Drone Dataset Simulator API',
        'status': 'running' if drone_sim.is_running else 'stopped',
        'frames_count': len(drone_sim.frames),
        'current_frame': drone_sim.current_frame,
        'endpoints': {
            '/frames': 'Get all frames',
            '/latest': 'Get latest frame',
            '/start': 'Start simulator',
            '/stop': 'Stop simulator'
        }
    })

@app.route('/frames')
def get_frames():
    """Get all generated frames - matches your frontend expectation"""
    return jsonify(drone_sim.frames)

@app.route('/latest')
def get_latest_frame():
    """Get the latest frame"""
    if drone_sim.frames:
        return jsonify(drone_sim.frames[-1])
    else:
        return jsonify({'error': 'No frames available'})

@app.route('/start')
def start_simulator():
    """Start the drone simulator"""
    if not drone_sim.is_running:
        sim_thread = Thread(target=drone_sim.start_simulation, daemon=True)
        sim_thread.start()
        return jsonify({'message': 'Simulator started', 'status': 'running'})
    else:
        return jsonify({'message': 'Simulator already running', 'status': 'running'})

@app.route('/stop')
def stop_simulator():
    """Stop the drone simulator"""
    drone_sim.stop_simulation()
    return jsonify({'message': 'Simulator stopped', 'status': 'stopped'})

@app.route('/status')
def get_status():
    """Get simulator status"""
    return jsonify({
        'is_running': drone_sim.is_running,
        'frames_count': len(drone_sim.frames),
        'current_frame': drone_sim.current_frame,
        'battery_level': drone_sim.battery_level
    })

if __name__ == '__main__':
    print("🚁 Drone Dataset Simulator")
    print("=" * 50)
    print("📍 Starting server on http://localhost:5000")
    print("🔌 Make sure your React app connects to this URL")
    print("=" * 50)
    
    # Auto-start the simulator
    print("🚀 Auto-starting drone simulation in 2 seconds...")
    time.sleep(2)
    sim_thread = Thread(target=drone_sim.start_simulation, daemon=True)
    sim_thread.start()
    
    # Start Flask server
    app.run(debug=False, host='0.0.0.0', port=5000, threaded=True)