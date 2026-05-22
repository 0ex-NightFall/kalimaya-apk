# Kalimaya PRD

## Product summary
Kalimaya is an internal office super app for secure file access, project tracking, employee attendance, and role-based operational workflows.

Kalimaya adalah aplikasi internal kantor untuk akses file aman, tracking project, absensi karyawan, dan workflow operasional berbasis role/divisi.

## Users

### Director / Direktur
- Access all divisions
- View all files, projects, attendance, employees, audit logs

### Finance / Keuangan
- Access finance files
- View project financial docs
- Track payment-related project info

### Technical / Teknis
- Access technical project files
- Update project progress
- View assigned projects

### HR / Humas
- Manage employee directory
- View attendance reports
- Manage announcements later

### Employee / Karyawan
- Check in/out
- View own attendance
- Access own division files
- View assigned projects

## MVP features

### 1. Login
- username/email
- password
- JWT session
- role-aware home screen

### 2. File Center
- list folders
- list files
- upload/download
- division permission filtering

### 3. Project Tracker
- list projects
- create/update project (authorized roles)
- assign members
- attach files

### 4. Attendance
- check in
- check out
- history
- team report for HR/director

### 5. Employee Directory
- list employees
- employee profile
- division/role info

### 6. Admin Panel
- manage users
- manage roles
- manage divisions
- view audit logs

## Non-goals for MVP
- payroll
- full accounting
- real-time chat
- digital signature
- complex approval workflow
- offline sync

## Security requirements
- hashed passwords
- HTTPS
- RBAC on all endpoints
- audit sensitive actions
- no public direct file paths
- backup-ready storage layout

## MVP acceptance criteria
- Director can access all files/projects/employees
- Finance cannot access technical-private folders
- Technical cannot access finance folders
- HR can view attendance and employees
- Employee can check in/out and see own data
- All file downloads logged
