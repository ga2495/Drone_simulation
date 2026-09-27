import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [frames, setFrames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);

  // Render production URL comes from Vercel environment variables.
  // Local development falls back to localhost.
  const API_URL =
    process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // --------------------------------------------------
  // Check simulator status
  // --------------------------------------------------
  const checkSimulatorStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/status`);

      if (!response.ok) {
        throw new Error(`Status request failed: ${response.status}`);
      }

      const data = await response.json();

      setIsSimulatorRunning(Boolean(data.is_running));
      setError('');

      return true;
    } catch (err) {
      console.error('Status error:', err);

      setIsSimulatorRunning(false);
      setError('Cannot connect to the drone simulator API.');

      return false;
    }
  }, [API_URL]);

  // --------------------------------------------------
  // Fetch telemetry frames
  // --------------------------------------------------
  const fetchFrames = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/frames`);

      if (!response.ok) {
        throw new Error(`Frames request failed: ${response.status}`);
      }

      const data = await response.json();

      // API should return an array.
      setFrames(Array.isArray(data) ? data : []);
      setIsLoading(false);

      return true;
    } catch (err) {
      console.error('Frames error:', err);

      setFrames([]);
      setIsLoading(false);
      setError('Failed to fetch drone telemetry data.');

      return false;
    }
  }, [API_URL]);

  // --------------------------------------------------
  // Start simulator
  // --------------------------------------------------
  const startSimulator = async () => {
    try {
      setError('');

      const response = await fetch(`${API_URL}/start`);

      if (!response.ok) {
        throw new Error(`Start request failed: ${response.status}`);
      }

      await response.json();

      setIsSimulatorRunning(true);

      // Fetch immediately after starting.
      await fetchFrames();
    } catch (err) {
      console.error('Start simulator error:', err);

      setError('Failed to start the drone simulator.');
    }
  };

  // --------------------------------------------------
  // Stop simulator
  // --------------------------------------------------
  const stopSimulator = async () => {
    try {
      setError('');

      const response = await fetch(`${API_URL}/stop`);

      if (!response.ok) {
        throw new Error(`Stop request failed: ${response.status}`);
      }

      await response.json();

      setIsSimulatorRunning(false);
    } catch (err) {
      console.error('Stop simulator error:', err);

      setError('Failed to stop the drone simulator.');
    }
  };

  // --------------------------------------------------
  // Refresh all data
  // --------------------------------------------------
  const refreshData = async () => {
    setIsLoading(true);
    setError('');

    const connected = await checkSimulatorStatus();

    if (connected) {
      await fetchFrames();
    } else {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // Automatically update every 2 seconds
  // --------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      const connected = await checkSimulatorStatus();

      if (connected && mounted) {
        await fetchFrames();
      } else if (mounted) {
        setIsLoading(false);
      }
    };

    // Initial request.
    fetchData();

    // Continue polling.
    const interval = setInterval(fetchData, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [checkSimulatorStatus, fetchFrames]);

  // --------------------------------------------------
  // Latest telemetry frame
  // --------------------------------------------------
  const latestFrame =
    frames.length > 0 ? frames[frames.length - 1] : null;

  return (
    <div className="App">
      <header className="App-header">

        {/* -------------------------------------------- */}
        {/* Header */}
        {/* -------------------------------------------- */}

        <h1>🚁 Drone Live Dataset Simulator</h1>

        <p className="subtitle">
          Real-time drone telemetry monitoring dashboard
        </p>

        {/* -------------------------------------------- */}
        {/* Connection Status */}
        {/* -------------------------------------------- */}

        <div className="status-section">

          <div
            className={`connection-status ${
              error ? 'error' : 'connected'
            }`}
          >
            Status: {error ? '🔴 Disconnected' : '🟢 Connected'}
          </div>

          <div className="simulator-status">
            Simulator:{' '}
            {isSimulatorRunning
              ? '🟢 Running'
              : '🔴 Stopped'}
          </div>

        </div>

        {/* -------------------------------------------- */}
        {/* Controls */}
        {/* -------------------------------------------- */}

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
            onClick={refreshData}
            className="btn btn-refresh"
          >
            🔄 Refresh
          </button>

        </div>

        {/* -------------------------------------------- */}
        {/* Error */}
        {/* -------------------------------------------- */}

        {error && (
          <div className="error-message">

            <h3>⚠️ Connection Error</h3>

            <p>{error}</p>

            <div className="error-instructions">

              <p>
                <strong>
                  Unable to connect to the deployed drone simulator.
                </strong>
              </p>

              <p>
                Please check that the Render API is running and that
                <code> REACT_APP_API_URL </code>
                is configured correctly in Vercel.
              </p>

            </div>

          </div>
        )}

        {/* -------------------------------------------- */}
        {/* Loading */}
        {/* -------------------------------------------- */}

        {isLoading && !error && (
          <div className="loading">

            <div className="spinner">
              🚁
            </div>

            <p>
              Connecting to drone simulator...
            </p>

          </div>
        )}

        {/* -------------------------------------------- */}
        {/* No Data */}
        {/* -------------------------------------------- */}

        {!isLoading &&
          !error &&
          frames.length === 0 && (
            <div className="no-data">

              <h2>📡 No telemetry frames available</h2>

              <p>
                Click "Start Simulator" to begin generating
                drone telemetry data.
              </p>

            </div>
          )}

        {/* -------------------------------------------- */}
        {/* Main Telemetry Dashboard */}
        {/* -------------------------------------------- */}

        {!isLoading &&
          !error &&
          frames.length > 0 &&
          latestFrame && (

            <div className="data-display">

              {/* ---------------------------------------- */}
              {/* Summary Statistics */}
              {/* ---------------------------------------- */}

              <div className="stats-grid">

                <div className="stat-card">
                  <h3>Total Frames</h3>

                  <div className="stat-value">
                    {frames.length}
                  </div>
                </div>

                <div className="stat-card">
                  <h3>Latest Frame</h3>

                  <div className="stat-value">
                    {latestFrame.frame_id ?? 0}
                  </div>
                </div>

                <div className="stat-card">
                  <h3>Battery</h3>

                  <div className="stat-value">
                    {Number(
                      latestFrame.battery_level ?? 0
                    ).toFixed(1)}
                    %
                  </div>
                </div>

                <div className="stat-card">
                  <h3>Altitude</h3>

                  <div className="stat-value">
                    {Number(
                      latestFrame.altitude ?? 0
                    ).toFixed(1)}
                    m
                  </div>
                </div>

              </div>

              {/* ---------------------------------------- */}
              {/* Latest Telemetry */}
              {/* ---------------------------------------- */}

              <div className="latest-frame">

                <h2>📡 Latest Telemetry</h2>

                <div className="telemetry-grid">

                  {/* Position */}

                  <div className="telemetry-section">

                    <h3>📍 Position</h3>

                    <div className="data-row">
                      <span>Latitude:</span>

                      <span className="data-value">
                        {latestFrame.latitude ?? 'N/A'}°
                      </span>
                    </div>

                    <div className="data-row">
                      <span>Longitude:</span>

                      <span className="data-value">
                        {latestFrame.longitude ?? 'N/A'}°
                      </span>
                    </div>

                    <div className="data-row">
                      <span>Altitude:</span>

                      <span className="data-value">
                        {latestFrame.altitude ?? 0} m
                      </span>
                    </div>

                  </div>

                  {/* System */}

                  <div className="telemetry-section">

                    <h3>🔋 System</h3>

                    <div className="data-row">
                      <span>Battery:</span>

                      <span className="data-value">
                        {latestFrame.battery_level ?? 0}%
                      </span>
                    </div>

                    <div className="data-row">
                      <span>Flight Mode:</span>

                      <span className="data-value">
                        {latestFrame.mode ?? 'N/A'}
                      </span>
                    </div>

                    <div className="data-row">
                      <span>Speed:</span>

                      <span className="data-value">
                        {latestFrame.speed ?? 0} m/s
                      </span>
                    </div>

                  </div>

                  {/* Environment */}

                  <div className="telemetry-section">

                    <h3>🌡️ Environment</h3>

                    <div className="data-row">
                      <span>Temperature:</span>

                      <span className="data-value">
                        {latestFrame.temperature ?? 0}°C
                      </span>
                    </div>

                    <div className="data-row">
                      <span>Humidity:</span>

                      <span className="data-value">
                        {latestFrame.humidity ?? 0}%
                      </span>
                    </div>

                    <div className="data-row">
                      <span>Wind Speed:</span>

                      <span className="data-value">
                        {latestFrame.wind_speed ?? 0} m/s
                      </span>
                    </div>

                  </div>

                  {/* GPS */}

                  <div className="telemetry-section">

                    <h3>🛰️ GPS</h3>

                    <div className="data-row">
                      <span>Satellites:</span>

                      <span className="data-value">
                        {latestFrame.gps_satellites ?? 0}
                      </span>
                    </div>

                    <div className="data-row">
                      <span>Signal:</span>

                      <span className="data-value">
                        {latestFrame.signal_strength ?? 0}%
                      </span>
                    </div>

                  </div>

                </div>

                {/* Timestamp */}

                <div className="timestamp">

                  Last Update:{' '}
                  {latestFrame.timestamp
                    ? new Date(
                        latestFrame.timestamp
                      ).toLocaleString()
                    : 'N/A'}

                </div>

              </div>

              {/* ---------------------------------------- */}
              {/* Recent Frames */}
              {/* ---------------------------------------- */}

              <div className="frames-list">

                <h2>
                  📊 Recent Frames ({frames.length})
                </h2>

                <div className="frames-container">

                  {frames
                    .slice(-10)
                    .reverse()
                    .map((frame) => (

                      <div
                        key={frame.frame_id}
                        className="frame-item"
                      >

                        <div className="frame-header">

                          <span className="frame-id">
                            Frame #{frame.frame_id}
                          </span>

                          <span className="frame-time">
                            {frame.timestamp
                              ? new Date(
                                  frame.timestamp
                                ).toLocaleTimeString()
                              : 'N/A'}
                          </span>

                        </div>

                        <div className="frame-data">

                          <span>
                            Lat: {frame.latitude ?? 'N/A'}
                          </span>

                          <span>
                            Lng: {frame.longitude ?? 'N/A'}
                          </span>

                          <span>
                            Alt: {frame.altitude ?? 0}m
                          </span>

                          <span>
                            Battery:{' '}
                            {frame.battery_level ?? 0}%
                          </span>

                        </div>

                      </div>

                    ))}

                </div>

              </div>

            </div>
          )}

      </header>
    </div>
  );
}

export default App;