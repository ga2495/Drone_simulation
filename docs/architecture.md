# Architecture

## Real-time telemetry path

1. `simulator/simulator.py` creates telemetry frames.
2. Flask exposes the frames through REST endpoints.
3. The React dashboard polls the API and renders current/recent telemetry.

## Data ingestion path

1. A client can send image/metadata data to the Node/Express service.
2. The backend validates the request and stores the received data according to its implementation.
3. Large generated uploads remain outside Git.
