# Kalimaya Database Schema (MVP)

## users
- id (uuid, pk)
- full_name (varchar)
- username (varchar, unique)
- email (varchar, unique)
- password_hash (varchar)
- division_id (uuid, fk divisions.id)
- is_active (bool)
- created_at (timestamp)
- updated_at (timestamp)

## roles
- id (uuid, pk)
- name (varchar, unique)
- code (varchar, unique) // DIRECTOR, FINANCE, TECH, HR, EMPLOYEE, ADMIN_IT

## user_roles
- user_id (uuid, fk users.id)
- role_id (uuid, fk roles.id)

## permissions
- id (uuid, pk)
- code (varchar, unique)
- description (text)

## role_permissions
- role_id (uuid, fk roles.id)
- permission_id (uuid, fk permissions.id)

## divisions
- id (uuid, pk)
- name (varchar)
- code (varchar, unique)

## folders
- id (uuid, pk)
- name (varchar)
- parent_id (uuid, nullable fk folders.id)
- division_id (uuid, fk divisions.id)
- visibility (varchar) // division, private, shared
- created_by (uuid, fk users.id)
- created_at (timestamp)

## files
- id (uuid, pk)
- folder_id (uuid, fk folders.id)
- name (varchar)
- mime_type (varchar)
- size_bytes (bigint)
- storage_path (text)
- uploaded_by (uuid, fk users.id)
- created_at (timestamp)

## projects
- id (uuid, pk)
- name (varchar)
- code (varchar, unique)
- division_id (uuid, fk divisions.id)
- status (varchar) // planning, ongoing, on_hold, done
- progress_percent (int)
- pic_user_id (uuid, fk users.id)
- start_date (date)
- end_date (date)
- created_at (timestamp)

## project_members
- project_id (uuid, fk projects.id)
- user_id (uuid, fk users.id)
- role_in_project (varchar)

## attendance
- id (uuid, pk)
- user_id (uuid, fk users.id)
- date (date)
- check_in_at (timestamp, nullable)
- check_out_at (timestamp, nullable)
- check_in_lat (numeric, nullable)
- check_in_lng (numeric, nullable)
- check_out_lat (numeric, nullable)
- check_out_lng (numeric, nullable)
- note (text, nullable)

## audit_logs
- id (uuid, pk)
- user_id (uuid, fk users.id)
- action (varchar)
- module (varchar)
- entity_type (varchar)
- entity_id (uuid, nullable)
- metadata_json (jsonb)
- ip_address (varchar)
- user_agent (text)
- created_at (timestamp)
