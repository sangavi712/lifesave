# LifeSave - Blood Bank Management System

> [!IMPORTANT]
> **Portfolio Demo Project – For Educational Purposes Only.**
> This platform is an interactive portfolio and educational demonstration mockup. All data shown is fictional, and the system is not intended for real-world medical, clinical, or emergency use.

LifeSave is a complete, production-ready, and professional full-stack Blood Bank Management System built with a React (Vite) frontend, Node.js + Express backend, and PostgreSQL database. It features role-based access control, transaction-safe inventory allocation, pagination, and a highly polished modern dashboard.

---

## 🌟 Key Features

### Frontend (React + Vite)
- **Role-Based Views**: Dynamic pages and dashboards configured individually for normal users and system administrators.
- **Admin Dashboard**: Displays aggregate metrics (total units, donors, pending requests) alongside blood group stock charts.
- **Search & Filter Donors**: Live search directory to filter voluntary donors by blood type, city, or name with clean pagination.
- **Request Workflows**: Forms to submit new blood requests (hospitals/units) and an admin portal to approve/reject requests.
- **Inventory Control**: Interactive progress indicators displaying stock levels, with forms for admins to adjust supplies.
- **Support Portal**: Polished contact page with mock email submissions for eligibility inquiries.

### Backend (Node.js + Express)
- **RESTful API**: Standardized JSON endpoints organized in a model-view-controller (MVC) architecture.
- **JWT Authentication**: Secured route requests using signed JSON Web Tokens.
- **Security Hashing**: Cryptographic password hashing using `bcryptjs` before database storage.
- **Transactional Safety**: Database queries utilize atomic transactions (`BEGIN` / `COMMIT` / `ROLLBACK`) and row locks (`FOR UPDATE`) to ensure blood inventory counts cannot drop below zero or double-allocate during parallel approvals.

---

## 📁 Project Folder Structure

```
blood-bank-system/
├── backend/
│   ├── config/             # Connection configurations (db.js)
│   ├── controllers/        # Request handlers (auth, donor, request, inventory, dashboard)
│   ├── middleware/         # Security and exception filters (authMiddleware, errorMiddleware)
│   ├── routes/             # API routing mappings (auth, donor, request, inventory, dashboard)
│   ├── .env.example        # Environment variables blueprint
│   ├── index.js            # Entry point running the Express server
│   └── package.json        # Server script runners and packages
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, ProtectedRoute wrappers
│   │   ├── context/        # Global auth session provider (AuthContext.jsx)
│   │   ├── pages/          # Login, Register, Dashboard, Donor Registry, Requests, Inventory, Contact
│   │   ├── services/       # Axios interceptor configurations (api.js)
│   │   ├── App.jsx         # Client routing structure
│   │   ├── index.css       # Tailwind directives & theme styles
│   │   └── main.jsx        # React DOM render node
│   ├── tailwind.config.js  # Styling contents and custom theme setup
│   ├── index.html          # Web page root template
│   └── package.json        # Client dependencies and dev scripts
├── database/
│   ├── schema.sql          # Table definitions, constraints, and index schemas
│   └── seeds.sql           # Pre-loaded mock credentials, stocks, and requests
└── README.md               # Setup and deployment manual (This file)
```

---

## ⚙️ Local Installation & Setup

### Prerequisites
- **Node.js** (v16.x or higher recommended)
- **PostgreSQL** (Installed locally or hosted on Neon/Supabase)

---

### Step 1: Database Setup
1. Open your PostgreSQL console (`psql`) or a GUI tool (pgAdmin, DBeaver).
2. Create a new database named `blood_bank`:
   ```sql
   CREATE DATABASE blood_bank;
   ```
3. Connect to the database and run the schema file [schema.sql](file:///c:/new%20project%20and%20the%20first%20project/data/sgifirstproject/database/schema.sql) to build the tables:
   ```bash
   psql -U postgres -d blood_bank -f database/schema.sql
   ```
4. Execute the seeds file [seeds.sql](file:///c:/new%20project%20and%20the%20first%20project/data/sgifirstproject/database/seeds.sql) to load initial mock users, donors, requests, and inventory:
   ```bash
   psql -U postgres -d blood_bank -f database/seeds.sql
   ```

---

### Step 2: Backend Configuration
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Configure environment variables. A local `.env` has been created. Ensure variables match your local credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=blood_bank_jwt_secret_token_key_123
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=blood_bank
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

---

### Step 3: Frontend Configuration
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` directory to configure the backend API source link:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Launch the Vite hot-reload development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`.

---

## 🔐 Default Demo Accounts

Use these pre-configured user credentials to explore different role workflows after loading the seed files:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@bloodbank.com` | `admin123` | Can approve/reject requests, view all metrics, override blood inventory levels, query all donors. |
| **User** | `user@bloodbank.com` | `user123` | Can submit requests, view inventory levels, search donor cities, register as a donor. |

---

## 🚀 Cloud Deployment Guide

### 1. PostgreSQL Database Hosting (Supabase or Neon)
We recommend hosting the PostgreSQL database on cloud providers like **Neon.tech** or **Supabase.com** for high availability:
1. Register on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Create a new PostgreSQL project.
3. Retrieve your **Connection String** (`postgresql://...`).
4. Execute the SQL definitions in `database/schema.sql` and `database/seeds.sql` using the SQL Editor available on their cloud portals.
5. Copy the connection string to use in your backend configurations as `DATABASE_URL`.

---

### 2. Backend Hosting (Render)
To deploy the Node.js Express server on **Render**:
1. Log in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your project's GitHub repository.
4. Set the following configuration parameters:
   - **Runtime**: `Node`
   - **Build Command**: `npm install` (within the root or backend folder)
   - **Start Command**: `node backend/index.js`
5. Go to the **Environment** tab and add your variables:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `choose_a_strong_secret_key`
   - `DATABASE_URL` = `your_cloud_postgresql_connection_string` (e.g. Supabase connection string)
6. Render will assign an HTTPS URL (e.g. `https://blood-bank-api.onrender.com`). Copy this endpoint.

---

### 3. Frontend Hosting (Vercel)
To deploy the Vite React SPA on **Vercel**:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository.
4. In the configuration settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add the following **Environment Variable**:
   - `VITE_API_URL` = `https://your-backend-api.onrender.com/api` (the Render endpoint copied from the backend deployment)
6. Click **Deploy**. Vercel will build and host your frontend application.

