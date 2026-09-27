import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || API_URL;

  // Check if simulator is running
  const checkSimulatorStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/status`);
      if (response.ok) {
        const data = await response.json();
        setIsSimulatorRunning(data.is_running);
        setError('');
        return true;
      }
    } catch (err) {
      setError('Cannot connect to simulator. Make sure Python simulator is running on port 5000.');
      return false;
    }
  };

  // Fetch frames from simulator
  const fetchFrames = async () => {
    try {
      const response = await fetch(`${API_URL}/frames`);
      if (response.ok) {
        const data = await response.json();
        setFrames(data);
        setIsLoading(false);
        setError('');
      }
    } catch (err) {
      setError('Failed to fetch frames from simulator');
      setIsLoading(false);
    }
  };

  // Start simulator
  const startSimulator = async () => {
    try {
      const response = await fetch(`${API_URL}/start`);
      if (response.ok) {
        setIsSimulatorRunning(true);
        setError('');
      }
    } catch (err) {
      setError('Failed to start simulator');
    }
  };

  // Stop simulator
  const stopSimulator = async () => {
    try {
      const response = await fetch(`${API_URL}/stop`);
      if (response.ok) {
        setIsSimulatorRunning(false);
      }
    } catch (err) {
      setError('Failed to stop simulator');
    }
  };

  // Auto-fetch data every 2 seconds
  useEffect(() => {
    const fetchData = async () => {
      const isConnected = await checkSimulatorStatus();
      if (isConnected) {
        await fetchFrames();
      }
    };

    // Initial fetch
    fetchData();

    // Set up interval for continuous fetching
    const interval = setInterval(fetchData, 2000); // Fetch every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const latestFrame = frames.length > 0 ? frames[frames.length - 1] : null;

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚁 Drone Live Dataset (Simulator)</h1>
        
        {/* Connection Status */}
        <div className="status-section">
          <div className={`connection-status ${error ? 'error' : 'connected'}`}>
            Status: {error ? 'Disconnected' : 'Connected'}
          </div>
          <div className="simulator-status">
            Simulator: {isSimulatorRunning ? '🟢 Running' : '🔴 Stopped'}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="controls">
          <button 
            onClick={startSimulator} 
            disabled={isSimulatorRunning}
            className="btn btn-start"
          >
            ▶️ Start Simulator
          </button>
          <button 
            onClick={stopSimulator} 
            disabled={!isSimulatorRunning}
            className="btn btn-stop"
          >
            ⏹️ Stop Simulator
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-refresh"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <h3>⚠️ Connection Error</h3>
            <p>{error}</p>
            <div className="error-instructions">
              <p><strong>To fix this:</strong></p>
              <ol>
                <li>Open terminal in your project directory</li>
                <li>Install requirements: <code>pip install flask flask-cors</code></li>
                <li>Run simulator: <code>python simulator.py</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isLoading && !error ? (
          <div className="loading">
            <div className="spinner">🚁</div>
            <p>Waiting for frames... (run the simulator)</p>
          </div>
        ) : frames.length > 0 ? (
          <div className="data-display">
            {/* Summary Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Frames</h3>
                <div className="stat-value">{frames.length}</div>
              </div>
              <div className="stat-card">
                <h3>Latest Frame ID</h3>
                <div className="stat-value">{latestFrame?.frame_id || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Battery Level</h3>
                <div className="stat-value">{latestFrame?.battery_level?.toFixed(1) || 0}%</div>
              </div>
              <div className="stat-card">
                <h3>Altitude</h3>
                <div className="stat-value">{latestFrame?.altitude?.toFixed(1) || 0}m</div>
              </div>
            </div>

            {/* Latest Frame Details */}
            {latestFrame && (
              <div className="latest-frame">
                <h2>📡 Latest Telemetry</h2>
                <div className="telemetry-grid">
                  <div className="telemetry-section">
                    <h3>📍 Position</h3>
                    <div className="data-row">
                      <span>Latitude:</span>
                      <span className="data-value">{latestFrame.latitude}°</span>
                    </div>
                    <div className="data-row">
                      <span>Longitude:</span>
                      <span className="data-value">{latestFrame.longitude}°</span>
                    </div>
                    <div className="data-row">
                      <span>Altitude:</span>
                      <span className="data-value">{latestFrame.altitude}m</span>
                    </div>
                  </div>

                  <div className="telemetry-section">
                    <h3>🔋 System</h3>
                    <div className="data-row">
                      <span>Battery:</span>
                      <span className="data-value">{latestFrame.battery_level}%</span>
                    </div>
                    <div className="data-row">
                      <span>Mode:</span>
                      <span className="data-value">{latestFrame.mode}</span>
                    </div>
                    <div className="data-row">
                      <span>Speed:</span>
                      <span className="data-value">{latestFrame.speed} m/s</span>
                    </div>
                  </div>

                  <div className="telemetry-section">
                    <h3>🌡️ Environment</h3>
                    <div className="data-row">
                      <span>Temperature:</span>
                      <span className="data-value">{latestFrame.temperature}°C</span>
                    </div>
                    <div className="data-row">
                      <span>Humidity:</span>
                      <span className="data-value">{latestFrame.humidity}%</span>
                    </div>
                    <div className="data-row">
                      <span>Wind Speed:</span>
                      <span className="data-value">{latestFrame.wind_speed} m/s</span>
                    </div>
                  </div>

                  <div className="telemetry-section">
                    <h3>📡 GPS</h3>
                    <div className="data-row">
                      <span>Satellites:</span>
                      <span className="data-value">{latestFrame.gps_satellites}</span>
                    </div>
                    <div className="data-row">
                      <span>Signal:</span>
                      <span className="data-value">{latestFrame.signal_strength}%</span>
                    </div>
                  </div>
                </div>

                <div className="timestamp">
                  Last Update: {new Date(latestFrame.timestamp).toLocaleString()}
                </div>
              </div>
            )}

            {/* Recent Frames List */}
            <div className="frames-list">
              <h2>📊 Recent Frames ({frames.length})</h2>
              <div className="frames-container">
                {frames.slice(-10).reverse().map((frame, idx) => (
                  <div key={frame.frame_id} className="frame-item">
                    <div className="frame-header">
                      <span className="frame-id">Frame #{frame.frame_id}</span>
                      <span className="frame-time">
                        {new Date(frame.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="frame-data">
                      <span>Lat: {frame.latitude}</span>
                      <span>Lng: {frame.longitude}</span>
                      <span>Alt: {frame.altitude}m</span>
                      <span>Battery: {frame.battery_level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          !error && (
            <div className="no-data">
              <h2>No frames available</h2>
              <p>Click "Start Simulator" to begin generating drone data</p>
            </div>
          )
        )}
      </header>
    </div>
  );
}

export default App;