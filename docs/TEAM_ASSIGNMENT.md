# BedConnect Team Assignment

This document defines the complete work split for the four-member BedConnect capstone team. Everyone works in the same repository, but only edits their assigned module and branch.

## Project goal

Build a hospital resource availability platform where patients can search hospitals by city and resource type, request a bed, and track request status. Hospital administrators update their own availability and approve or reject requests.

## Stack

- Frontend: React and Vite
- Backend: Node.js and Express
- Database: PostgreSQL
- ORM: Prisma
- Security: JWT, bcrypt password hashing and role-based access control

## Work allocation

| Member | Branch | Main module | Main folders |
|---|---|---|---|
| Rohan Pratap Singh | `feature/patient-frontend` | Patient-facing React frontend | `client/src/pages`, `client/src/components`, `client/src/styles` |
| Kartik Sharma | `feature/auth-rbac` | Login, registration, JWT and role security | `server/src/controllers/authController.js`, `server/src/middleware`, `server/src/routes/authRoutes.js` |
| Daksh Goyal | `feature/database-hospital-api` | PostgreSQL, Prisma, hospitals and resource APIs | `server/prisma`, `server/src/controllers/hospitalController.js`, `resourceController.js` |
| Yugraj Saini | `feature/hospital-admin-portal` | Hospital admin dashboard and request approval | `server/src/controllers/requestController.js`, `server/src/routes/requestRoutes.js`, admin pages in `client/src/pages` |

## Rohan Pratap Singh Patient Frontend

### Your responsibility

Build all patient-facing React screens. Do not create backend APIs or database models; use the APIs provided by Daksh and Kartik.

### Files and folders to create

- `client/src/pages/Home.jsx`
- `client/src/pages/SearchHospitals.jsx`
- `client/src/pages/HospitalDetails.jsx`
- `client/src/pages/BedRequest.jsx`
- `client/src/pages/MyRequests.jsx`
- `client/src/pages/Login.jsx` and `Register.jsx`
- `client/src/components/Navbar.jsx`
- `client/src/components/SearchFilters.jsx`
- `client/src/components/HospitalCard.jsx`
- `client/src/components/ResourceBadge.jsx`
- `client/src/components/Loader.jsx`
- `client/src/routes/AppRoutes.jsx`

### Features to complete

1. Landing page with project introduction and Search Hospitals button.
2. City search input and filters for General Bed, ICU Bed, Oxygen Bed and Ventilator.
3. Hospital cards that show name, city, phone and available resource counts.
4. Hospital details page with a Request Bed button.
5. Request form for logged-in patients.
6. My Requests page with request status: Pending, Approved, Rejected or Cancelled.
7. Loading, empty-result and API-error states.
8. Responsive design for mobile and desktop.

### Completion check

A patient should be able to open the frontend, search by city and resource type, inspect a hospital, submit a bed request, and see their request status.

## Kartik Sharma Authentication and RBAC

### Your responsibility

Create secure registration/login and protect the API according to user role.

### Features to complete

1. Patient and hospital-admin registration endpoint.
2. Login endpoint that returns JWT.
3. Password hashing with bcrypt.
4. `authMiddleware.js` to verify JWT.
5. `roleMiddleware.js` to restrict patient, hospital admin and admin actions.
6. Auth routes and controller validation.

### Completion check

Unauthenticated users cannot access protected routes. A patient cannot update hospital availability, and one hospital admin cannot access another hospital's data.

## Daksh Goyal Database and Hospital APIs

### Your responsibility

Create the PostgreSQL database design and all hospital/resource availability APIs.

### Features to complete

1. Finish Prisma models for User, Hospital, ResourceAvailability and BedRequest.
2. Create migration and seed data for at least 10 hospitals.
3. Create API to search hospitals by city and resource type.
4. Create Hospital Details API.
5. Create protected API for a hospital admin to update General, ICU, Oxygen and Ventilator availability.
6. Validate all input and return useful error messages.

### Completion check

Prisma Studio displays seeded data. Search API returns filtered hospitals and resource counts. Resource updates are saved in PostgreSQL.

## Yugraj Saini Hospital Admin and Requests

### Your responsibility

Build the request workflow and hospital-admin dashboard.

### Features to complete

1. Create Bed Request API for patients.
2. Create API for a hospital admin to view only requests for their hospital.
3. Create approve/reject request API.
4. Build hospital admin dashboard page.
5. Add resource availability update form.
6. Show request status and update feedback in the dashboard.

### Completion check

Hospital admins can view their own incoming requests, update availability and approve/reject each request. Patients see the changed status in My Requests.

## Git workflow for everyone

1. Start with `git pull origin main`.
2. Create your assigned branch using `git checkout -b <branch-name>`.
3. Commit small changes with clear messages, for example `feat: add hospital search filters`.
4. Push your branch and create a pull request to `main`.
5. One teammate reviews every pull request before merge.
6. Never commit `.env`, passwords, API keys, `node_modules` or `dist` files.

## Integration order

1. Daksh completes database, seed and hospital APIs.
2. Kartik completes authentication and RBAC.
3. Rohan connects patient frontend to APIs.
4. Yugraj completes admin dashboard and request approval flow.
5. Entire team tests the complete patient-to-hospital workflow together.
