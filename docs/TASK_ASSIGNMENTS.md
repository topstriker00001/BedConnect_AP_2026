# BedConnect team tasks

Each member owns one module. Work only on the assigned branch, then open a pull request to `main`.

| Member | Branch | Ownership | Definition of done |
|---|---|---|---|
| **Rohan Pratap Singh** | `feature/patient-portal` | React patient frontend: landing page, city/type filters, hospital cards, bed-request form and request-status page | Patient can search a city, see availability, create a request and view own request status. |
| **Kartik Sharma** | `feature/auth-rbac` | Patient/hospital-admin registration & login, bcrypt password hashing, JWT auth, RBAC middleware | Protected endpoints reject unauthenticated users; patients and hospital admins see only permitted actions. |
| **Daksh Goyal** | `feature/database-hospital-api` | Prisma schema, PostgreSQL migration/seed, hospital and resource-availability REST APIs | City/type search works; hospital staff can update resource counts; Prisma Studio shows seeded data. |

## Rohan's frontend checklist

1. Create pages: `Home`, `SearchHospitals`, `HospitalDetails`, `BedRequest`, and `MyRequests`.
2. Build reusable components: `Navbar`, `SearchFilters`, `HospitalCard`, `ResourceBadge`, and `Loader`.
3. Use `client/src/api/client.js` to call backend APIs; do not write hospital API code.
4. Add responsive mobile styling and clear states for loading, no results, and API errors.
5. Raise a PR from `feature/patient-portal` with screenshots and a short testing note.
| **Yugraj Saini** | `feature/hospital-admin-portal` | Hospital admin dashboard: availability update form, incoming requests, approve/reject actions | Hospital admin can update only their hospital and approve/reject only its requests. |

## Shared rules

1. Pull `main` before starting work.
2. Make small commits with clear messages, such as `feat(auth): add JWT login`.
3. Do not commit `.env`, `node_modules`, or database passwords.
4. Every pull request needs one teammate review and a short test note.
5. Integrate in this order: database → auth → hospital APIs → patient portal → admin portal.
