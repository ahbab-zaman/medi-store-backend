# 🏥 MediStore - Backend API

![MediStore Banner](https://img.shields.io/badge/MediStore-API-blue?style=for-the-badge&logo=medistory)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

The backend engine powering **MediStore**, a comprehensive healthcare e-commerce platform. Built with a focus on scalability, security, and developer experience.

---

## 🌟 Key Modules

### 🔐 Authentication & Security
- **JWT Authentication**: Secure access with Access and Refresh tokens.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `ADMIN`, `SELLER`, and `CUSTOMER`.
- **User Management**: Ban/Unban system and profile orchestration.

### 📦 Inventory & Medicine
- **Dynamic Catalog**: Categorized medicine listing with advanced filtering.
- **Seller Controls**: Dedicated routes for sellers to manage their own products.
- **Multer Integration**: High-performance image upload handling.

### 🛒 Order Processing
- **Atomic Transactions**: Ensures data integrity during order placement and stock reduction via Prisma transactions.
- **Multimodal Status**: Track orders through `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, and `CANCELLED`.
- **Payment Hooks**: Integrated support for Stripe and Cash on Delivery (COD).

### 📧 Notifications
- **Automated Emails**: Beautifully formatted HTML emails for order confirmations using Nodemailer.

---

## 🏗️ Architecture

The backend follows a **Modular Monolith** structure, separating concerns into distinct modules for better maintainability.

```text
src/
├── modules/
│   ├── Auth/        # Session & Identity
│   ├── Admin/       # Governance & Oversight
│   ├── Medicine/    # Product Lifecycle
│   ├── Order/       # Transaction Management
│   ├── Review/      # Social Validation
│   └── Cart/        # Persistence of Intent
├── middlewares/     # Auth, Upload, Global Wrappers
├── routes/          # Unified Route Registry
├── lib/             # Shared Instances (Prisma, etc.)
└── app.ts           # Protocol configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Instance

### Setup
1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/medistore"
   NODE_ENV="development"
   PORT=5000
   
   JWT_ACCESS_SECRET="your_secret"
   JWT_ACCESS_EXPIRES_IN="1d"
   JWT_REFRESH_SECRET="your_refresh_secret"
   JWT_REFRESH_EXPIRES_IN="30d"
   
   STRIPE_SECRET_KEY="sk_test_..."
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

3. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Launch**
   ```bash
   npm run dev
   ```

---

## 🛠️ Tech Stack & Tools

- **Express**: Lightweight web framework.
- **Prisma**: Type-safe ORM for database orchestration.
- **Safe Response Utility**: Standardized JSON responses for API consistency.
- **Zod**: Schema validation for incoming payloads.
- **Stripe**: Financial infrastructure for payments.

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---
<p align="center">Crafted with ❤️ for the MediStore ecosystem.</p>
