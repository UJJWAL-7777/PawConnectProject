# 🐾 PawConnect — Production-Grade Pet Adoption & Marketplace Web Application

PawConnect is an enterprise-grade full-stack MERN application that connects loving adopters and buyers with rescue shelters, humane societies, and verified ethical breeders. The platform facilitates pet adoptions (free or fee-based), marketplace pet sales with Stripe test mode checkout, real-time community rescue reports, pet medical history tracking, seller reviews, and comprehensive platform administration.

---

## 🌟 Key Highlights & Features

- **Multi-Role Ecosystem**: Distinct interfaces for **Adopter/Buyer**, **Verified Seller**, **Rescuer**, **Shelter Admin**, and **Platform Admin**.
- **Adoption & Marketplace Sales**: Support for both non-profit shelter adoptions and verified breeder marketplace listings with Stripe checkout.
- **Geospatial Proximity Search**: Search pets using MongoDB `$near` 2dsphere indexing and geolocation.
- **Embedded Medical Records**: Complete vaccination tracking with booster dates, veterinary clinic diagnoses, and treatment notes.
- **Community Rescue Dispatch**: Public reporting tool for stray, lost, and injured animals with browser GPS detection and live status workflow (*Reported* → *In-Progress* → *Rescued* → *Closed*).
- **Ethics & Legal Guardrails**: Automated rejection of prohibited wild/endangered species, mandatory seller KYC verification before listing, and listing report flags.
- **Interactive OpenAPI / Swagger Documentation**: Interactive API explorer at `/api/docs` and `/api/v1/docs`.
- **Advanced Aggregation Analytics**: MongoDB aggregation pipelines computing species distributions, monthly rescue velocity, time-to-adoption averages, and marketplace revenue.
- **UI / UX Excellence**: Built with React 19, Tailwind CSS v4, Lucide icons, glassmorphic dark & light modes, toast notification system, and responsive mobile drawers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Tailwind CSS v4, Lucide React, Recharts, Axios |
| **Backend** | Node.js, Express.js (v4.21), Mongoose ODM (v8), JWT (Access + Refresh Cookies), Bcryptjs |
| **Security & Middleware** | Helmet, CORS with credentials, express-rate-limit, cookie-parser, morgan |
| **Payments & Files** | Stripe SDK (Test Mode / Checkout), Multer image upload pipeline |
| **Notifications** | Nodemailer (automated simulation fallback for development) |
| **API Docs & Testing** | Swagger UI Express / OpenAPI 3.0, Jest, Supertest |
| **DevOps & Containers** | Docker, Multi-Stage Nginx Build, Docker Compose, GitHub Actions CI |

---

## 👥 User Roles & Access Matrix

| Role | Browse & Search | Favorites & Wishlist | Apply for Adoption | Buy Pets (Stripe) | List Pets | Manage Rescues | Platform Admin Console |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Adopter / Buyer** | ✅ | ✅ | ✅ | ✅ | ❌ | Report Only | ❌ |
| **Verified Seller** | ✅ | ✅ | ✅ | ✅ | ✅ | Report Only | ❌ |
| **Rescuer / Shelter** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Dispatch) | ❌ |
| **Platform Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (Full Governance) |

---

## 🔑 Demo Login Credentials

For quick evaluation, PawConnect includes seeded demo accounts with complete realistic activity:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **👑 Platform Admin** | `admin@pawconnect.com` | `admin123` | Full metrics, user bans, seller approvals, pet moderation |
| **🛍️ Verified Seller** | `seller@pawconnect.com` | `seller123` | Active sale & adoption listings, order management |
| **⏳ Pending Seller** | `pending_seller@pawconnect.com` | `seller123` | Demonstrates the admin seller approval workflow |
| **🦸 Rescue Volunteer** | `rescuer@pawconnect.com` | `rescuer123` | Rescue intake, shelter pets, status progression |
| **❤️ Adopter / Buyer** | `adopter@pawconnect.com` | `adopter123` | Active applications, purchased pet orders, favorites |

*(Tip: The Login page features one-click buttons to instantly fill these demo credentials!)*

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas connection string

### 1. Repository Setup & Dependencies

```bash
# Clone the repository
git clone https://github.com/UJJWAL-7777/RescueProject.git
cd RescueProject

# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Environment Configuration

Backend configuration:
```bash
cd backend
cp .env.example .env
```
Default `.env` values for local development:
```env
MONGO_URI=mongodb://localhost:27017/pawconnect
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=pawconnect_jwt_secret_key_2026_super_secure_dev
JWT_REFRESH_SECRET=pawconnect_jwt_refresh_secret_key_2026_dev
JWT_EXPIRE=24h
STRIPE_SECRET_KEY=sk_test_51MockPawConnectStripeKeyForDevelopmentTesting123456
FROM_EMAIL=notifications@pawconnect.org
FROM_NAME=PawConnect
```

Frontend configuration:
```bash
cd ../frontend
cp .env.example .env
```

### 3. Seed the Database

Run the comprehensive seeder to populate **3 shelters**, **6 users** across all roles, **29+ pets** with vaccinations & photos, **medical records**, **seller reviews**, **adoption requests**, and **community rescue reports**:

```bash
cd ../backend
npm run seed
```

### 4. Run the Dev Servers

Terminal 1 (Backend API):
```bash
cd backend
npm run dev
# Starts API on http://localhost:5000
# OpenAPI Docs on http://localhost:5000/api/docs
```

Terminal 2 (Frontend React App):
```bash
cd frontend
npm run dev
# Starts Vite on http://localhost:5173
```

---

## 🧪 Automated Testing

PawConnect includes integration and unit tests using **Jest** and **Supertest** covering authentication, JWT cookies, role authorization, and pet search/filter endpoints:

```bash
cd backend
npm test
```

Expected output:
```
PASS tests/auth.test.js
PASS tests/pets.test.js
Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

---

## 🐳 Docker & Docker Compose Deployment

Run the entire multi-container architecture (MongoDB 7, Node backend, Nginx frontend) with one command:

```bash
docker-compose up --build
```

- Web Application: `http://localhost:80`
- REST API: `http://localhost:5000`
- MongoDB: `localhost:27017`

---

## 📡 REST API Reference (`/api/v1` and `/api`)

### Authentication (`/api/v1/auth`)
- `POST /register`: Register user (name, email, password, role, phone, address).
- `POST /login`: Authenticate user and issue JWT + secure httpOnly cookie.
- `POST /logout`: Clear session cookies.
- `POST /refresh`: Refresh access token using refresh token.
- `GET /me`: Get current authenticated user profile.
- `PUT /me`: Update profile details (name, phone, address, avatar).
- `POST /forgot-password` & `POST /reset-password/:token`: Crypto-based password reset.

### Pets (`/api/v1/pets`)
- `GET /`: Search & filter pets (species, breed, minAge, maxAge, size, gender, minPrice, maxPrice, listingType, status, coordinates `lat`/`lng`/`maxDistance`).
- `GET /:id`: Retrieve detailed pet profile with vaccinations, medical records, and seller reviews.
- `POST /`: Create pet listing (*Verified Sellers, Rescuers, Shelter Admins, Admins*).
- `PUT /:id`: Update pet listing.
- `DELETE /:id`: Remove pet listing.
- `POST /:id/favorite`: Toggle favorite for current user.
- `GET /favorites/mine`: Get user's saved wishlist pets.
- `POST /:id/report`: Flag pet listing for moderation review.

### Adoption Requests (`/api/v1/adoption-requests`)
- `POST /`: Submit adoption application with housing details and experience.
- `GET /mine`: View submitted applications.
- `GET /received`: Rescuer/Seller view of applications for their pets.
- `PUT /:id/status`: Approve or decline application with custom notes.

### Orders & Stripe Checkout (`/api/v1/orders`)
- `POST /`: Create order for sale listing with Stripe session or test instant confirmation.
- `GET /mine`: View user's purchased pet receipts.
- `GET /received`: Seller view of orders and delivery addresses.
- `POST /:id/confirm-payment`: Confirm payment status and mark pet as Sold.

### Community Rescue Reports (`/api/v1/rescue-reports`)
- `POST /`: Submit report for stray, lost, or injured animal with GPS coordinates and photos.
- `GET /`: Community feed of rescue reports filtered by condition and status.
- `PUT /:id`: Update status (*Reported* → *In-Progress* → *Rescued* → *Closed*).

### Platform Administration (`/api/v1/admin`)
- `GET /users`: List users with search, role filtering, and ban status.
- `PUT /users/:id/verify`: Approve or revoke seller KYC verification.
- `PUT /users/:id/ban`: Suspend or unban user account.
- `GET /moderation/pets`: View flagged listings.
- `PUT /moderation/pets/:id`: Approve or block flagged listings.
- `GET /analytics`: MongoDB aggregation pipeline analytics.

---

## ☁️ Production Deployment

### 1. Frontend (Vercel or Netlify)
1. Push project to GitHub.
2. Import `frontend` directory into Vercel/Netlify.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### 2. Backend (Render or Railway)
1. Import `backend` directory into Render as a Web Service.
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Environment Variables:
   - `MONGO_URI`: MongoDB Atlas connection URI
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `JWT_SECRET`: Secure production secret
   - `NODE_ENV`: `production`

---

## 📜 Ethical Animal Welfare & Compliance

PawConnect strictly enforces ethical adoption and breeding standards:
- **No Wild or Exotic Animals**: Automated rejection of big cats, primates, dangerous reptiles, or wild canines.
- **No Puppy Mills**: Sellers must be KYC approved by platform administrators before listing animals for sale.
- **Transparency**: Clear medical records and vaccination due dates are visible on every pet profile.
- **Reporting Mechanism**: Any user can flag a suspicious listing for instant review by the safety team.

---

## 📄 License
This project is licensed under the MIT License. Built with ❤️ for animals everywhere.
