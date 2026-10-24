# ClassPulse — Early Academic Support Dashboard

**Suggested Ministry Alignment:** Ministry of Education  
**Application Category:** Educational SaaS & Early Academic Intervention Platform

---

## 1. Project Overview & Problem Statement

### The Problem
In traditional educational settings, teachers often discover critical student academic difficulties only after multiple cumulative evaluations, midterms, or end-of-term reports—when remedial catch-up is significantly harder and costlier for the learner.

### The Solution: ClassPulse
**ClassPulse** is a responsive, modern web application that combines daily attendance patterns and assessment trajectories to flag learners who may benefit from early teacher support.

### Core Pedagogical Philosophy
- **Explainable Indicators over "Black Box" AI**: Every alert explains *precisely* which rule was triggered, displays the exact observed measurement against the configured threshold, and explains the rationale in plain language.
- **Teacher Autonomy**: Teachers retain complete discretion to acknowledge, investigate, create support plans, or adjust permitted risk thresholds.
- **Strictly Non-Punitive**: ClassPulse **never** automatically labels a student as a failure, assigns negative ranks, or makes automated high-stakes decisions regarding promotion, admissions, discipline, or tracking.

---

## 2. Key Features

- **Dashboard Overview**: Dynamic summary cards (Total Students, Active Classes, Avg Attendance %, Avg Assessment %, Flagged Learners, Pending Follow-ups), attendance trend area charts, assessment performance progression lines, and class-by-class comparison charts.
- **Student Management**: Filterable directory (by class, status, score trend), search by name or student ID, pagination, and detailed student profile dossiers.
- **Student Profile Dossiers**:
  - Longitudinal attendance history with transparent calculation formula.
  - Multi-assessment scores table with raw-to-percentage normalization.
  - Chronological performance trajectory chart.
  - Explainable indicator evidence cards.
  - Teacher intervention notes (distinguishing private staff notes from learner portal guidance).
- **Attendance Management**:
  - Class-by-class session recording (Present, Absent, Excused).
  - Explicit Excused Absence policy: exempts medical/school absences without penalizing attendance rate.
  - Formula: `Attendance % = (Classes Attended / Total Eligible Classes) × 100`.
  - Zero eligible classes safely handled without division-by-zero errors.
- **Assessment Management**:
  - Evaluation creation with custom maximum marks (e.g. 40, 50, 75, 100).
  - Validation: rejects negative marks or marks exceeding maximum score.
  - Score normalization to percentage.
  - **Pedagogical Integrity**: Missing assessments are explicitly tagged as "Missing" and are **never** treated as zero marks in trend calculations.
- **Explainable Risk Indicators (Core Engine)**:
  - Attendance review threshold (default < 75%).
  - Recent assessment average threshold (default < 40%).
  - Significant performance decline threshold (default ≥ 15 percentage points drop between consecutive tests).
  - Minimum assessment count guardrail (minimum 2 valid assessments required; otherwise flagged as "Insufficient Data", preventing premature decline flags).
- **Risk Indicator Settings**:
  - Configurable threshold sliders with **Live Policy Impact Preview** showing in real time how many students would be flagged before saving.
  - Audit trail logging threshold changes.
  - Reset to Demo Defaults button with confirmation dialog.
- **Intervention & Follow-up Tracking**:
  - Action plans: Student Check-in, Scaffolded Practice, Remedial Session, Study Hall Progress Review, Guardian Consultation, Peer Tutoring.
  - Overdue follow-up alert badges.
  - Status progression: Pending → In Progress → Completed (with resolution notes).
- **Reports & Real CSV Export**:
  - Downloadable CSV reports formatted for official reporting.
  - Staff notes excluded from student exports by default for student privacy.
  - Printable layout view (`window.print()`).
- **Role-Based Access & Demo Role Switcher**:
  - **Administrator**: Full system access, class management, learner enrollment, and system-wide threshold settings.
  - **Teacher**: Class-scoped access, attendance/assessment entry, explainable review dossiers, intervention tracking, and private notes.
  - **Student**: Access restricted solely to personal attendance, score progression, and teacher guidance; internal staff notes and other students' records are strictly inaccessible.
  - **Demo Role Switcher**: Prominently marked as **DEMO ONLY** at top-right for presentation convenience.

---

## 3. Technology Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS v4 with custom tokens (Deep Purple `#6D28D9` primary, modern glassmorphic accents, light theme by default, and dark mode toggle)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router v7
- **Dual Persistence Architecture**:
  1. **Demo Mode (Default)**: Fast local storage persistence with 36 diverse synthetic student records across 3 classes.
  2. **Production Mode (Supabase)**: Activated when environment variables are supplied. Uses Row Level Security (RLS) policies.
- **Testing**: Node.js test suite (`tests/calculations.test.js`) validating 23 calculation and risk rules scenarios.

---

## 4. Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone or navigate to the repository
cd "INNOVATIVE CONCLAVE 2"

# Install dependencies
npm install

# Run automated calculation & risk rules tests
npm test

# Start the Vite local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 5. Automated Verification Tests

ClassPulse includes automated verification tests in `tests/calculations.test.js` verifying:
1. Attendance percentage calculation and excused absence exemptions.
2. Division-by-zero safety when eligible sessions equal 0.
3. Raw mark percentage normalization.
4. Handling of missing assessments (null vs 0).
5. Insufficient assessment data handling (<2 tests).
6. Performance decline detection (delta calculation).
7. Attendance threshold rule triggers.
8. Low assessment baseline triggers.
9. Significant score decline triggers.
10. Multi-factor rule synthesis.
11. Dynamic recalculation when risk settings change.
12. Form input validation (negative marks, exceeding max marks, out-of-range thresholds).

Run all tests:
```bash
npm test
```

---

## 6. Supabase Cloud Configuration & Production Deployment

To connect ClassPulse to a production Supabase database:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project dashboard.
3. Paste the contents of `supabase_schema.sql` (located in the project root) and click **Run**.
   - This creates all tables, enums, performance indexes, and **Row Level Security (RLS)** policies.
4. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Restart the development server (`npm run dev`) or build for production (`npm run build`). The system status indicator in the topbar will update to **Supabase Cloud (Live)**.

---

## 7. Build for Production

```bash
npm run build
```
Generates optimized static assets in `dist/`, ready for zero-configuration deployment to **Vercel** or **Netlify**.

---

## 8. Alignment with Ministry of Education Standards

ClassPulse was designed to model how modern web software can elevate early intervention without diminishing teacher judgment:
- **Transparency**: Every recommendation cites verifiable evidence.
- **Privacy by Design**: Sensitive guardian contacts and private staff notes are separated from student views.
- **Accessibility & Contrast**: Conforms to WCAG AA color contrast standards.
- **Accountability**: All threshold updates and intervention resolutions are logged in an immutable audit trail.
