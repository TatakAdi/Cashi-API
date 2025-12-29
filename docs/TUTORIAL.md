# Cashi API

Backend API untuk aplikasi Cashi Finance  
Dibangun dengan arsitektur **plugin-based**, **Prisma 7**, dan **Supabase Auth
(JWT murni)**.

---

## 🧱 Tech Stack

- Node.js (CommonJS)
- Express.js (plugin-based)
- Prisma ORM v7
- PostgreSQL (Supabase)
- Supabase Auth (JWT)
- @prisma/adapter-pg

---

## 📁 Struktur Folder

src/ ├─ api/ # HTTP layer (plugin) │ └─ authentications/ │ ├─ handler.js #
Handle request/response │ ├─ routes.js # Routing │ └─ index.js # Plugin register
├─ services/ │ └─ postgres/ │ └─ AuthenticationsService.js # Business logic ├─
middleware/ │ ├─ authMiddleware.js # JWT Supabase verification │ └─
errorMiddleware.js # Global error handler ├─ config/ │ ├─ prisma.js # Prisma
client (adapter-pg) │ └─ supabase.js # Supabase client factory ├─ tests/ │ └─
health.test.js # DB health check └─ server.js # Application entry point
