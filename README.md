# JobTech

JobTech is a recruitment management application developed as a capstone project. It supports the hiring workflow from publishing job offers to reviewing applications, planning interviews, and evaluating candidates.

## Features

- Candidate and recruiter workflows
- Job offer and application management
- Interview planning and candidate evaluation
- Recruitment dashboards and reports
- Optional AI-assisted CV summaries through NVIDIA NIM, with a local fallback

## Technology

- **Backend:** Django 4.2 and Python
- **Frontend:** React, TypeScript, and Vite
- **Database:** MySQL 8
- **Supporting services:** Redis
- **Local orchestration:** Docker Compose

## Run locally with Docker

Requirements: Docker and Docker Compose.

1. Create a local environment file:

   ```sh
   cp .env.example .env
   ```

2. Set a Django `SECRET_KEY` and review the development database and email settings. The example values are for local development only.
3. Build and start the services:

   ```sh
   docker compose up --build
   ```

The Compose configuration exposes the frontend at [http://localhost:5173](http://localhost:5173) and the backend at [http://localhost:8000](http://localhost:8000).

To enable the optional NVIDIA-powered CV summary integration, configure `NVIDIA_API_KEY`; the project documents a local fallback when it is not set.

## Repository layout

- `app/backend/` — Django application and API
- `app/frontend/` — React and TypeScript client
- `docker-compose.yml` — local backend, frontend, MySQL, and Redis services
- `EXPLICATION_CODEBASE_DEBUTANT.md` — French-language codebase guide
