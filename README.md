# 🏥 AROGYASANGAM (आरोग्य संगम)
### *Smart Healthcare Access, Facility Referral & Live Transfer Coordination Platform*

> **"Find the Right Hospital. At the Right Time. Save the Golden Hour."**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black.svg)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Geospatial%202dsphere-47A248.svg)](https://www.mongodb.com/)

---

## 📌 Table of Contents
1. [What is AROGYASANGAM?](#-what-is-arogyasangam)
2. [Why is AROGYASANGAM Necessary? (The Problem We Solve)](#-why-is-arogyasangam-necessary-the-problem-we-solve)
3. [Core Capabilities & Innovation](#-core-capabilities--innovation)
4. [How the Matching Engine Works](#-how-the-matching-engine-works)
5. [Real-Time Live GPS Ambulance Tracking](#-real-time-live-gps-ambulance-tracking)
6. [User Roles & How to Use the System](#-user-roles--how-to-use-the-system)
   - [For Frontline Health Workers (ASHA / ANM)](#1-frontline-health-workers-asha--anm)
   - [For Referring Doctors & Medical Officers](#2-referring-doctors--medical-officers)
   - [For Receiving Hospital Triage Desks](#3-receiving-hospital-triage-desks)
   - [For Health Authority Administrators](#4-health-authority-administrators)
7. [Local Installation & Hosting Guide](#-local-installation--hosting-guide)
8. [Demo Accounts & 1-Click Test Credentials](#-demo-accounts--1-click-test-credentials)
9. [Architecture & Technical Stack](#-architecture--technical-stack)
10. [Data Privacy & Clinical Disclaimer](#-data-privacy--clinical-disclaimer)

---

## 💡 What is AROGYASANGAM?

**AROGYASANGAM** is an end-to-end digital health logistics and referral coordination platform designed to modernize public health and emergency hospital transfers across tiered healthcare systems.

In many healthcare ecosystems, medical infrastructure is structured into hierarchical levels:
```
Sub-Centres (Village/Community level)
          ↓
Primary Health Centres (PHC)
          ↓
Community Health Centres (CHC) / Rural Hospitals
          ↓
District Hospitals (Secondary Care)
          ↓
Apex Level-1 Trauma & Tertiary Specialized Medical Institutes
```

AROGYASANGAM bridges the digital void between these tiers. It replaces chaotic, verbal telephone calls with **structured electronic referrals**, an **explainable facility-matching engine**, **bi-directional hospital acceptance**, and **live Socket.IO GPS ambulance tracking** on interactive maps.

---

## 🚨 Why is AROGYASANGAM Necessary? (The Problem We Solve)

### 1. The "Golden Hour" Catastrophe
In acute medical emergencies—such as myocardial infarctions (heart attacks), polytrauma road accidents, strokes, and neonatal complications—the first 60 minutes (**the Golden Hour**) dictate patient survival. Today, precious minutes are squandered because referring doctors must manually phone multiple hospital desks to check if an ICU bed or on-duty cardiologist is available.

### 2. The Danger of "Blind Referrals"
When doctors lack real-time visibility into receiving facility capacities, patients are often placed into ambulances under a "blind referral". Upon traveling 30–60 minutes, the patient frequently arrives only to be turned away at the emergency bay due to:
- ❌ Zero available ICU or ventilator beds.
- ❌ Missing on-duty specialists (e.g., neurosurgeon, pediatric surgeon).
- ❌ Malfunctioning diagnostic equipment (e.g., CT scan down for maintenance).
- ❌ Depleted life-saving medication or blood bank reserves.

This results in **secondary and tertiary transit loops**, where patients travel from hospital to hospital, frequently deteriorating or succumbing in transit.

### 3. Asymmetric Resource Utilization
While prestigious apex medical institutes suffer from over-crowding and bed shortages (150%+ occupancy), nearby district hospitals and secondary centers with available specialized beds and doctors often sit underutilized because referring clinicians have no easy way of discovering them.

### 4. How AROGYASANGAM Solves This
| Legacy Referral Process | AROGYASANGAM Solution |
| :--- | :--- |
| Manual phone calls to random hospital emergency desks | Instant search of reported real-time bed & specialist inventory |
| Patient arrives unannounced; receiving hospital is unprepared | Receiving hospital reviews dossier and formally reserves bed *before* dispatch |
| Ambulances vanish into transit blind-spots | Dual-screen real-time GPS tracking with dynamic ETA countdowns |
| Paper slips lost or illegible during patient handoff | Digital patient continuity records with clinical timeline and telemetry logs |
| Fragmented, siloed public health records | Unified public health hierarchy connecting ASHA workers to apex trauma centers |

---

## ⚡ Core Capabilities & Innovation

- **Tiered Public Health Discovery**: Search across Sub-Centres, PHCs, CHCs, District Hospitals, and Specialized Medical Institutes with instant verification badges.
- **Explainable Multi-Factor Matching**: Computes match suitability percentages (0–100%) so doctors understand *why* a facility is recommended.
- **Bi-directional Referral Workflow**: Complete audit trail (`Created` ➔ `Pending` ➔ `Accepted` ➔ `Transfer` ➔ `Completed` or `Declined` with instant alternative match rerouting).
- **Synchronized Live GPS Telemetry**: Real-time Leaflet map tracking powered by Socket.IO WebSockets with moving vehicle icons, turn-by-turn road waypoints, and dynamic ETA calculations.
- **Frontline Health Worker Empowerment**: Dedicated simplified portal for rural ASHA/ANM workers to escalate emergency village patients with offline/low-data resilience.
- **Interactive GPS Simulator**: Built-in simulator controls (Start, Pause, Step Forward, Reset) enabling realistic ambulance transit demos without requiring a physical GPS device.
- **Patient Continuity Record**: Instant demographic tracking with prior referral history, diagnostic requirements, and vital monitoring.

---

## 🧠 How the Matching Engine Works

When a doctor or frontline worker enters patient requirements, AROGYASANGAM ranks candidate hospitals using a deterministic, explainable **4-factor scoring algorithm**:

$$\text{Match Score} = (0.40 \times \text{Bed}) + (0.30 \times \text{Facilities}) + (0.20 \times \text{Specialists}) + (0.10 \times \text{Proximity})$$

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MATCHING SCORE BREAKDOWN (100%)                     │
├──────────────────────┬──────────────────────┬──────────────────────────┤
│ 40% Bed Availability │ 30% Diagnostics &    │ 20% Specialist Presence  │
│ - General Beds       │     Facilities       │ - Cardiologist           │
│ - ICU Beds           │ - Ventilators / OTs  │ - Neurologist            │
│ - NICU / PICU        │ - CT Scan / MRI      │ - Orthopedic / Pediatric │
│ - Emergency Bay      │ - Blood Bank / ECG   │ - Surgeon Availability   │
├──────────────────────┴──────────────────────┴──────────────────────────┤
│ 10% Distance & Proximity (Haversine Geospatial Geodesic Formula)       │
└────────────────────────────────────────────────────────────────────────┘
```

- If a facility lacks the **mandatory bed type** (e.g., ICU requested but 0 vacant ICU beds), its score is penalized to prevent unfeasible transfers.
- Matching scores and specific missing requirements are shown transparently to the clinician.

---

## 🛰️ Real-Time Live GPS Ambulance Tracking

The live tracking module connects the referring clinician and the receiving trauma center over a unified WebSocket stream:

```
Ambulance GPS Device / Driver Simulator
                   ↓
        PUT /api/tracking/:referralId/location
                   ↓
        Express Server + MongoDB (2dsphere index)
                   ↓
        Socket.IO Channel (`referral:${id}`)
        ├── Broadcasts `ambulance:location:update`
        └── Broadcasts `ambulance:status:update`
                   ↓
       ┌────────────────────────┴────────────────────────┐
       ↓                                                 ↓
Referring Doctor Screen                        Receiving Trauma Team
- Interactive OpenStreetMap (Leaflet)          - Live docking countdown
- Moving ambulance marker with radar beacon   - Distance & ETA HUD
- Origin & Destination trauma pins             - Emergency team preparation
```

### Live Tracking Screen Features:
1. **Interactive OpenStreetMap**: Smooth pan, zoom, and auto-centering lock onto the moving ambulance.
2. **Three Distinct Leaflet Markers**:
   - 🏥 **Referring Facility Marker**: Shows origin clinic and triage departure details.
   - 🚑 **Live Ambulance Marker**: Positioned in real time with an animated pulsating radar wave and velocity HUD.
   - 🏥 **Receiving Hospital Marker**: Pinpoints destination emergency trauma intake bay.
3. **Turn-by-Turn Road Route**: Accurate road curves generated via OSRM with local bezier curve fallback.
4. **Milestone Transition Stepper**: Automatically transitions states as the vehicle closes distance:
   $$\text{Assigned} \longrightarrow \text{En Route} \longrightarrow \text{Near Destination } (\le 1.2\text{ km}) \longrightarrow \text{Arrived } (\le 80\text{ m})$$

---

## 👥 User Roles & How to Use the System

### 1. Frontline Health Workers (ASHA / ANM)
- **Login**: `asha.devi@smartcare.demo` (or click the *Frontline Worker* demo button)
- **Workflow**:
  1. Navigate to `/frontline` to view community triage alerts.
  2. Click **Create New Referral** when identifying an acute village patient.
  3. Select severity level (`Critical`, `Urgent`, or `Standard`).
  4. Specify required beds and facilities. The system automatically searches higher-tier Community Health Centres and District Hospitals.
  5. Submit referral and monitor the acceptance status in real time.

### 2. Referring Doctors & Medical Officers
- **Login**: `arjun@smartcare.demo` (or click *Doctor (PHC)* demo button)
- **Workflow**:
  1. Open **Doctor Dashboard** (`/doctor`) to review your active patient cases.
  2. Click **Create Referral** (`/doctor/create-referral`).
  3. Input patient details (Age, Gender, Symptoms, Emergency Level, Required Bed & Specialist).
  4. Review the **Matched Hospitals** list ranked by suitability percentage.
  5. Select the highest-matching facility and click **Dispatch Referral**.
  6. Go to **My Referrals** (`/doctor/referrals`) and open the referral dossier.
  7. Once accepted by the receiving hospital, click **[ 🚑 Track Patient Transfer ]** to monitor live GPS transit.

### 3. Receiving Hospital Triage Desks
- **Login**: `apex@smartcare.demo` or `citycare@smartcare.demo` (or click hospital demo buttons)
- **Workflow**:
  1. View the **Hospital Dashboard** (`/hospital`) showing live bed occupancy and specialist shifts.
  2. Click **Incoming Referrals** (`/hospital/referrals`) to see incoming emergency transfer requests.
  3. Review the patient dossier, required beds, and diagnostic needs.
  4. Click **Accept Referral** (bed is reserved, dispatch alert sent) or **Decline** (with a mandatory reason so the doctor is instantly given alternative matches).
  5. Click **Live Tracking** to see the ambulance ETA so your emergency resuscitation bay is primed for clinical handover.

### 4. Health Authority Administrators
- **Login**: `admin@smartcare.demo` (or click *Authority Admin* demo button)
- **Workflow**:
  1. Access the **Admin Dashboard** (`/admin`) for district-wide network metrics.
  2. Inspect facility verification queues at `/admin/verify-hospitals` to approve newly registered hospitals.
  3. Audit doctor and frontline worker rosters at `/admin/doctors`.
  4. Monitor district referral flow and inter-facility transit times at `/admin/referrals`.

---

## 💻 Local Installation & Hosting Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Community Server installed and running on default port `27017`
- **npm**: v9 or higher

### Quick Start (One Command Each)

#### 1. Clone & Setup Repository
```bash
cd /Users/harshrajverma/Desktop/AROGYASANGAM
```

#### 2. Seed Database (Required on First Run)
Populate MongoDB with sample healthcare facilities, doctors, referrals, and initial tracking waypoints:
```bash
npm run seed
```
*(Runs `node seed.js` in the `server` directory)*

#### 3. Start the Backend API & WebSocket Server
```bash
npm run server
```
- **API URL**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`
- **Socket.IO**: `ws://localhost:5000`

#### 4. Start the Frontend Client (In a Separate Terminal)
```bash
npm run client
```
- **Application URL**: `http://localhost:5173/`

---

## 🔑 Demo Accounts & 1-Click Test Credentials

The login screen (`http://localhost:5173/login`) includes **1-Click Demo Quick-Fill Buttons** for testing all roles:

| Role | Name | Email | Password | Facility Affiliation |
| :--- | :--- | :--- | :--- | :--- |
| **Frontline Worker** | Asha Devi | `asha.devi@smartcare.demo` | `Worker@123` | Mohanlalganj Community PHC |
| **Doctor (PHC)** | Dr. Arjun Mehta | `arjun@smartcare.demo` | `Doctor@123` | Mohanlalganj Community PHC |
| **Specialized Hospital** | Apex Trauma Desk | `apex@smartcare.demo` | `Hospital@123` | Apex Trauma & Critical Care |
| **Multispeciality Hospital** | CityCare Desk | `citycare@smartcare.demo` | `Hospital@123` | CityCare Multispeciality Hospital |
| **District Hospital** | Dr. RML Desk | `district.hospital@smartcare.demo` | `Hospital@123` | Dr. RML District Hospital |
| **Health Authority Admin** | Dr. Alok Verma | `admin@smartcare.demo` | `Admin@123` | State Health Directorate |

---

## 🏗️ Architecture & Technical Stack

```
AROGYASANGAM/
├── package.json                   # Root workspace orchestration scripts
├── client/                        # Frontend Single-Page Application
│   ├── .env                       # Client environment (VITE_API_URL, VITE_SOCKET_URL)
│   ├── src/
│   │   ├── components/            # Reusable UI widgets, badges, comparison & timeline
│   │   ├── context/               # Auth, Notifications, Language, LowData contexts
│   │   ├── pages/
│   │   │   ├── frontline/         # Frontline health worker portal
│   │   │   ├── doctor/            # Referral creation, hospital finder, LiveTracking.jsx
│   │   │   ├── hospital/          # Bed inventory, incoming referral acceptance
│   │   │   ├── admin/             # Facility verification & network audit
│   │   │   └── LiveAutomation.jsx # End-to-end automated simulation stage
│   │   ├── services/api.js        # Axios API client with tracking & auth endpoints
│   │   ├── index.css              # Tailwind base + custom Leaflet styling
│   │   └── App.jsx                # React Router v7 routes & role-based guards
│   └── package.json
│
└── server/                        # Backend REST API & WebSocket Server
    ├── .env                       # Server environment (PORT, MONGO_URI, JWT_SECRET)
    ├── config/database.js         # Mongoose connection handler
    ├── controllers/
    │   ├── authController.js      # JWT registration, login, profile
    │   ├── hospitalController.js  # Hospital resource CRUD
    │   ├── referralController.js  # Referral lifecycle, matching algorithm
    │   ├── trackingController.js  # Real-time GPS ingestion & simulator loop
    │   ├── simulationController.js# Automated patient influx generator
    │   └── adminController.js     # System administration endpoints
    ├── models/
    │   ├── User.js                # Multi-role authentication schema
    │   ├── Hospital.js            # Facility beds, diagnostics, 2dsphere coordinates
    │   ├── Referral.js            # Referral clinical dossier & audit trail
    │   └── TransferTracking.js    # GeoJSON coordinates, waypoints & telemetry
    ├── services/
    │   ├── hospitalMatchingService.js # 40-30-20-10 deterministic ranking
    │   └── routingService.js      # OSRM road waypoints & Haversine distance
    ├── routes/                    # Express route declarations
    ├── seed.js                    # Comprehensive multi-tier demo data seed
    └── server.js                  # HTTP + Socket.IO server entry point
```

---

## 🛡️ Data Privacy & Clinical Disclaimer

### HIPAA / DISHA Privacy Standard Compliance
- **Patient De-Identification**: The public GPS tracking map and WebSocket broadcast streams **never expose patient Personally Identifiable Information (PII)**. Full names, phone numbers, addresses, and clinical attachments remain strictly inside access-controlled doctor/hospital referral dossiers.
- Only the randomized **Referral Code** (e.g., `REF-DEMO-1001`), emergency classification (`Critical`), and required clinical resources (e.g., `ICU Bed`, `Cardiologist`) are visible on telemetry streams.

### Mandatory Medical Disclaimer
> **AROGYASANGAM is a logistical referral coordination and resource discovery platform.**  
> - It does **NOT** diagnose conditions or prescribe medical treatment.  
> - It does **NOT** override the judgment of qualified physicians.  
> - All hospital bed counts, diagnostic statuses, and specialist availability are reported by participating facilities and must be clinically confirmed prior to dispatch.  
> - In an immediate life-threatening emergency, always contact local emergency medical services (such as 108 / 112 in India or 911 in the US).

---

<p align="center">
  <b>Developed for Healthcare Access & Life-Saving Referral Coordination.</b><br>
  <i>AROGYASANGAM Platform – Built with Node.js, Express, React, Socket.IO & MongoDB</i>
</p>
