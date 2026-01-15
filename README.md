# AtlasOps

AI-powered job application management and resume generation platform.

## Features

- **Job Ingestion**: Paste job posting URLs and automatically extract structured data
- **Resume Generation**: AI-tailored resumes matched to specific job requirements
- **Application Tracking**: Full lifecycle tracking with reminders and follow-ups
- **Company Deep Dive**: AI-generated company research and interview prep
- **Gap Analysis**: Improvement suggestions when applications don't succeed

## Tech Stack

### Backend
- Python 3.11+
- FastAPI (async web framework)
- SQLAlchemy 2.0 (async ORM)
- PostgreSQL (database)
- Alembic (migrations)
- Celery + Redis (background tasks)
- OpenAI API (LLM features)

### Frontend
- Vue 3 + Vite
- Vue Router
- Pinia (state management)
- Tailwind CSS

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis

### Backend Setup

    ```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Start development server
uvicorn app:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Running Celery Workers

```bash
# Start worker
celery -A atlasops.workers.tasks worker --loglevel=info

# Start beat scheduler (for periodic tasks)
celery -A atlasops.workers.tasks beat --loglevel=info
```

## Project Structure

```
.
├── app.py                 # FastAPI entrypoint
├── alembic/               # Database migrations
├── atlasops/              # Main application package
│   ├── api/               # API routes
│   │   └── v1/            # API version 1
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   ├── workers/           # Celery tasks
│   ├── prompts/           # LLM prompt templates
│   └── utils/             # Utility functions
├── frontend/              # Vue 3 SPA
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Vue components
│   │   ├── router/        # Vue Router config
│   │   ├── stores/        # Pinia stores
│   │   └── views/         # Page components
│   └── ...
└── internal/              # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Jobs
- `POST /api/v1/jobs/ingest` - Submit job URLs for processing
- `GET /api/v1/jobs` - List all jobs
- `GET /api/v1/jobs/{id}` - Get job details
- `DELETE /api/v1/jobs/{id}` - Delete job

### Profile
- `GET /api/v1/profile` - Get user profile
- `PATCH /api/v1/profile` - Update profile
- `POST /api/v1/profile/enhance` - AI profile enhancement

### Applications
- `GET /api/v1/applications` - List applications
- `POST /api/v1/applications` - Create application
- `PATCH /api/v1/applications/{id}` - Update application
- `POST /api/v1/applications/{id}/followup` - Schedule follow-up
- `POST /api/v1/applications/{id}/interview-prep` - Generate interview prep
- `POST /api/v1/applications/{id}/improvement` - Generate improvement suggestions

## Environment Variables

See `.env.example` for all required environment variables.

## Deployment

The project uses GitHub Actions for automated deployment to a DigitalOcean droplet.

Required secrets:
- `DROPLET_IP` - Server IP address
- `USERNAME` - SSH username
- `SSH_KEY` - SSH private key

## License

Private - All rights reserved.
