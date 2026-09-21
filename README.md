# 🎓 AISA — AI-Powered Student Assistant & Academic Governance Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Flash%20%26%20Pro-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **AISA** is a next-generation academic learning platform engineered for engineering universities. It bridges Socratic AI tutoring with strict institutional academic integrity, featuring real-time exam lockdown buffers, human-in-the-loop faculty escalation, and a comprehensive administrator control studio.

---

## 🌟 Key Highlights

- **🧠 Socratic AI Tutor:** Grounded in official engineering curriculum (Unit 1 to Unit 5). Prompts guide students to first principles instead of spoon-feeding direct exam solutions.
- **🛡️ Anti-Cheating Exam Lockout:** Automated $\pm$30-minute buffer window around scheduled tests with live real-time countdown widget and query freezing.
- **👩‍🏫 Human-in-the-Loop Faculty Escalation:** Students can flag hallucinations or difficult questions; faculty resolve doubts with a forensic dossier and push **"🎓 Verified Faculty Answers"** directly into student chats.
- **🏛️ Institutional Admin Dashboard:** 
  - User Directory with 42 Student accounts & 8 Faculty profiles.
  - Drag-and-drop Syllabus & Lecture Notes RAG Ingestion portal.
  - Analytics Dashboard tracking 3,420+ student doubts and topic distribution.
  - Automated 1-click Student Performance Email alerts (native OS mail + direct Gmail compose).
  - AI Study Notes Generator and cohort-wide broadcast studio.

---

## 🚀 Sprints Roadmap & Feature Delivery

### 📌 Sprint 1: Platform Foundation & Design System
- Core project setup with React 19, Vite, and Tailwind CSS.
- Permanent academic light theme design system with warm amber/orange institutional accents.
- Landing page with 3D interactive hero, value proposition, and feature matrix.
- Firebase Authentication integration (Google OAuth 2.0 & Email/Password).

### 📌 Sprint 2: Student Dashboard & Socratic Chat Engine
- Complete B.Tech CSE Semester 1 to 8 curriculum hierarchy (`curriculumData.js`).
- Subject cards, progress meters, category filters (Core, Programming, Web, Labs).
- Interactive Socratic AI chat drawer with prompt chips, code block copy, and LaTeX support.
- Google Gemini REST API integration (`gemini-flash-latest`) with strict academic prompt guidelines.
- Persistent conversation storage via Web Storage API (`localStorage`).

### 📌 Sprint 3: Academic Integrity, Exam Lockout & Faculty Escalation
- **Exam Lockout Service (`examLockService.js`):**
  - $\pm$30-minute automated pre- and post-exam lockdown window.
  - Live ticking countdown timer widget in header and banner.
  - Complete freezing of AI query input during active exam hours.
- **Faculty Doubt Escalation Flow (`FR-FAC`):**
  - Inline **"Ask Teacher"** action button under AI responses.
  - Feedback modal with Thumbs Up/Down for hallucination reporting.
  - Confirmation modal with custom student doubt note textarea.
  - **"🎓 Verified Faculty Answer"** badge rendered in student chat when faculty replies.
  - Faculty Audit Queue with status filters (*All*, *Pending Review*, *Resolved*).

### 📌 Sprint 4: Admin Governance, RAG Ingestion & Analytics
- **Curriculum & Notes Ingestion Studio (`FR-ADMIN`):**
  - Drag-and-drop PDF/Notes upload zone with animated 0% ➔ 100% progress indicator.
  - 1-Click Quick Demo Upload for viva/evaluation demonstrations.
- **Admin User Management Directory:**
  - Sub-tab switcher: 42 Student accounts (CGPA, attendance, status) vs 8 Faculty directory profiles.
- **Basic Analytics Dashboard:**
  - Real-time metrics: 3,420 total doubts asked, 96.4% resolution rate.
  - Topic distribution visual graphs (Normalization, B+ Trees, Concurrency).
- **Automated Student Performance Email Alerts:**
  - 1-click **"Email Performance Alert"** (`mailto:`) and **"Open in Gmail Web"** compose buttons.
  - Pre-populates recipient, subject, live CGPA, attendance, subject marks, and faculty recommendations.
- **Backend Indexing & Error Hardening:**
  - Multi-model Gemini cascading fallback (`gemini-flash-latest` ➔ `gemini-2.5-flash` ➔ `gemini-2.5-pro`).
  - Offline academic fallback generator for zero-downtime learning sessions.
  - Global React `ErrorBoundary` preventing blank screens.
  - Cohort locking on upcoming Semester 7 & Semester 8.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **3D & Graphics** | Three.js, Canvas WebGL |
| **AI Engine** | Google Gemini REST API (Flash & Pro models) |
| **Authentication** | Firebase Authentication (Google OAuth + Email/Password) |
| **Data & Storage** | Modular Indexed JSON Stores, Browser `localStorage` |
| **Tooling** | Oxlint, PostCSS, Git, GitHub Actions |

---

## 📦 Project Structure

```
AISAAAAA/
├── public/
│   ├── gemini_generated_video_5ff571c6.mp4  # Showcase video
│   └── hero-video.mp4                      # Hero video asset
├── src/
│   ├── assets/                             # Static brand assets
│   ├── components/
│   │   ├── AdminDashboardPage.jsx          # Admin Portal & Faculty Directory
│   │   ├── AdminLoginPage.jsx              # Faculty authentication
│   │   ├── ChatAssistantModal.jsx          # Standalone Socratic AI modal
│   │   ├── DashboardPage.jsx               # Student Dashboard & AI Drawer
│   │   ├── ErrorBoundary.jsx               # Global React error safety boundary
│   │   ├── FormattedChatMessage.jsx        # Markdown, code & citation renderer
│   │   ├── LandingPage.jsx                 # Public landing page & course modules
│   │   ├── LoginPage.jsx                   # Student authentication
│   │   ├── Navbar.jsx                      # Navigation & role switchers
│   │   └── StudentNotesHub.jsx             # Notes & revision materials hub
│   ├── data/
│   │   ├── aiAuditData.js                  # Flagged doubts & audit dossiers
│   │   ├── curriculumData.js               # Semesters 1-8 syllabus taxonomy
│   │   └── studentsData.js                 # 42 student performance records
│   ├── services/
│   │   ├── examLockService.js              # Real-time ±30m exam lockout timing
│   │   ├── geminiService.js                # Multi-model Gemini API & fallback
│   │   └── notesBroadcastService.js        # RAG notes & email broadcast
│   ├── App.jsx                             # Screen router & synchronized lock state
│   ├── firebase.js                         # Firebase Auth configuration
│   └── main.jsx                            # React 19 root mounting
├── .env.example                            # Template for environment variables
├── package.json                            # Dependencies and scripts
├── tailwind.config.js                      # Custom color palette & fonts
└── vite.config.js                          # Vite build configuration
```

---

## 💻 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Sahilp2407/AISA-Learning-.git
cd AISA-Learning-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the example environment file and add your Gemini API key:
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(A valid Google Gemini API key can be obtained from [Google AI Studio](https://aistudio.google.com/).)*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🔑 Demo Credentials

| Role | Portal URL / Action | Default User |
|---|---|---|
| **Student** | Click **"Student Portal"** | `aditi.sharma@univ.edu` (3rd Year, B.Tech CSE) |
| **Faculty Admin** | Click **"Faculty / Admin Portal"** | `rajesh.kumar@univ.edu` (Department Chair) |

*(Instant testing shortcuts and demo 1-click buttons are available on all login screens for quick presentations).*

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Sahil Pandey**  
- GitHub: [@Sahilp2407](https://github.com/Sahilp2407)
