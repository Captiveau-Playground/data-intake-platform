# Football Intel - Data Intake Platform

Admin dashboard for football social analytics. Upload Instagram comment CSV exports + post metadata, then system ingests data into PostgreSQL.

## Quick Start

### Local Development
```bash
npm run dev
```

### Docker
```bash
docker-compose up -d --build
```

### Access
- Web: http://localhost:3000
- API: http://localhost:3001
- Login: admin / admin123

## Tech Stack
- Web: Next.js 14
- API: FastAPI (Python 3.13)
- DB: PostgreSQL 16
- Infra: Docker

## CSV Format
```csv
comment_id,created_at,profile_pic_url,text,user_id,username
```