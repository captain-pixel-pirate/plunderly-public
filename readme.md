# Project Structure

## Overview
Plunderly is a full-stack web application. It combines a **Node.js/Express backend** with a **Next.js React frontend**.

---

### Root Layout
The root of the repository is divided into two main workspaces:  
- **`backend/`** handles all server-side logic, data persistence, and background processes.  
- **`frontend/`** is dedicated to client-facing UI and interactivity.

---

## Backend (`/backend`)
**Technology Stack:** Node.js, Express, Sequelize ORM, PostgreSQL, Redis  

The backend is structured around **RESTful API endpoints**, a **relational database**, and **supporting services**. It provides all the business logic and data handling needed for the application.

### Key Directories
- **`/routes/`** – Defines API endpoints for features such as commodities, labor, shoppes, and more.  
- **`/models/`** – Sequelize ORM models for PostgreSQL database tables.  
- **`/data/`** – Static game-related datasets (commodities, vessels, recipes, etc).  
- **`/migrations/`** – Database schema migrations to manage schema evolution.  
- **`/seeders/`** – Scripts to populate initial or test data into the database.  
- **`/cronjob/`** – Automated background jobs (e.g., refreshing market data).  
- **`/lib/`** – Core libraries such as Redis clients, rate limiters, and HMAC utilities.  
- **`/utils/`** – General helper functions for data transformations and processing.

---

## Frontend (`/frontend`)
**Technology Stack:** Next.js, React, TypeScript, Material-UI (MUI)  

The frontend provides a modern, responsive user interface. It leverages **Next.js App Router** for routing, **MUI** for consistent design, and **React Context/Hooks** for state management.

### Key Directories
- **`/src/app/`** – Next.js app router pages and layouts.  
- **`/components/`** – Reusable React components, grouped by feature or domain.  
- **`/interfaces/`** – TypeScript type definitions for structured typing across the app.  
- **`/hooks/`** – Custom React hooks for data fetching, state, or logic reuse.  
- **`/context/`** – React context providers for global state and settings.  
- **`/data/`** – Static frontend datasets, such as JSON recipes or example labor data.  
- **`/public/`** – Static assets (images, icons, manifests) served directly to the browser.
