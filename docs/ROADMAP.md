# Cashi API – Feature Overview & Development Roadmap

Dokumen ini berfungsi sebagai **single source of truth** untuk memahami:

- fitur yang **SUDAH ADA** saat ini
- fitur yang **SEDANG DIKERJAKAN**
- fitur yang **PERLU DIKERJAKAN SELANJUTNYA**

Tujuan utama dokumen ini adalah supaya saat kamu kembali ke proyek ini:

- tidak bingung konteks
- tahu harus mulai dari mana
- tidak mengulang keputusan arsitektur

---

## 1. Gambaran Umum Arsitektur

### Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Prisma)
- **ORM**: Prisma
- **Auth Provider**: Supabase Auth
- **Validation**: Joi

### Pola Arsitektur

- Layer-based architecture
- Dependency Injection via `server.js`
- Separation of Concerns yang jelas

```
Route → Controller → Service → Repository → Database
```

---

## 2. Error Handling (SUDAH ADA)

### Error Classes

- `ClientError` (base error)
- `ValidationError` (400)
- `AuthenticationError` (401)
- `NotFoundError` (404)
- `InvariantError` (400)

### Global Error Middleware

- Semua error dilempar (`throw`) dari service / middleware
- Ditangkap oleh `errorMiddleware`
- Response konsisten:

```json
{
  "status": "fail",
  "message": "...",
  "details": []
}
```

Status: ✅ **SELESAI & STABIL**

---

## 3. Validation System (SUDAH ADA)

### validateMiddleware

- Berbasis Joi
- Validasi `body`, `query`, `params`
- `stripUnknown: true`
- Lempar `ValidationError`

### Lokasi

- `/middleware/validateMiddleware.js`
- Schema per feature (auth, users, categories, dll)

Status: ✅ **SELESAI & STANDAR**

---

## 4. Authentication Feature (SELESAI)

### Auth Flow

#### Login

- Input: `identity` (email / username) + `password`
- Username → resolve ke email via DB
- Login via `supabase.auth.signInWithPassword`
- Simpan `refresh_token` ke DB

#### Refresh Token

- Validasi refresh token di DB
- Refresh via Supabase
- Rotate refresh token

#### Logout

- Hapus refresh token dari DB
- **Idempotent** (invalid token tetap success)

### Struktur

```
api/authentications/
├── index.js
├── auth.controller.js
├── auth.validation.js

services/
└── AuthenticationsService.js

repository/
└── AuthenticationsRepository.js
```

Status: ✅ **SELESAI & AMAN**

---

## 5. Auth Middleware (SELESAI)

### authMiddleware

- Ambil `Authorization: Bearer <token>`
- Validasi via `supabase.auth.getUser`
- Inject `req.user`

Digunakan untuk:

- `/users/me`
- endpoint protected lainnya

Status: ✅ **SELESAI**

---

## 6. Users Feature (SEBAGIAN SELESAI)

### Fitur yang Sudah Ada

- Register user (via Supabase)
- Create user profile di DB
- Get user profile (`/users/me`)

### Struktur

```
api/users/
├── index.js
├── users.controller.js
├── users.validation.js

services/
└── UsersService.js

repository/
└── UsersRepository.js
```

### Catatan Penting

- Password **TIDAK digunakan** untuk login (Supabase auth adalah source of
  truth)
- UsersService hanya orchestration

Status: 🟡 **SEBAGIAN SELESAI**

---

## 7. Category Domain (SEDANG DIKERJAKAN)

### Model Database

- `Category`
- `UserCategory` (pivot)

### Konsep

- Category global (`is_global = true`, `owner_id = null`)
- Category custom (`owner_id = user_id`)
- UserCategory = visibility/ownership

### Seeding

- Default category sudah di-seed

### Keputusan Arsitektur

- `UserCategory` **milik domain Category**
- Repository: `CategoriesRepository`
- Dipakai oleh `UsersService` saat register

Status: 🟡 **FOUNDATION SUDAH ADA**

---

## 8. TODO – CATEGORY FEATURE (PRIORITAS BERIKUTNYA)

### 8.1 CategoryRepository

- [ ] getUserCategories(userId)
- [ ] createCustomCategory(userId, data)
- [ ] deleteCategory(categoryId, userId)

### 8.2 CategoryService

- [ ] list categories (global + user-owned)
- [ ] create category (custom)
- [ ] delete category

### 8.3 Category API

- [ ] GET `/categories`
- [ ] POST `/categories`
- [ ] DELETE `/categories/:id`

---

## 9. CORE FEATURE ROADMAP (MVP)

Bagian ini mendeskripsikan **fitur inti (core/MVP)** dari Cashi API. Setelah
Auth, Users, dan Category stabil, fokus pengembangan **HARUS pindah ke
Transactions dan Budgeting**.

---

## 9.1 Transactions Feature (CORE / MVP)

### Tujuan

Mencatat semua pemasukan dan pengeluaran user, yang akan menjadi **sumber data
utama** untuk laporan dan budgeting.

### Model (Sudah Ada / Akan Dipakai)

- `Transaction`
- Relasi ke:
  - `User`
  - `Category`

### Konsep Penting

- Semua transaction **dimiliki user**
- Transaction **HARUS terhubung ke satu category**
- Category bisa global atau user-owned

### Fitur yang Perlu Dibuat

#### Repository

- [ ] createTransaction(userId, payload)
- [ ] getUserTransactions(userId, filters)
- [ ] deleteTransaction(transactionId, userId)

#### Service

- [ ] validasi ownership user
- [ ] validasi category milik user
- [ ] mapping type (Income / Expenses)

#### API

- [ ] POST `/transactions`
- [ ] GET `/transactions`
- [ ] DELETE `/transactions/:id`

### Catatan Arsitektur

- TransactionRepository **tidak boleh** tahu auth
- Validasi user & category di TransactionService

Status: 🔴 **BELUM DIMULAI (CORE PRIORITY)**

---

## 9.2 Budgeting Feature (CORE / MVP)

### Tujuan

Mengatur batas pengeluaran user per kategori dalam periode tertentu (bulanan).

### Model

- `Budget`
- `BudgetCategory` (pivot)

### Konsep Penting

- Budget bersifat **per user**
- Umumnya **per bulan**
- Terhubung ke satu atau lebih category

### Fitur yang Perlu Dibuat

#### Repository

- [ ] createBudget(userId, payload)
- [ ] getUserBudgets(userId, period)
- [ ] linkBudgetToCategories(budgetId, categoryIds)

#### Service

- [ ] validasi kategori milik user
- [ ] hitung total pengeluaran per kategori
- [ ] cek over-budget

#### API

- [ ] POST `/budgets`
- [ ] GET `/budgets`

### Catatan Arsitektur

- Budget **tidak boleh** mengubah transaction
- Budget hanya membaca transaction (read-only)

Status: 🔴 **BELUM DIMULAI (CORE PRIORITY)**

---

## 9.3 Reporting (POST-MVP)

### Tujuan

Memberikan insight ke user dari data transaksi.

### Fitur

- [ ] Summary income vs expense
- [ ] Breakdown per category
- [ ] Monthly trend

Status: ⏳ **POST-MVP**

---

## 10. Engineering Principles (JANGAN DILANGGAR)

- Repository = domain data owner
- Service = business orchestration
- Controller = HTTP only
- server.js = dependency wiring
- Logout harus idempotent
- Validation selalu di route

---

## 11. Suggested Work Order (SAAT BALIK LAGI)

Urutan ini **WAJIB diikuti** supaya fokus tetap ke MVP dan tidak lompat-lompat
fitur.

1. Selesaikan **Category Feature**
   - list category user
   - create custom category
   - delete / hide category

2. Implement **Transactions Feature (CORE)**
   - TransactionRepository
   - TransactionService
   - Transaction API
   - Postman tests

3. Implement **Budgeting Feature (CORE)**
   - BudgetRepository
   - BudgetService
   - Budget API

4. Baru lanjut ke:
   - Reporting
   - Optimization
   - Documentation

---

## 12. MVP Definition (SCOPE JELAS)

Aplikasi **SUDAH LAYAK DIGUNAKAN** jika:

- User bisa register & login
- User punya category default
- User bisa tambah transaksi
- User bisa lihat total income & expense
- User bisa set budget per category

Jika poin di atas **SUDAH TERPENUHI** → MVP selesai.

---

## 13. Final Notes

Proyek ini sekarang sudah berada di fase:

> **"Core foundation is solid, MVP features are clearly defined."**

Fokus ke:

- stabilitas
- konsistensi
- penyelesaian MVP

Hindari:

- refactor besar
- penambahan fitur non-core
- over-engineering

---
