# 🏥 MediStore - Backend API (Complete Documentation)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

A robust, scalable backend API powering **MediStore**, a comprehensive pharmaceutical e-commerce platform. Built with TypeScript, Express.js, PostgreSQL, and Prisma ORM for maximum reliability and developer experience.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [API Endpoints](#api-endpoints)
9. [Authentication & Authorization](#authentication--authorization)
10. [Core Modules](#core-modules)
11. [Workflows](#workflows)
12. [Docker Setup](#docker-setup)
13. [Development Guide](#development-guide)
14. [Deployment](#deployment)
15. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**MediStore Backend** is the heart of our pharmaceutical e-commerce ecosystem. It handles:

- User authentication and authorization with role-based access control
- Medicine catalog management with multi-seller support
- Order processing with payment integration (Stripe & Cash on Delivery)
- Cart and wishlist management
- Product reviews and ratings
- Address management for deliveries
- Admin dashboard with analytics
- Automated email notifications

The backend is designed with a **modular architecture** to ensure scalability and maintainability.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Runtime** | Node.js (v18+) |
| **Framework** | Express.js 4.22.1 |
| **Language** | TypeScript 5.9.3 |
| **ORM** | Prisma 7.3.0 |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Authentication** | JWT (jsonwebtoken 9.0.3) |
| **Password Hashing** | bcryptjs 3.0.3 |
| **File Upload** | express-fileupload 1.5.2 |
| **Cloud Storage** | Cloudinary |
| **Image Processing** | Sharp 0.34.5 |
| **Payment Gateway** | Stripe 20.3.0 |
| **Email Service** | Nodemailer 7.0.13 |
| **Security** | Helmet 8.1.0, CORS |
| **Logging** | Morgan 1.10.1 |
| **Validation** | Zod 4.3.6 |

---

## ✨ Features

### 🔐 Authentication & Security

- **JWT Authentication**: Dual token system (Access Token + Refresh Token)
- **Role-Based Access Control (RBAC)**:
  - `CUSTOMER`: Can browse, purchase, review medicines
  - `SELLER`: Can manage own products and view orders
  - `ADMIN`: Full system access and oversight
- **Password Encryption**: Secure bcryptjs hashing
- **User Management**: Ban/Unban functionality for accounts
- **Secure Cookies**: HTTPOnly, SameSite protected tokens
- **Helmet Security Headers**: Protection against common vulnerabilities

### 📦 Inventory & Medicine Management

- **Dynamic Catalog**: Full CRUD operations for medicines
- **Category System**: Organize medicines by categories with descriptions and images
- **Multi-Seller Support**: Sellers can manage their own product listings
- **Stock Management**: Real-time inventory tracking
- **Image Upload**: Multer integration for product images
- **Cloudinary Integration**: Cloud-based image storage and CDN delivery
- **Search & Filter**: Fast queries with Prisma for finding medicines

### 🛒 Order Processing

- **Order Creation**: Multi-item order support
- **Status Tracking**: `PENDING` → `PAID` → `SHIPPED` → `DELIVERED` or `CANCELLED`
- **Payment Methods**:
  - **Stripe Integration**: Credit/debit card payments
  - **Cash on Delivery (COD)**: Pay after delivery
- **Atomic Transactions**: Data integrity during stock reduction and order placement
- **Order History**: Complete order tracking for customers and sellers
- **Order Management**: Admins can update order statuses

### 🛍️ Cart & Wishlist

- **Cart Management**: Add/remove/update cart items
- **Persistent Storage**: Cart data stored in database
- **Quantity Management**: Adjust quantities per medicine
- **Wishlist Feature**: Save medicines for later
- **Stock Validation**: Ensure items are in stock before purchase

### ⭐ Reviews & Ratings

- **Product Reviews**: Customers can leave reviews after purchase
- **Rating System**: Rate medicines from 1-5 stars
- **Review Moderation**: Only purchased customers can review
- **Average Rating**: Automatic calculation across all reviews

### 📍 Address Management

- **Multiple Addresses**: Save multiple delivery addresses
- **Default Address**: Set a default delivery address
- **Address Details**: Full support for complex address formats
- **Latitude/Longitude**: GPS coordinates for mapping integration
- **Contact Information**: Mobile number with country code

### 📧 Email Notifications

- **Order Confirmation**: Automated email when order is placed
- **HTML Templates**: Beautifully formatted email layouts
- **Nodemailer Integration**: Reliable email delivery
- **Dynamic Content**: Email templates with order details

### 👨‍💼 Admin Dashboard

- **User Management**: View, ban, unban users
- **Analytics**: Sales data, revenue tracking
- **Order Overview**: Monitor all orders in system
- **Medicine Inventory**: Manage medicine listings

### 🔄 RAG (Retrieval-Augmented Generation)

- **AI Integration**: Support for intelligent queries
- **Context-Aware Responses**: Enhanced search capabilities

---

## 📁 Project Structure

```
medi-store-backend/
│
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── server.ts                   # Server entry point
│   ├── config/                     # Configuration files
│   │   ├── database.ts
│   │   └── cloudinary.ts
│   ├── routes/                     # Main route aggregator
│   │   └── index.ts
│   ├── middlewares/                # Express middlewares
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── globalErrorHandler.ts   # Error handling
│   │   ├── upload.ts               # File upload configuration
│   │   └── ...
│   ├── errors/                     # Custom error classes
│   │   ├── AppError.ts
│   │   └── ...
│   ├── interfaces/                 # TypeScript interfaces
│   │   └── ...
│   ├── types/                      # TypeScript type definitions
│   │   └── ...
│   ├── lib/                        # Utility libraries
│   │   ├── prisma.ts               # Prisma client instance
│   │   └── ...
│   ├── utils/                      # Utility functions
│   │   ├── catchAsync.ts           # Error wrapper
│   │   ├── sendResponse.ts         # Standardized responses
│   │   └── ...
│   └── modules/                    # Feature modules
│       ├── Auth/                   # Authentication
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.route.ts
│       │   ├── auth.interface.ts
│       │   └── auth.utils.ts
│       ├── User/                   # User management
│       │   ├── user.controller.ts
│       │   ├── user.service.ts
│       │   ├── user.route.ts
│       │   └── ...
│       ├── Medicine/               # Product management
│       │   ├── medicine.controller.ts
│       │   ├── medicine.service.ts
│       │   ├── medicine.route.ts
│       │   └── ...
│       ├── Category/               # Category management
│       │   ├── category.controller.ts
│       │   ├── category.service.ts
│       │   ├── category.route.ts
│       │   └── ...
│       ├── Order/                  # Order processing
│       │   ├── order.controller.ts
│       │   ├── order.service.ts
│       │   ├── order.route.ts
│       │   └── ...
│       ├── Cart/                   # Shopping cart
│       │   ├── cart.controller.ts
│       │   ├── cart.service.ts
│       │   ├── cart.route.ts
│       │   └── ...
│       ├── Admin/                  # Admin operations
│       │   ├── admin.controller.ts
│       │   ├── admin.service.ts
│       │   ├── admin.route.ts
│       │   └── ...
│       ├── Review/                 # Product reviews
│       │   ├── review.controller.ts
│       │   ├── review.service.ts
│       │   ├── review.route.ts
│       │   └── ...
│       ├── Address/                # Address management
│       │   ├── address.controller.ts
│       │   ├── address.service.ts
│       │   ├── address.route.ts
│       │   └── ...
│       ├── Wishlist/               # Wishlist management
│       │   ├── wishlist.controller.ts
│       │   ├── wishlist.service.ts
│       │   ├── wishlist.route.ts
│       │   └── ...
│       ├── Rag/                    # AI features
│       │   ├── rag.controller.ts
│       │   ├── rag.service.ts
│       │   ├── rag.route.ts
│       │   └── ...
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations
│
├── generated/
│   └── prisma/                     # Auto-generated Prisma client
│
├── Dockerfile                      # Docker configuration
├── docker-compose.yml              # Local development setup (at root)
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
├── .env.example                    # Environment variables template
├── .env                            # Local environment variables (DO NOT COMMIT)
└── README.md                       # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher (or yarn)
- **PostgreSQL**: v14 or higher
- **Redis**: v7 or higher (optional for caching)
- **Git**: For version control
- **Docker & Docker Compose**: For containerized setup (optional)

### Step 1: Clone the Repository

```bash
git clone https://github.com/ahbab-zaman/medi-store-backend.git
cd medi-store-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will:
- Install all packages from `package.json`
- Automatically run `prisma generate` (postinstall hook)

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

### Step 4: Set Up Database

```bash
# Create database schema
npm run build:prisma

# Or run migrations
npx prisma migrate dev --name init

# Seed initial data (if seed script exists)
npm run seed
```

### Step 5: Start Development Server

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Verification

Test the API:
```bash
curl http://localhost:5000/
# Expected response: { "message": "Medi-Store Backend is Running" }
```

---

## ⚙️ Environment Configuration

Create a `.env` file with the following variables:

```env
# NODE ENVIRONMENT
NODE_ENV=development

# SERVER CONFIG
PORT=5000
BASE_URL=http://localhost:5000

# DATABASE
DATABASE_URL=postgresql://medistore:medistore123@localhost:5432/medi_store_db

# REDIS
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE_IN=30d

# CLOUDINARY (Image Storage)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# STRIPE (Payment Gateway)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# NODEMAILER (Email Service)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=MediStore
EMAIL_FROM_EMAIL=noreply@medistore.com

# FRONTEND URL (CORS)
FRONTEND_URL=http://localhost:3000

# OPTIONAL: S3 for backups
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY=your-access-key
AWS_S3_SECRET_KEY=your-secret-key
```

---

## 🗄️ Database Setup

### Database Schema

The database includes the following main tables:

**Users** - Authentication & profiles
- id, name, email, password, role (CUSTOMER/SELLER/ADMIN)
- contactNumber, address, isBanned flag
- Timestamps (createdAt, updatedAt)

**Medicines** - Product catalog
- id, name, description, price, stock
- manufacturer, expiryDate
- Image URL and Public ID (Cloudinary)
- categoryId, sellerId (relationships)

**Categories** - Product categories
- id, name, description
- Image and Public ID
- Timestamps

**Orders** - Purchase records
- id, userId, totalPrice, status
- Order items with quantity and price
- Payment method and status
- Timestamps

**Cart** - Shopping carts
- id, userId
- Cart items (medicineId, quantity)

**Reviews** - Product reviews
- id, medicineId, userId
- rating, comment
- Timestamps

**Address** - Delivery addresses
- id, userId
- Full address fields
- GPS coordinates
- isDefault flag

**WishlistItems** - Saved items
- id, userId, medicineId
- Timestamps

### Create Database Locally

```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres

# Using local PostgreSQL
createdb -U postgres medi_store_db
```

### Run Migrations

```bash
# Create initial migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# View database with Prisma Studio
npx prisma studio
```

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes
```
POST   /auth/register           - Register new user
POST   /auth/login              - Login user
POST   /auth/refresh-token      - Refresh access token
POST   /auth/logout             - Logout user
POST   /auth/forgot-password    - Initiate password reset
POST   /auth/reset-password     - Complete password reset
```

### User Routes
```
GET    /users/profile           - Get user profile
PUT    /users/profile           - Update user profile
GET    /users                   - Get all users (ADMIN)
GET    /users/:id               - Get user by ID (ADMIN)
PUT    /users/:id/ban           - Ban user (ADMIN)
PUT    /users/:id/unban         - Unban user (ADMIN)
DELETE /users/:id               - Delete user (ADMIN)
```

### Medicine Routes
```
GET    /medicines               - Get all medicines
GET    /medicines/:id           - Get medicine details
POST   /medicines               - Create medicine (SELLER/ADMIN)
PUT    /medicines/:id           - Update medicine (SELLER/ADMIN)
DELETE /medicines/:id           - Delete medicine (SELLER/ADMIN)
GET    /medicines/category/:id  - Get medicines by category
GET    /medicines/seller/:id    - Get seller's medicines
```

### Category Routes
```
GET    /categories              - Get all categories
GET    /categories/:id          - Get category details
POST   /categories              - Create category (ADMIN)
PUT    /categories/:id          - Update category (ADMIN)
DELETE /categories/:id          - Delete category (ADMIN)
```

### Order Routes
```
POST   /orders                  - Create order
GET    /orders                  - Get user's orders
GET    /orders/:id              - Get order details
PUT    /orders/:id/status       - Update order status (ADMIN)
DELETE /orders/:id              - Cancel order
GET    /orders/seller/my-orders - Get seller's orders
```

### Cart Routes
```
GET    /cart                    - Get user's cart
POST   /cart/add                - Add item to cart
PUT    /cart/update             - Update cart item
DELETE /cart/remove/:medicineId - Remove from cart
DELETE /cart/clear              - Clear entire cart
```

### Review Routes
```
POST   /reviews                 - Create review
GET    /reviews/:medicineId     - Get medicine reviews
PUT    /reviews/:id             - Update review
DELETE /reviews/:id             - Delete review
```

### Address Routes
```
GET    /addresses               - Get user's addresses
POST   /addresses               - Create address
PUT    /addresses/:id           - Update address
DELETE /addresses/:id           - Delete address
PUT    /addresses/:id/default   - Set as default
```

### Wishlist Routes
```
GET    /wishlist                - Get user's wishlist
POST   /wishlist/add            - Add to wishlist
DELETE /wishlist/remove/:id     - Remove from wishlist
```

### Admin Routes
```
GET    /admin/dashboard         - Dashboard stats
GET    /admin/users             - All users
GET    /admin/orders            - All orders
GET    /admin/analytics         - Analytics data
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow

1. **Registration/Login**: User credentials validated → JWT tokens generated
2. **Access Token**: Short-lived (7 days), included in Authorization header
3. **Refresh Token**: Long-lived (30 days), stored in HttpOnly cookie
4. **Token Refresh**: When access token expires, use refresh token to get new one

### Token Structure

```javascript
// Access Token Payload
{
  id: "user-uuid",
  email: "user@example.com",
  role: "CUSTOMER" | "SELLER" | "ADMIN",
  iat: timestamp,
  exp: timestamp
}
```

### Authorization Middleware

```typescript
// Usage in routes
router.get("/protected", authenticate, authorize("ADMIN"), controller);

// Middleware stack:
// 1. authenticate: Verify JWT token
// 2. authorize: Check user role
// 3. Controller: Handle request
```

### Role-Based Access Control (RBAC)

| Endpoint | CUSTOMER | SELLER | ADMIN |
|----------|----------|--------|-------|
| Browse medicines | ✅ | ✅ | ✅ |
| Create order | ✅ | ✅ | - |
| Create review | ✅ | - | - |
| Manage own products | - | ✅ | - |
| Manage all users | - | - | ✅ |
| Manage all orders | - | - | ✅ |
| Access analytics | ✅ | ✅ | ✅ |

---

## 🧩 Core Modules

### Auth Module

**Responsibilities**: User authentication and authorization

**Files**:
- `auth.controller.ts` - HTTP request handlers
- `auth.service.ts` - Business logic
- `auth.route.ts` - Route definitions
- `auth.interface.ts` - TypeScript interfaces
- `auth.utils.ts` - Helper functions

**Key Functions**:
```typescript
register(data)              // User registration
login(email, password)      // User login
refreshToken(token)         // Generate new access token
logout()                    // Clear tokens
forgotPassword(email)       // Send reset email
resetPassword(token, pwd)   // Reset password
```

### Medicine Module

**Responsibilities**: Product catalog management

**Key Functions**:
```typescript
getAllMedicines(filters)    // List with pagination/filtering
getMedicineById(id)         // Get single medicine
createMedicine(data)        // Add new medicine
updateMedicine(id, data)    // Update medicine
deleteMedicine(id)          // Remove medicine
getMedicinesByCategory(id)  // Filter by category
```

### Order Module

**Responsibilities**: Order processing and management

**Key Functions**:
```typescript
createOrder(items, userId)       // Create new order
getOrders(userId)                // Get user's orders
updateOrderStatus(id, status)    // Update status
getOrderDetails(id)              // Get full order info
cancelOrder(id)                  // Cancel order
```

**Order Workflow**:
1. Customer adds items to cart
2. Customer initiates checkout
3. System creates order with `PENDING` status
4. Payment processed (Stripe or COD selected)
5. Order status → `PAID`
6. Seller/Admin ships order → `SHIPPED`
7. Order delivered → `DELIVERED`
8. Or customer cancels → `CANCELLED`

### Cart Module

**Responsibilities**: Shopping cart management

**Key Functions**:
```typescript
getCart(userId)                  // Get user's cart
addToCart(userId, medicineId)    // Add item
updateQuantity(id, quantity)     // Update quantity
removeItem(medicineId)           // Remove from cart
clearCart(userId)                // Empty cart
```

### Review Module

**Responsibilities**: Product reviews and ratings

**Key Functions**:
```typescript
createReview(medicineId, userId, data)  // Submit review
getReviews(medicineId)                  // Get all reviews
updateReview(id, data)                  // Edit review
deleteReview(id)                        // Remove review
```

### Admin Module

**Responsibilities**: System administration and analytics

**Key Functions**:
```typescript
getDashboard()                   // Dashboard stats
getUsers()                       // List all users
banUser(userId)                  // Ban user account
unbanUser(userId)                // Unban user account
getAnalytics()                   // Sales and revenue data
```

---

## 🔄 Workflows

### User Registration Workflow

```
1. User provides email, password, name
2. Validation:
   - Email format check
   - Password strength validation
   - Email uniqueness check
3. Hash password with bcryptjs
4. Create user record in database
5. Generate JWT tokens
6. Return tokens and user data
7. Frontend stores tokens (localStorage/cookies)
```

### Login Workflow

```
1. User provides email and password
2. Find user by email
3. Compare password hash
4. Generate JWT tokens
5. Store refresh token in database
6. Return tokens to client
7. Client uses access token for subsequent requests
```

### Purchase Workflow

```
1. Customer adds items to cart
2. Customer proceeds to checkout
3. System validates:
   - Cart items exist and in stock
   - Pricing is current
   - User is verified
4. Create order with PENDING status
5. Redirect to payment gateway (Stripe) or confirm COD
6. Payment processing:
   a. Stripe: Webhook callback updates order to PAID
   b. COD: Seller confirms payment manually
7. Stock reduced for each item
8. Send order confirmation email
9. Seller receives notification
10. Order ready for fulfillment
```

### Product Upload Workflow

```
1. Seller provides medicine details and image
2. File upload validation:
   - Check file type (jpg, png, webp)
   - Check file size (max 5MB)
3. Upload to Cloudinary
4. Get Cloudinary URL
5. Store medicine record with image URL
6. Return success response
7. Image available on CDN
```

### Order Fulfillment Workflow

```
PENDING (Order created)
    ↓
PAID (Payment confirmed)
    ↓
SHIPPED (Admin/Seller processes order)
    ↓
DELIVERED (Item reached customer)
    ↓ (Alternative)
CANCELLED (Customer or admin cancels)
```

---

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# This starts:
# - PostgreSQL (port 5432)
# - Redis (port 6379)
# - Backend (port 5000)

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild containers
docker-compose up -d --build
```

### Individual Docker Commands

```bash
# Build Docker image
docker build -t medi-store-backend .

# Run container
docker run -d \
  --name medi-store-backend \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  medi-store-backend

# Stop container
docker stop medi-store-backend

# View logs
docker logs -f medi-store-backend
```

### Docker Environment File

Create `.env.docker`:
```env
NODE_ENV=production
DATABASE_URL=postgresql://medistore:medistore123@postgres:5432/medi_store_db
REDIS_URL=redis://redis:6379
JWT_SECRET=production-secret-key-256-characters
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-secret
```

---

## 👨‍💻 Development Guide

### Code Style & Standards

```typescript
// Use TypeScript strict mode
// Follow naming conventions:
// - Files: kebab-case (auth.controller.ts)
// - Classes: PascalCase (AuthService)
// - Functions: camelCase (getUserById)
// - Constants: UPPER_SNAKE_CASE (MAX_UPLOAD_SIZE)

// Use proper error handling
try {
  // Code
} catch (error) {
  throw new AppError("message", statusCode);
}

// Use async/await, not callbacks
async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}
```

### Adding a New Module

1. **Create Module Folder**
   ```bash
   mkdir -p src/modules/NewModule
   ```

2. **Create Core Files**
   - `newmodule.controller.ts` - Route handlers
   - `newmodule.service.ts` - Business logic
   - `newmodule.route.ts` - Route definitions
   - `newmodule.interface.ts` - TypeScript interfaces

3. **Update Routes** - Add to `src/routes/index.ts`
   ```typescript
   import { NewModuleRoutes } from "./modules/NewModule/newmodule.route";
   
   moduleRoutes.push({
     path: "/newmodule",
     route: NewModuleRoutes
   });
   ```

4. **Example Implementation**

   **newmodule.interface.ts**
   ```typescript
   export interface INewModule {
     id: string;
     name: string;
   }
   ```

   **newmodule.service.ts**
   ```typescript
   export class NewModuleService {
     static async create(data: INewModule) {
       return await prisma.newModule.create({ data });
     }
   }
   ```

   **newmodule.controller.ts**
   ```typescript
   export const create = catchAsync(async (req, res) => {
     const result = await NewModuleService.create(req.body);
     sendResponse(res, { statusCode: 201, message: "Created", data: result });
   });
   ```

   **newmodule.route.ts**
   ```typescript
   const router = express.Router();
   router.post("/", create);
   export const NewModuleRoutes = router;
   ```

### Testing

```bash
# Run tests (if configured)
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.ts
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/medicine-search

# Make changes
git add .
git commit -m "feat: add medicine search functionality"

# Push branch
git push origin feature/medicine-search

# Create pull request on GitHub
```

---

## 🚀 Deployment

### Deployment Checklist

- [ ] Environment variables set for production
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] CORS origins updated
- [ ] Cloudinary credentials added
- [ ] Stripe keys configured
- [ ] Email service tested
- [ ] Logging configured
- [ ] Backups scheduled
- [ ] Monitoring setup

### Deploy to Render

```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Deploy from main branch
```

### Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create medi-store-backend

# Set environment variables
heroku config:set JWT_SECRET=your-key

# Deploy
git push heroku main
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=very-long-random-string
CLOUDINARY_NAME=production-account
STRIPE_SECRET_KEY=sk_live_...
EMAIL_USER=production-email@gmail.com
FRONTEND_URL=https://medi-store.com
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify PostgreSQL credentials
- Check if database exists

### Prisma Migration Issues

```bash
# Reset database (CAUTION: deletes data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy
```

### JWT Token Invalid

```
Error: jwt malformed or jwt expired
```

**Solution**:
- Clear browser cookies and localStorage
- Ensure JWT_SECRET matches
- Check token expiration time
- Use refresh token to get new access token

### File Upload Fails

```
Error: File too large
```

**Solution**:
- Check file size limits in `upload.ts`
- Verify Cloudinary credentials
- Check multer configuration

### Email Not Sending

**Solution**:
- Verify SMTP credentials in .env
- Use Gmail app password (not regular password)
- Check CORS settings for email service
- Enable "Less secure app access" if using Gmail

### Stripe Integration Error

**Solution**:
- Verify STRIPE_SECRET_KEY format
- Check webhook endpoint configuration
- Ensure Stripe account is activated
- Test with Stripe test keys first

---

## 📚 Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm start                  # Start production server

# Database
npx prisma studio         # Open Prisma Studio (GUI)
npx prisma db seed        # Seed database
npx prisma migrate dev    # Create and run migration
npx prisma format         # Format schema.prisma

# Docker
docker-compose up         # Start all services
docker-compose down       # Stop services
docker-compose logs -f    # View logs

# Git
git status                # Check status
git add .                 # Stage all changes
git commit -m "message"   # Commit changes
git push                  # Push to remote
```

---

## 📖 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma ORM Guide](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Cloudinary API](https://cloudinary.com/documentation)

---

## 📝 License

ISC License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@medistore.com
- Check existing documentation

---

**Last Updated**: June 2026
**Maintainer**: MediStore Backend Team
