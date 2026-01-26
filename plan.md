# MediStore Backend Implementation Plan

## 1. Project Initialization & Setup

- [x] **Initialize Project**
  - `npm init -y`
  - Install dependencies: `express`, `cors`, `dotenv`, `helmet`, `morgan`
  - Install dev dependencies: `typescript`, `ts-node`, `nodemon`, `@types/node`, `@types/express`, `@types/cors`, `eslint`, `prettier`
- [x] **TypeScript Configuration**
  - Create `tsconfig.json`
- [x] **Express Setup**
  - Create `src/app.ts` (App Main Entry)
  - Create `src/server.ts` (Server Listen)
  - Configure Middleware (CORS, JSON parser, Error Handling)

## 2. Database Design (Prisma & PostgreSQL)

- [x] **Initialize Prisma**
  - `npx prisma init`
- [x] **Define Schema (`prisma/schema.prisma`)**
  - **Enums**: `Role` (CUSTOMER, SELLER, ADMIN), `OrderStatus` (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
  - **Models**:
    - `User`: id, name, email, password, role, address, phone, createdAt, updatedAt
    - `Category`: id, name, createdAt, updatedAt
    - `Medicine`: id, name, description, price, manufacturer, stock, categoryId, sellerId, createdAt, updatedAt
    - `Order`: id, userId, totalAmount, status, shippingAddress, createdAt, updatedAt
    - `OrderItem`: id, orderId, medicineId, quantity, price
    - `Review`: id, rating, comment, userId, medicineId
- [x] **Migrate Database**
  - `npx prisma migrate dev --name init`

## 3. Authentication Module

- [] **Install Auth Dependencies**
  - `bcryptjs` for hashing
  - `jsonwebtoken` for tokens
- [ ] **Implement Auth Controller**
  - `register`: Hash password, create user (Customer/Seller)
  - `login`: Verify credentials, generate JWT
- [ ] **Implement Auth Middleware**
  - `verifyToken`: Check JWT validity
  - `authorize(roles)`: Check user role permissions

## 4. Core Modules Implementation

### A. Categories (Public/Admin)

- [ ] `GET /api/categories` - List all
- [ ] `POST /api/categories` - Create (Admin only)

### B. Medicines (Public/Seller/Admin)

- [ ] `GET /api/medicines` - List with filtering (search, category, price range)
- [ ] `GET /api/medicines/:id` - Details
- [ ] `POST /api/seller/medicines` - Add new (Seller only)
- [ ] `PUT /api/seller/medicines/:id` - Update (Seller only)
- [ ] `DELETE /api/seller/medicines/:id` - Delete (Seller only)

### C. Orders (Customer/Seller/Admin)

- [ ] `POST /api/orders` - Place order (Customer)
- [ ] `GET /api/orders` - My orders (Customer)
- [ ] `GET /api/orders/:id` - Order details
- [ ] `GET /api/seller/orders` - Orders for seller's products (Seller)
- [ ] `PATCH /api/seller/orders/:id` - Update order status (Seller/Admin)
- [ ] `GET /api/admin/orders` - All orders (Admin)

### D. User Management (Admin/Self)

- [ ] `GET /api/admin/users` - List all users (Admin)
- [ ] `PATCH /api/admin/users/:id` - Ban/Unban (Admin)
- [ ] `GET /api/auth/me` - Current user profile
- [ ] `PUT /api/profile` - Update profile

## 5. Seeding & Testing

- [ ] **Seed Script**
  - Create Admin user
  - Create dummy categories and medicines
- [ ] **Testing**
  - Verify all endpoints with Postman/Insomnia
  - Check role-based access control

## 6. Directory Structure

```
src/
├── config/         # Environment vars, DB config
├── controllers/    # Route logic
├── middlewares/    # Auth, Validation, Error Handler
├── routes/         # API Routes
├── utils/          # Helper functions (response, error classes)
├── types/          # Custom type definitions
├── app.ts          # Express App setup
└── server.ts       # Server entry point
```
