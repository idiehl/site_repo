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
- `POST /api/v1/auth/password-reset/request` - Request password reset
- `POST /api/v1/auth/password-reset/confirm` - Confirm password reset

### Jobs
- `POST /api/v1/jobs/ingest` - Submit job URLs for processing
- `GET /api/v1/jobs` - List all jobs
- `GET /api/v1/jobs/{id}` - Get job details
- `DELETE /api/v1/jobs/{id}` - Delete job

### Profile
- `GET /api/v1/profile` - Get user profile
- `PATCH /api/v1/profile` - Update profile
- `POST /api/v1/profile/enhance` - AI profile enhancement

### ElectraCast
- `GET /api/v1/electracast/account` - Get ElectraCast account summary
- `GET /api/v1/electracast/profile` - Get or create ElectraCast profile
- `PATCH /api/v1/electracast/profile` - Update ElectraCast profile

### Applications
- `GET /api/v1/applications` - List applications
- `POST /api/v1/applications` - Create application
- `PATCH /api/v1/applications/{id}` - Update application
- `POST /api/v1/applications/{id}/followup` - Schedule follow-up
- `POST /api/v1/applications/{id}/interview-prep` - Generate interview prep
- `POST /api/v1/applications/{id}/improvement` - Generate improvement suggestions

## Environment Variables

See `.env.example` for all required environment variables.

### Stripe Billing Configuration

To enable paid subscriptions, configure these Stripe environment variables:

```bash
# Stripe API Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...        # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...      # Webhook signing secret

# Stripe Price ID (create a subscription product in Stripe Dashboard)
STRIPE_PRICE_ID=price_...            # Monthly subscription price ID

# Redirect URLs after checkout
STRIPE_SUCCESS_URL=https://yourdomain.com/profile?billing=success
STRIPE_CANCEL_URL=https://yourdomain.com/profile?billing=cancel
```

**Setting up Stripe:**

1. Create a Stripe account at https://stripe.com
2. In the Stripe Dashboard, create a Product for your subscription (e.g., "AtlasOps Pro")
3. Add a recurring Price to the product (e.g., $9.99/month)
4. Copy the Price ID (starts with `price_`)
5. Set up a webhook endpoint pointing to `/api/v1/billing/webhook`
6. Subscribe to these webhook events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## User Management Scripts

### Setup Test Users

Create admin and test users for development:

```bash
python scripts/setup_users.py
```

This creates:
- **Admin user** (iajdiehl@gmail.com) with full access to all features
- **Free tier test user** for testing subscription limitations

### List Users

View all users and their subscription status:

```bash
python scripts/setup_users.py --list
```

### Make User Admin

Promote an existing user to admin:

```bash
python scripts/make_admin.py user@example.com
```

## Deployment

The project uses GitHub Actions for automated deployment to a DigitalOcean droplet.

Required secrets:
- `DROPLET_IP` - Server IP address
- `USERNAME` - SSH username
- `SSH_KEY` - SSH private key

## License

Private - All rights reserved.
