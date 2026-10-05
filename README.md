# 🚗 Dr. Washit Car Detailing CRM — Comprehensive Project Documentation

Welcome to the official technical and architectural documentation for **Dr. Washit Car Detailing CRM**. This document serves as a master guide for developers, administrators, and hosts to understand, maintain, scale, and deploy the entire platform.

---

## 📌 Executive Project Overview
**Dr. Washit Car Detailing CRM** is a high-performance, full-featured Customer Relationship Management (CRM) and workshop workshop automation platform designed specifically for premium automotive detailing centers. The app integrates real-time booking flows, live detailing bay tracking, automatic WhatsApp notifications, billing/invoicing, staff commissions, expense tracking, and inventory control into a single unified client-side React experience powered by an offline-first Firebase Firestore engine.

### 🛠️ Core Technology Stack
*   **Frontend Framework**: React 18+ (Functional Components, Hooks)
*   **Build Tool**: Vite (highly optimized static output bundle)
*   **Styling**: Tailwind CSS (Utility-first styling, customized theme variables)
*   **Database & Auth**: Google Firebase (Firestore Database for persistent cloud sync + Firebase Auth)
*   **Animations**: Tailwind native keyframes and transition states
*   **Icons**: Lucide React
*   **Hosting Compatibility**: Render.com, Cloud Run, Vercel, Netlify, or any standard static/node container.

---

## 📂 Project Architecture & Directory Map

```text
├── bun.lock                     # Bun lockfile for super-fast package resolution
├── firebase-applet-config.json  # Firebase client credentials
├── firestore.rules              # Secure DB validation rules for Firestore collections
├── index.html                   # Static SPA entrypoint
├── package.json                 # Dependency list & package scripts
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Vite bundler, asset, and dev server configurations
└── src/
    ├── App.tsx                  # Root Orchestrator & View-state Router
    ├── index.css                # Global styles, Tailwind imports, and scrollbar overrides
    ├── main.tsx                 # DOM mounting entrypoint
    ├── vite-env.d.ts            # TypeScript global module definitions
    ├── assets/                  # High-quality assets & images
    │   └── dr_washit_logo.jpg   # Official high-resolution Dr. Washit logo
    ├── types/
    │   └── crm.ts               # Complete TypeScript contract declarations
    ├── lib/
    │   ├── firebase.ts          # Firebase SDK initialization (Auth & Firestore)
    │   └── customAuth.ts        # Custom Auth abstract wrapper supporting local fallback and Cloud sync
    ├── utils/
    │   ├── firebaseSync.ts      # Cloud synchronization utilities (Load/Save/Sync)
    │   ├── storage.ts           # LocalStorage fail-safe backup system
    │   └── whatsapp.ts          # Intelligent URL and API compiler for WhatsApp integrations
    └── components/              # Modular UI blocks (Self-contained and decoupled)
        ├── CarIntroLoader.tsx   # Premium colorful animated boot sequence
        ├── DrWashitLogo.tsx     # Independent unified logo module (Zero dependency)
        ├── DashboardOverview.tsx# KPI metrics, analytics charts, and real-time status summaries
        ├── BayWorkboard.tsx     # Live detailing bays grid (Track active vehicle status)
        ├── BookingsManager.tsx  # Dynamic list of appointments with inline actions
        ├── CustomerCRM.tsx      # Customer directory, service histories, and contact cards
        ├── BillingManager.tsx   # POS Billing interface, invoice generator & PDF export tools
        ├── PackagesManager.tsx  # Service categories, dynamic packages pricing management
        ├── EmployeeManagement.tsx# Staff directory, role-based commissions, and payroll
        ├── ExpensesManager.tsx  # Workshop outgoing operational expenses ledger
        ├── InventoryManager.tsx # Stock level alarms, active chemicals, and detailing supply logs
        ├── AutomationsManager.tsx# Scheduled automated reminders and custom WhatsApp templates
        ├── LoginScreen.tsx      # Secure credential portal with smooth transition effects
        └── PublicInvoiceView.tsx# Clean digital receipts optimized for direct client sharing
```

---

## 🧩 Comprehensive Component breakdown

### 1. 🏎️ `CarIntroLoader.tsx` (Boot Engine)
*   **Purpose**: Renders a premium, eye-safe, full-screen detailing boot sequence when a session is unlocked.
*   **Design Paradigm**: Features an animated glowing dashboard matrix background, dynamic SVG car scaling, and vibrant neon backlight steps representing detailing stages.
*   **Details**: Smoothly increments state progress from 0% to 100% over 5.2 seconds, changing color themes dynamically:
    *   *Step 1 (Cyan-Blue)*: Active Foam & Wash
    *   *Step 2 (Indigo-Violet)*: Precision Detailing
    *   *Step 3 (Purple-Pink)*: Blow Dry & Vacuum
    *   *Step 4 (Pink-Emerald)*: Ceramic Coating & Wax
    *   *Step 5 (Emerald-Cyan)*: Ready to Shine Showroom finish

### 2. 📊 `DashboardOverview.tsx`
*   **Purpose**: Renders high-impact visual performance indicators (Revenue, Jobs Completed, Average Ticket, Pending Deliveries).
*   **Key Features**:
    *   Interactive grid cards with real-time analytics.
    *   Interactive daily check-in tracker.
    *   Urgent item panels such as low inventory warnings or pending reviews.

### 3. 🧼 `BayWorkboard.tsx`
*   **Purpose**: Provides visual management of the physical garage/studio detailing bays (e.g., Bay 1, Bay 2, Ceramic Room).
*   **Key Features**:
    *   Easy drag/assign representation of cars.
    *   Live timing metrics to trace how long a car has been in "Washing", "Polishing", or "Final QC".
    *   Direct click actions to advance statuses, complete jobs, or contact customers.

### 4. 🗃️ `CustomerCRM.tsx`
*   **Purpose**: Central repository for all guest profiles and vehicles.
*   **Key Features**:
    *   Intelligent search filter (Search by Phone Number, Name, or Car Number plate).
    *   Detailed transaction histories showing previous visited dates, billing amounts, and package preferences.
    *   Direct triggers for manual message templates.

### 5. 💳 `BillingManager.tsx`
*   **Purpose**: Complete Point of Sale (POS) invoicing system.
*   **Key Features**:
    *   Generates gorgeous thermal receipts or official full-page A4 bills.
    *   Dynamic service adding, discount margins, taxation adjustments, and payment modes (UPI, Cash, Card, Split).
    *   Generates a dedicated **Public Shareable Link** for client bills.

### 6. 📱 `PublicInvoiceView.tsx`
*   **Purpose**: Secure client-facing digital receipt shared directly over WhatsApp.
*   **Key Features**:
    *   Clean, high-contrast typography designed for mobile web previews.
    *   Interactive status display showing if their vehicle is ready for pickup.
    *   Print receipt capability directly from their mobile browser.

---

## 🗄️ Database Architecture & Cloud Synchronization (`/src/lib/` & `/src/utils/`)

The application implements a robust, secure **dual-layer synchronization layer**:

```text
  [ User Interactive UI ]
             │
             ▼
    [ customAuth.ts ] ──► (Offline Fallback Check if Cloud is down)
             │
             ▼
   [ firebaseSync.ts ]
     ├── Load: Pulls appointments, settings, employees, inventory from Firestore.
     └── Save: Atomically updates matching doc records via optimistic UI rendering.
             │
             ▼
 [ Google Firebase Firestore ]
```

### 🔒 Core Firestore Collections:
1.  **`users`**: Master profile settings, owner permissions, active subscriptions.
2.  **`appointments`**: Individual booking tickets including car info, status updates, selected packages, staff commissions, invoice amounts, and date stamps.
3.  **`shopSettings`**: Shop address, logo configuration, taxation rules, custom WhatsApp template structures, and detailing packages catalog.
4.  **`inventory`**: Products list with stock quantities, minimum alarm thresholds, and unit costs.

---

## 💬 WhatsApp Integration Engine (`/src/utils/whatsapp.ts`)

Dr. Washit CRM implements custom-tailored API & URL structures to send instant customer updates over WhatsApp without requiring expensive 3rd-party servers.

### 📲 Supported Automated Templates:
*   **Booking Confirmation**: Generates welcoming messages with direct details of appointment time slots.
*   **Work-In-Progress (WIP)**: Notifies the customer that active detailing has begun on their vehicle.
*   **Delivery Ready**: Notifies the client that their vehicle has passed Quality Control and is ready to be picked up with a dynamic link to their digital live-invoice.
*   **Payment Success**: Automatically shares the receipt invoice upon complete billing transaction records.

---

## 🛠️ Step-by-Step Local Development & Testing

Follow these steps to run, build, or debug the project locally on your machine:

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed. You can use standard packet managers like `npm`, `yarn`, or `bun`.

### 2. Installing Dependencies
From the root directory, run:
```bash
npm install
```

### 3. Setting Up Environment Variables
Create a `.env` file in the root directory (based on `.env.example` if present):
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

### 4. Booting Development Server
Start the local Vite dev server on port `3000`:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 5. Compiling and Verifying
To verify that TypeScript and the Vite compiler are 100% sound with no warnings:
```bash
npm run lint
npm run build
```

---

## 🚀 Deployment Guide (Render.com)

If you are experiencing build failures on **Render.com** (as shown in your build logs screenshot), follow these guidelines to guarantee a successful live build:

### 💡 Root Cause of Past Render Failures:
The build log showed:
`error TS2307: Cannot find module '../assets/images.png' or its corresponding type declarations.`
*   **Reason**: Stale local files (like a temporary `images.png` or incorrect local capitalization) were imported in files but were not pushed to GitHub or did not exist on the remote repository.
*   **Fix Applied**: We have completely deleted all references to the missing file `images.png` and created a standalone, self-contained `DrWashitLogo` component.

### 📝 Perfect Build Settings for Render.com:
1.  **Service Type**: Static Site (or Web Service if you bundle with custom servers).
2.  **Runtime**: Node (select `Node` or use standard build pack).
3.  **Build Command**:
    ```bash
    npm install && npm run build
    ```
4.  **Publish Directory**:
    ```text
    dist
    ```
5.  **Environment Variables**:
    *   Make sure to add your Google Firebase credentials in Render's environment variable section if you wish to run with active cloud database connections.

---

## 🤝 Support and Maintenance Instructions
*   **Scaling Detailing Packages**: Navigate to the `SettingsPanel` -> `Packages Manager` to add, delete, or modify pricing of detailing packages on the fly. These are saved globally to Firestore and update the Billing POS automatically.
*   **Security Audits**: The Firestore security rules are defined inside `firestore.rules`. Ensure any changes to document accessibility are updated there and deployed using Firebase CLI.

---

**Crafted with precision, designed for scale.**  
*© 2026 Dr. Washit CRM Systems. All rights reserved.*

