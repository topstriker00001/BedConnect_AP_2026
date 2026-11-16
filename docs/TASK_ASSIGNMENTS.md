# BedConnect team tasks

Each member owns one module. Work only on the assigned branch, then open a pull request to `main`.

| Member | Branch | Ownership | Definition of done |
|---|---|---|---|
| **Rohan Pratap Singh** | `feature/database-hospital-api` | Prisma schema, PostgreSQL migration/seed, hospital and resource-availability REST APIs | City/type search works; hospital staff can update resource counts; Prisma Studio shows seeded data. |
| **Kartik Sharma** | `feature/auth-rbac` | Patient/hospital-admin registration & login, bcrypt password hashing, JWT auth, RBAC middleware | Protected endpoints reject unauthenticated users; patients and hospital admins see only permitted actions. |
| **Daksh Goyal** | `feature/patient-portal` | React patient UI: home, city/type filters, hospital cards, request form and request-status page | Patient can search a city, see availability, create a request and view own request status. |
| **Yugraj Saini** | `feature/hospital-admin-portal` | Hospital admin dashboard: availability update form, incoming requests, approve/reject actions | Hospital admin can update only their hospital and approve/reject only its requests. |

## Shared rules

1. Pull `main` before starting work.
2. Make small commits with clear messages, such as `feat(auth): add JWT login`.
3. Do not commit `.env`, `node_modules`, or database passwords.
4. Every pull request needs one teammate review and a short test note.
5. Integrate in this order: database → auth → hospital APIs → patient portal → admin portal.
