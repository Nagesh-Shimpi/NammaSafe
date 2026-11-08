# NammaSafe (ResolveTrack) · Civic Grievance Redressal & Cadre Accountability Platform

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![State](https://img.shields.io/badge/Mission-Karnataka_Sakala_Act-orange.svg)]()
[![Build Status](https://img.shields.io/badge/Build-Passing_0_Errors-brightgreen.svg)]()

> **NammaSafe (ResolveTrack)** is an enterprise-grade civic grievance redressal, officer workload distribution, and automated escalation intelligence platform built for public administration, municipal corporations, and state government departments across Karnataka.

---

## 🏛️ Executive Overview

Public grievance redressal systems often suffer from lack of transparency, administrative bottlenecks, unmonitored SLA breaches, and officer overload. **NammaSafe** bridges citizens and administrative cadres through an automated, accountable, and transparent digital workflow:

1. **Structured Citizen Intake**: 4-section intuitive filing process with 11 core public service departments, dynamic subcategories, simulated evidence attachment, and real-time duplicate grievance detection.
2. **Canonical Sequential Token System**: Cryptographically guaranteed, immutable tracking IDs (`RTK-2026-000001`, `RTK-2026-000002`...) with instant clipboard copying and printable gazette acknowledgements.
3. **Grievance Verification & Triage Desk**: Multi-stage scrutiny allowing administrators to certify jurisdiction, request supplementary citizen proofs, or reject with permanent audit trail retention.
4. **Officer Workload & Nodal Reassignment**: Live monitoring of cadre caseloads, overload indicators, capacity thresholds, and 4-step guided reassignment with supervisor authorization.
5. **Overdue Grievance Monitoring & Intelligent Escalations**: Automated SLA tracking, days overdue counters, statutory penalty exposure calculation, and Level 1–3 hierarchical escalation routing.
6. **Intelligent Reminder Centre**: Autonomous chrono-bot simulating omnichannel notifications (SMS, Email, WhatsApp, and IVR) with deduplication guards, bilingual templates (English & ಕನ್ನಡ), and failed retry queues.
7. **9-Tab Comprehensive Audit Dossier**: Complete lifecycle visibility uniting Overview, Citizen Info, Description, Evidence, Dept & Cadre Assignment, Reminders, Escalations, Communications, and Chronological Activity Timeline.

---

## 📸 Key Platform Modules

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             NammaSafe GovOps Matrix                              │
├───────────────────────┬───────────────────────────┬──────────────────────────────┤
│  Citizen Portal       │  Triage & Verification    │  Supervisory Command         │
│  - 4-Section Intake   │  - Jurisdictional Scrutiny│  - Cadre Workload Allocation │
│  - Real-time GPS Tag  │  - Clarification Dispatch │  - Level 1-3 Escalations     │
│  - Printable Receipt  │  - Rejection Safeguard    │  - Omnichannel Reminders     │
└───────────────────────┴───────────────────────────┴──────────────────────────────┘
```

### 1. Citizen Intake & Grievance Registration
- **Section A: Citizen Identification**: Full name, 10-digit mobile, email, gender, postal address, Karnataka district selector (auto-syncing taluks), village/ward, and PIN code.
- **Section B: Complaint Information**: 11 statutory categories (Roads & Infrastructure, Water Supply, Electricity, Sanitation, Public Health, Education, Revenue and Land Records, Public Distribution System, Municipal Services, Transportation, Other Government Services), auto-mapped departments, and perceived urgency.
- **Section C: Supporting Evidence**: Demonstrative multi-file upload simulator for JPEG, PNG, and PDF files.
- **Section D: Statutory Declaration**: Citizen legal affirmation and data privacy consent with double-click submission guards.

### 2. Triage & Administrative Scrutiny Desk
- **Verify Complaint**: Certifies geographical jurisdiction and activates docket for officer allocation.
- **Request Additional Information**: Prompts citizen for missing revenue sketches or bills via automated SMS logs.
- **Reject Complaint**: Mandatory reason requirement; records are preserved for ombudsman and appeal reviews.

### 3. Officer Workload & Nodal Reassignment
- Visual workload distribution charts classifying officers into *Balanced*, *High Workload*, *Overloaded*, or *Available Capacity*.
- 4-step guided reassignment modal evaluating caseload affinity and supervisor approval.

### 4. Overdue Grievance & Escalation Management
- Tracks dockets approaching SLA deadlines (24h/48h) or exceeding them.
- Multi-tier escalation engine with Section 8 statutory penalty calculations.

### 5. Intelligent Reminder Centre
- Cron-engine evaluating upcoming, due-today, and missed deadlines.
- Bilingual English and Kannada message templates with token interpolation (`{complaint_id}`, `{citizen_name}`, `{days_overdue}`).

### 6. 9-Tab Audit Dossier Inspector
- Interactive modal providing deep-dive scrutiny across:
  - `Overview` · `Citizen Info` · `Description` · `Attachments` · `Dept & Cadre` · `Reminders` · `Escalations` · `Communications` · `Activity Timeline`

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 (Hooks, Context API, Suspense) |
| **Build Tool & Bundler** | Vite 5 (Fast HMR, optimized production rollup) |
| **Styling & Design System** | Tailwind CSS 3.4 (Civic Government SaaS design tokens, Deep Navy `#0f172a`, Teal `#0d9488`, Amber `#d97706`) |
| **Data Visualizations** | Recharts (Responsive bar charts, pie breakdowns, and SLA compliance gauges) |
| **Typography & Icons** | Plus Jakarta Sans, Inter, JetBrains Mono, Google Material Symbols |
| **State Management** | Centralized in-memory shared state (`ComplaintContext.jsx`) with 68+ seed dockets |

---

## 📂 Project Directory Structure

```text
NammaSafe/
├── public/                       # Static public assets & favicons
├── src/
│   ├── assets/                   # Brand assets and images
│   ├── components/
│   │   ├── common/               # Shared UI (Navbar, Sidebar, DataTable, StatusBadge, PriorityBadge, Breadcrumb)
│   │   ├── complaints/           # ComplaintDetailsModal (9-Tab Dossier Inspector)
│   │   └── modals/               # NodalReassignmentModal (4-Step Guided Reassignment)
│   ├── context/
│   │   ├── AuthContext.jsx       # Multi-role RBAC (Citizen, Administrator, Officer, Supervisor)
│   │   ├── ComplaintContext.jsx  # Unified platform state & lifecycle workflows
│   │   └── LanguageContext.jsx   # English & Kannada bilingual support
│   ├── data/
│   │   ├── complaintCategories.js# 11 Government categories, subcategories & Karnataka districts
│   │   ├── complaintsData.js     # 61+ realistic mock grievance dockets
│   │   ├── departmentsData.js    # Departmental metadata, SLAs, and contact emails
│   │   ├── officersData.js       # Officer roster, active caseloads, capacity thresholds
│   │   ├── overdueComplaints.js  # Overdue dockets & follow-up schedules
│   │   ├── reminderRecords.js    # Multi-channel reminder audit trail
│   │   └── reminderTemplates.js  # Bilingual English/Kannada reminder notification templates
│   ├── layouts/                  # Role-based layouts (AdminLayout, CitizenLayout, SupervisorLayout, OfficerLayout)
│   ├── pages/
│   │   ├── admin/                # AllComplaintsView, PendingComplaintsView, OfficerWorkloadView
│   │   ├── citizen/              # RegisterComplaint, TrackComplaint, CitizenHome, CitizenGrievanceDetail
│   │   ├── officer/              # OfficerDashboard, AssignedComplaintsView, ComplaintDetailView
│   │   └── supervisor/           # ReminderCentre, OverdueEscalations, SupervisorDashboardView
│   ├── utils/
│   │   ├── constants.js          # Status matrix, valid transitions, priority configs
│   │   └── trackingIdGenerator.js# RTK-2026-XXXXXX sequential generator
│   ├── App.jsx                   # Central declarative router
│   ├── index.css                 # Custom civic styles & Tailwind directives
│   └── main.jsx                  # Application entry point
├── package.json                  # NPM scripts and dependencies
├── tailwind.config.js            # Tailwind typography, theme extensions & color scales
├── vite.config.js                # Vite build and dev configuration
└── README.md                     # Comprehensive platform documentation
```

---

## 🚀 Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Nagesh-Shimpi/NammaSafe.git
   cd NammaSafe
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will launch on `http://localhost:3000/`.

4. **Production Build**:
   ```bash
   npm run build
   ```
   Generates optimized, production-ready static assets in the `/dist` directory.

---

## 🧪 Interactive Routes & User Roles

Switch roles easily using the top-bar profile switcher to test role-based permissions:

| Route | Role | Description |
|---|---|---|
| `/citizen/register` | Citizen | Comprehensive 4-section grievance registration form with token acknowledgement |
| `/citizen/track` | Citizen | Real-time tracking portal by canonical token (`RTK-2026-XXXXXX`) |
| `/admin/all-complaints` | Administrator | Central management ledger with 8 summary KPI cards and 9-tab dossier inspector |
| `/admin/pending-complaints` | Administrator | Triage & verification desk to certify, request info, or reject dockets |
| `/admin/officer-workload` | Administrator / Supervisor | Cadre workload distribution analytics & 4-step guided nodal reassignment |
| `/supervisor/reminder-centre`| Supervisor | Intelligent reminder centre with omnichannel dispatch & retry queue |
| `/supervisor/overdue-monitoring` | Supervisor | Overdue tracking, Level 1–3 escalations & statutory penalty ledger |

---

## 🔒 Security, Compliance & Data Governance

- **Aadhaar / PII Data Masking**: Citizen phone numbers and personal IDs are automatically masked (`+91 98402 •••• 1928`) in administrative and public audit views.
- **Audit Gazette Integrity**: Rejected complaints and officer actions are never silently deleted; every transaction is chronologically recorded with responsible user stamps.
- **Strict Status Transitions**: The application enforces the Karnataka Redressal State Machine (`NEWLY_REGISTERED` → `PENDING_VERIFICATION` → `VERIFIED` → `ASSIGNED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`).

---

## 📄 License & Attribution

Developed under the **MIT License**. Created for modernizing digital governance and citizen grievance redressal platforms in Karnataka.
