# Protein Project - Run & Setup Guide

This document contains step-by-step instructions and terminal commands required to run the **Protein Project** web application locally.

---

## 🚀 Quick Start Guide

To run the complete full-stack application, you need to start two separate servers in two terminal windows:
1. **Backend API Server** (Express + Prisma + SQLite Database)
2. **Frontend Client Application** (React + Vite + Tailwind CSS)

---

## 1. Backend Server Setup & Run Commands

### Step 1: Navigate to Backend Directory
```bash
cd server
```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 3: Database Schema Migration & Seeding (First Time / Schema Changes)
```bash
npx prisma db push
```

### Step 4: Run Backend Server
```bash
node server.js
```
*or using nodemon for hot-reloading:*
```bash
npx nodemon server.js
```

> **Backend Status:**
> - **API URL:** `http://localhost:5000`
> - **Health Check:** `http://localhost:5000/api/health`
> - **Database:** SQLite local file (`server/prisma/dev.db`)

---

## 2. Frontend Client Setup & Run Commands

### Step 1: Navigate to Client Directory
```bash
cd client
```

### Step 2: Install Dependencies (First Time Only)
```bash
npm install
```

### Step 3: Run Frontend Development Server
```bash
npm run dev
```

> **Frontend Status:**
> - **Local URL:** `http://localhost:5173/`

---

## 🔑 Login Credentials

### Admin Account
- **Email:** `admin@protein.com`
- **Password:** `admin123`
- **Admin Dashboard URL:** `http://localhost:5173/admin`

### Test Customer Account
- **Email:** `alex@example.com`
- **Password:** `admin123`

---

## 🌐 Application URLs

| Feature | URL |
| :--- | :--- |
| **Home Page** | [http://localhost:5173/](http://localhost:5173/) |
| **Categories Page** | [http://localhost:5173/categories](http://localhost:5173/categories) |
| **Build Your Bowl** | [http://localhost:5173/bowl-builder](http://localhost:5173/bowl-builder) |
| **Sprouts & Protein** | [http://localhost:5173/sprouts-protein](http://localhost:5173/sprouts-protein) |
| **Juices Bar** | [http://localhost:5173/juices](http://localhost:5173/juices) |
| **Checkout Page** | [http://localhost:5173/checkout](http://localhost:5173/checkout) |
| **Admin Dashboard** | [http://localhost:5173/admin](http://localhost:5173/admin) |
| **Sprouts Categories (Admin)** | [http://localhost:5173/admin/sprouts-categories](http://localhost:5173/admin/sprouts-categories) |
| **Sprouts Ingredients (Admin)** | [http://localhost:5173/admin/sprouts-ingredients](http://localhost:5173/admin/sprouts-ingredients) |

---

## 🛠️ Summary of Terminal Commands

| Task | Command | Directory |
| :--- | :--- | :--- |
| Start Backend | `node server.js` | `server/` |
| Start Frontend | `npm run dev` | `client/` |
| DB Sync | `npx prisma db push` | `server/` |
