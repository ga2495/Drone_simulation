# Deployment Guide

This repository is a small monorepo with two deployable pieces:

1. `simulator/` — Flask telemetry API, deployed as a Render Web Service.
2. `frontend/` — React/Vite dashboard, deployed as a Vercel project.

The Node/Express ingestion backend is kept separately because the dashboard's real-time telemetry path uses the Flask simulator.

## 1. Push the repository to GitHub

```powershell
git init
git add .
git commit -m "Deploy-ready drone simulation dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/drone-simulation-project.git
git push -u origin main
```

## 2. Deploy the simulator on Render

The repository includes `render.yaml`, so Render can use the Blueprint configuration.

If configuring manually:

- Service type: Web Service
- Runtime: Python
- Root Directory: `simulator`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn simulator:<flask_app_variable>`

The exact Flask variable is already represented in `render.yaml`.

After deployment, Render gives the API a public `onrender.com` URL.

## 3. Deploy the React dashboard

Create a Vercel project from the same GitHub repository.

Use:

- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

Add this environment variable in Vercel:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Redeploy after setting the variable.

## 4. Verify

Open the Render URL first and verify the simulator API responds.

Then open the Vercel URL and verify that the dashboard loads telemetry from the Render API.

If the browser reports CORS errors, update the Flask CORS configuration to allow the exact Vercel domain.

## Local development

Simulator:

```powershell
cd simulator
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python simulator.py
```

Frontend:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

For local development, `.env` should contain:

```text
VITE_API_URL=http://localhost:5000
```
