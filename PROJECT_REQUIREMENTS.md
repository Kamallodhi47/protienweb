# Protein Project

## Complete Product Requirement Document (PRD)

> **Project Name:** Protein Project
> **Technology Stack:** React.js + Node.js + Express.js + PostgreSQL + Prisma ORM
> **Project Type:** Full Stack Web Application
> **Architecture:** REST API + JWT Authentication + Responsive UI

---

# Project Overview

Protein Project is a modern fitness nutrition platform that allows customers to build customized high-protein meals while tracking their nutrition goals in real time.

The platform consists of three major applications:

1. Public Website
2. Customer Dashboard
3. Admin Dashboard

The goal is to provide complete transparency of nutrition, easy ordering, subscription-based meal planning, and powerful business management tools.

---

# Main Objectives

* Build Your Own Protein Bowl
* Live Nutrition Calculation
* Monthly Diet Subscription
* Customer Analytics
* Order Tracking
* Complete Admin CMS
* Inventory Management
* Business Analytics
* Responsive Design
* Production Ready Architecture

---

# Technology Stack

## Frontend

* React.js
* Vite
* React Router
* Tailwind CSS
* Shadcn UI
* Framer Motion
* Axios
* React Hook Form
* ApexCharts / Recharts

---

## Backend

* Node.js
* Express.js
* JWT Authentication
* Prisma ORM
* Multer
* Bcrypt
* REST API

---

## Database

PostgreSQL

---

## Storage

* Cloudinary
* Local Uploads (Development)

---

## Authentication

### Customer

* Register
* Login
* Logout
* Forgot Password
* JWT Authentication

### Admin

* Secure Login
* Dashboard Access
* Role Based Access

---

# Application Structure

```
protein_project/

client/
    website/
    customer-dashboard/
    admin-dashboard/

server/
    controllers/
    routes/
    middleware/
    prisma/
    services/
    uploads/

database/

docs/

README.md
```

---

# Module 1

# Public Website

Pages

* Home
* About
* Menu
* Build Your Bowl
* Juices
* Subscription
* Contact
* FAQ
* Privacy Policy
* Terms

---

## Home Page

Sections

* Hero Banner
* Featured Products
* Why Choose Us
* Protein Benefits
* Healthy Lifestyle
* Subscription Plan
* Testimonials
* FAQ
* Footer

---

# Module 2

# Build Your Own Bowl

Customer can select

## Fruits

* Apple
* Banana
* Mango
* Papaya
* Kiwi
* Strawberry
* Pomegranate

## Sprouts

* Green Moong
* Kala Chana
* Paneer
* Peanut
* Corn

## Vegetables

* Onion
* Tomato
* Coriander
* Lemon
* Cucumber

## Seeds

* Chia
* Pumpkin
* Flax
* Sunflower

---

## Live Nutrition Engine

Every ingredient updates instantly.

Display

* Protein
* Calories
* Carbs
* Fat
* Weight
* Price

Everything should update in real time.

---

# Module 3

# Juice Section

Available Add-ons

* Carrot Juice
* Beetroot Juice
* Amla Shot
* Aloe Vera Juice
* Wheatgrass Juice
* Ginger Lemon Shot
* Bitter Gourd Juice

Each juice includes

* Image
* Description
* Nutrition
* Price
* Stock Status

---

# Module 4

# Customer Dashboard

Features

Dashboard

Today's Protein Goal

Today's Intake

Weekly Progress

Monthly Progress

Recent Orders

Quick Reorder

---

## Orders

Pending

Accepted

Preparing

Dispatch

Delivered

Cancelled

Timeline Tracker

---

## Subscription

Active Plan

Expiry Date

Pause Plan

Resume Plan

Renew Plan

Customize Tomorrow Meal

---

## Analytics

Weekly Protein

Monthly Protein

Calories

Favorite Meal

---

## Profile

Update Profile

Address

Password

Mobile

Email

---

# Module 5

# Admin Dashboard

Dashboard Cards

Today's Sales

Monthly Revenue

Customers

Subscribers

Orders

Inventory

Low Stock

Pending Orders

---

## Orders

CRUD

Accept

Reject

Preparing

Dispatch

Delivered

Cancelled

Invoice

---

## Ingredients

CRUD

Fields

* Name
* Category
* Image
* Price
* Protein
* Calories
* Carbs
* Fat
* Weight
* Stock
* Status

---

## Inventory

Stock Quantity

Low Stock Alert

Refill Stock

Stock History

---

## Products

CRUD

Preset Bowls

Smoothies

Protein Shakes

Juices

Packages

---

## Customers

Customer List

Orders

Subscription

Analytics

---

## Subscription Management

Active

Expired

Paused

Renewed

Cancelled

---

## CMS

Homepage Banner

About

FAQ

Terms

Privacy

Testimonials

Blogs

---

## Settings

Delivery Charges

GST

Store Timing

WhatsApp Number

Support Email

Payment Settings

---

# Payment Gateway

Integrate

* Razorpay
* UPI

Future Ready

---

# Notifications

Email

SMS

WhatsApp

Push Notification (Future)

---

# Reports

Revenue Report

Order Report

Customer Report

Inventory Report

Subscription Report

Export PDF

Export Excel

---

# Database

Use PostgreSQL with Prisma ORM.

Suggested tables include

* Users
* Admins
* Customers
* Categories
* Ingredients
* Products
* Juices
* Orders
* Order Items
* Addresses
* Payments
* Coupons
* Inventory
* Stock History
* Subscriptions
* Analytics
* Testimonials
* Blogs
* Settings

Database should be scalable for future expansion.

---

# UI Design Guidelines

Modern

Premium

Glassmorphism

Dark Mode

Light Mode

Fully Responsive

Smooth Animations

Mobile First

Professional Dashboard

---

# Code Guidelines

* Clean Architecture
* Component Based Structure
* Reusable Components
* REST API
* Proper Validation
* Error Handling
* Loading States
* Pagination
* Search
* Filtering
* Sorting
* Secure Authentication

---

# Development Phases

Phase 1

* Project Setup
* Authentication
* Database
* Public Website

Phase 2

* Bowl Builder
* Nutrition Engine
* Customer Dashboard

Phase 3

* Admin Dashboard
* Inventory
* Orders

Phase 4

* Subscription
* Analytics
* Reports

Phase 5

* Optimization
* Testing
* Deployment

---

# Final Goal

Build a production-ready, scalable fitness nutrition platform using React.js, Node.js, Express.js, PostgreSQL, and Prisma. The application must include a modern marketing website, a secure customer dashboard, and a powerful admin dashboard with complete business management, inventory control, nutrition tracking, subscription handling, analytics, and reporting. The project should follow industry best practices, maintain clean architecture, and be ready for future mobile application integration.
