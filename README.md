# Kalimaya

Aplikasi internal kantor (Android + Web Admin + API) dengan role-based access, file center per divisi, project tracking, dan absensi.

## Target
- **Nama app:** Kalimaya
- **Deploy awal:** VPS staging
- **Deploy final:** Synology kantor
- **Bahasa UI:** Indonesia + English (bilingual)

## Stack (recommended)
- Backend API: NestJS + PostgreSQL + Redis
- Web Admin: Next.js
- Mobile: Flutter
- Reverse proxy: Nginx
- Container: Docker Compose

## Modules
1. Auth + RBAC
2. File/Folder per divisi
3. Project tracker
4. Attendance
5. Employee directory
6. Audit logs

## Repo layout
- `backend/` API + DB migrations
- `web-admin/` admin dashboard
- `mobile/` Flutter app
- `docs/` product, architecture, api spec
- `docker/` compose & infra files
