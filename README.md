# 🏥 BedConnect

**Connecting patients to available hospital resources.**

BedConnect helps patients find hospitals with available general beds, ICU beds, oxygen beds, and ventilators. Hospital staff can update availability and approve or reject bed requests.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT + role-based access control

## Project structure

```text
client/     React patient and hospital-admin portal
server/     Express REST API and Prisma database layer
docs/       Team workflow, API notes, and DB diagrams
```

## Quick start

1. Create a PostgreSQL database named `bedconnect`.
2. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` and `JWT_SECRET`.
3. Start the API:

```bash
cd server
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

4. Start the frontend in another terminal:

```bash
cd client
npm install
npm run dev
```

## Team work allocation

See [docs/TASK_ASSIGNMENTS.md](docs/TASK_ASSIGNMENTS.md). Each member owns one independent module and raises a pull request to `main`.

## Contributors

- Kartik Sharma
- Daksh Goyal
- Yugraj Saini
- Rohan Pratap Singh
