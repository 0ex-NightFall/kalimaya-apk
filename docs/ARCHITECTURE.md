# Kalimaya Architecture

## Environments

### 1. Staging (current)
- Host: VPS
- Purpose: development, testing, demo
- Storage: local disk on VPS

### 2. Production (later)
- Host: Synology NAS / office server
- Purpose: internal office production
- Storage: Synology shared folders

## High-level flow

Android App / Web Admin
        |
        v
   Nginx Reverse Proxy
        |
        v
     Backend API
        |
  -----------------------
  |         |           |
  v         v           v
Postgres   Redis     File Storage
                     (VPS now / Synology later)

## Access model
- Users belong to one division
- Users can have one or more roles
- Roles map to permissions
- Every file/folder/project query filtered by permission middleware

## Key modules

### Auth
- email/username + password
- refresh token
- future: OTP / 2FA

### RBAC
- Director
- Finance
- Technical
- HR/Humas
- Employee
- Admin IT

### File Center
- folders by division
- private/shared flags
- upload/download via API
- no direct raw SMB exposure to mobile app

### Attendance
- check in / check out
- location optional
- selfie optional later

### Project Tracker
- project list
- members
- status
- files attached

### Audit Logs
- every sensitive action logged

## Bilingual strategy
- API stores labels neutral
- mobile + web use i18n dictionary
- locales: `id`, `en`

## Deployment path
1. Build on VPS
2. Stabilize with Docker Compose
3. Move same containers/config to Synology container stack
4. Mount Synology shared folders as storage path
