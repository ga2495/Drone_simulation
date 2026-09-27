# Drone Simulation & Telemetry Dashboard

A full-stack drone telemetry simulation project consisting of:

- **Python/Flask simulator** — generates realistic telemetry frames and exposes REST endpoints.
- **React dashboard** — visualizes live telemetry, simulator state, and recent frames.
- **Node/Express ingestion backend** — accepts image/metadata uploads and can be extended for dataset ingestion.
- **Sample dataset** — a small CSV example for reproducible development.

## Architecture

```text
Python Drone Simulator
        |
        | REST API :5000
        v
React Telemetry Dashboard

Optional ingestion path:
Drone/Image source -> Node/Express backend -> dataset storage
```

## Telemetry

The simulator can generate values such as:

- latitude / longitude
- altitude
- battery
- temperature / humidity
- wind speed
- GPS satellites
- signal strength
- pitch / roll / yaw
- speed
- flight mode
- armed state
- timestamp

Movement modes include hover, circle, figure-eight, and straight-line motion when supported by the simulator configuration.

## Run the simulator

```bash
cd simulator
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python simulator.py
```

The simulator normally runs on:

`http://localhost:5000`

Useful endpoints include:

- `/`
- `/status`
- `/frames`
- `/latest`
- `/start`
- `/stop`

## Run the React dashboard

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally:

`http://localhost:5173`

The dashboard is configured to communicate with the local simulator API. If your frontend uses a different API URL, update the API configuration in the frontend source.

## Run the Node ingestion backend

If you need the upload/dataset ingestion component:

```bash
cd backend
npm install
npm start
```

The exact upload route and request format are documented by the server implementation.

Generated uploads and `node_modules` are intentionally excluded from Git.

## Data

`data/sample_dataset.csv` is included when the source project contains a dataset. Large generated image collections are not committed because Git repositories should contain reproducible source/configuration rather than thousands of generated binary artifacts.

## GitHub setup

```bash
git init
git add .
git commit -m "Complete drone simulation and telemetry dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/drone-simulation-project.git
git push -u origin main
```

## Project structure

```text
drone-simulation-project/
├── simulator/
├── backend/
├── frontend/
├── data/
├── docs/
├── .gitignore
├── LICENSE
└── README.md
```

## Notes

The simulator and dashboard are the primary real-time path. The Node backend is kept as a separate ingestion service because it has a different responsibility from the Flask telemetry API.


## Deployment

- **Telemetry API:** Render (`simulator/`)
- **React dashboard:** Vercel (`frontend/`)
- Set `VITE_API_URL` in Vercel to the public Render API URL.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the exact steps.
