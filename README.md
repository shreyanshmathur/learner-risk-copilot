# Learner Risk Copilot

A lightweight, polished web dashboard that helps Learner Success and Onboarding teams identify learners likely to request refunds within the first 7–14 days after enrollment, understand why they are at risk, and act on a recommended intervention.

---

## What was built

This POC converts the refund analysis into an operational workflow. Instead of waiting for refund requests, it creates a daily early-warning queue using learner activation signals such as Dashboard Walkthrough completion, Week 0 attendance, overall attendance percentage, mentor session booking, communication engagement, and learner notes. The AI layer summarises likely risk reasons and recommends the next best intervention for the learner success team.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| File parsing | PapaParse (CSV) + SheetJS (Excel) |
| Backend | Node.js + Express |
| AI | Groq API (llama-3.3-70b-versatile) with rule-based fallback |

---

## Risk scoring logic

| Signal | Points |
|--------|--------|
| Dashboard Walkthrough not completed | +2 |
| Week 0 sessions attended = 0 | +3 |
| Week 0 sessions attended = 1 | +2 |
| Overall Attendance < 25% | +3 |
| Mentor session not booked | +1 |
| Communication Click Rate = 0 or missing | +1 |
| Notes mention: finance, loan, EMI, fee, payment | +2 |
| Notes mention: time, workload, job, office, schedule | +2 |
| Notes mention: personal, family, medical, emergency | +2 |
| Notes mention: expectation mismatch, sales promise, course fit | +2 |

**Risk bands:**
- 0–2 pts → Low Risk
- 3–5 pts → Medium Risk
- 6+ pts → High Risk

---

## Quick start

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the Groq API key

Copy `.env.example` to `.env` and add your key:

```bash
cp .env.example .env
# then edit .env and set GROQ_API_KEY=your_key_here
```

The `.env` file is already pre-configured if you received this project with a key.

> **Note:** The app works without a Groq key — it falls back to rule-based insights automatically.

### 3. Run the app

```bash
npm run dev
```

This starts both:
- **Backend** at `http://localhost:3001`
- **Frontend** at `http://localhost:3000`

Open your browser at **http://localhost:3000**.

---

## How to use

### Demo with sample data
1. Open the app
2. Click **"Use sample dataset (12 learners)"**
3. The dashboard will populate with risk scores and AI-generated insights

### Upload a real file
1. Click the upload area or drag a `.csv` or `.xlsx` file
2. The tool auto-maps column names (tolerates variations like "DBWT", "learner_id", "Attendance %", etc.)
3. Risk scores are calculated instantly; AI insights are generated in the background

### Supported column names (flexible matching)
- Learner ID: `Learner ID`, `learner_id`, `ID`, `uid`
- Learner Name: `Learner Name`, `name`, `student name`
- Dashboard Walkthrough: `Dashboard Walkthrough Completed`, `DBWT`, `Walkthrough`
- Week 0 Sessions: `Week 0 Sessions Attended`, `Week0 Sessions`, `W0 Sessions`
- Overall Attendance: `Overall Attendance %`, `Attendance`, `Attendance %`
- Mentor Session: `Mentor Session Booked`, `Mentor`, `Session Booked`
- Click Rate: `Communication Click Rate`, `Click Rate`, `CTR`
- Notes: `Support Notes`, `Counselor Notes`, `Refund Comments`

### View learner detail
Click any row in the priority queue to open the detail panel with:
- Activation signal breakdown
- Risk triggers detected
- AI risk summary
- Likely refund reason
- Recommended intervention
- Suggested counselor call script

### Export the risk queue
Click **Export CSV** in the top right. The file includes all risk scores, AI insights, and SLA targets.

---

## Project structure

```
ScalerPOC/
├── server/
│   ├── server.js           # Express API server
│   └── utils/
│       └── aiService.js    # Groq API integration + fallback
├── client/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── FileUpload.jsx
│       │   ├── KPICards.jsx
│       │   ├── RiskChart.jsx
│       │   ├── PriorityQueue.jsx
│       │   └── LearnerDetail.jsx
│       ├── utils/
│       │   ├── columnMapper.js
│       │   ├── riskScoring.js
│       │   └── fallbackInsights.js
│       └── data/
│           └── sampleData.js
├── .env.example
└── README.md
```
