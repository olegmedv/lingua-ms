# LinguaCMS

Language learning platform (Duolingo-style) for Indigenous languages.

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 15+](https://www.postgresql.org/download/)

Docker is **not required**. Just a local PostgreSQL instance.

## 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE linguacms;
```

Default connection string in `server/LinguaCMS.API/appsettings.json`:

```
Host=localhost;Port=5432;Database=linguacms;Username=postgres;Password=postgres
```

Change `Username` and `Password` if your PostgreSQL credentials are different.

## 2. Run Backend

```bash
cd server
dotnet run --project LinguaCMS.API
```

On first run:
- EF Core migration runs automatically (creates all tables)
- Admin account is seeded automatically

Backend starts at **http://localhost:5292**

Swagger UI: **http://localhost:5292/swagger**

## 3. Run Frontend

```bash
cd client
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

## Admin Credentials

| Field    | Value               |
|----------|---------------------|
| Email    | admin@linguacms.com |
| Password | Admin123!           |

Admin account is created automatically on first backend start.

## Quick Test Flow

1. Start PostgreSQL
2. `cd server && dotnet run --project LinguaCMS.API`
3. `cd client && npm install && npm run dev`
4. Open http://localhost:5173
5. Log in as admin (credentials above)
6. Go to Admin tab -> Languages -> Add a language (set Published = true)
7. Go to that language -> Add lessons -> Add exercises
8. Register a new student account (or log out and register)
9. Student sees the language -> opens lessons -> plays exercises

## Project Structure

```
linguacms/
  server/                    .NET 9 backend
    LinguaCMS.API/           Controllers, Program.cs, Swagger
    LinguaCMS.Application/   MediatR handlers, DTOs
    LinguaCMS.Domain/        Entities, Enums
    LinguaCMS.Infrastructure/ DbContext, Migrations
  client/                    React 19 + Vite + TypeScript
    src/
      api/                   API client
      store/                 Zustand (auth)
      pages/student/         Dashboard, LessonTree, ExercisePlayer
      pages/admin/           LanguageManager, LessonManager, ExerciseBuilder
      components/exercises/  8 exercise type components
```

## API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | /api/auth/register | - |
| POST | /api/auth/login | - |
| GET | /api/auth/me | Bearer |
| GET | /api/languages | - |
| GET | /api/languages/{id} | - |
| POST/PUT/DELETE | /api/languages/{id} | Admin |
| GET | /api/languages/{langId}/lessons | - |
| GET | /api/lessons/{id} | - |
| POST/PUT/DELETE | /api/lessons/{id} | Admin |
| GET | /api/lessons/{lessonId}/exercises | - |
| POST/PUT/DELETE | /api/exercises/{id} | Admin |
| POST | /api/progress/submit | Bearer |
| GET | /api/progress/my | Bearer |
| GET | /api/progress/stats | Bearer |
| POST | /api/files/upload | Admin |

## Config to Change

| What | Where | Default |
|------|-------|---------|
| DB connection | `server/LinguaCMS.API/appsettings.json` → ConnectionStrings | localhost:5432, postgres/postgres |
| JWT secret | `server/LinguaCMS.API/appsettings.json` → Jwt:Key | hardcoded dev key |
| API URL for frontend | `client/.env` → VITE_API_URL | http://localhost:5292 |
