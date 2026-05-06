# LsHRF — Human Resource Management System · Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.11-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**A fully-featured HR management SPA built with React 19, TypeScript, and Redux Toolkit.**  
Role-aware UI, Kanban recruitment pipelines, payroll dashboards, and real-time permission gating.

</div>

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Feature Modules](#feature-modules)
- [Application Architecture](#application-architecture)
- [State Management](#state-management)
- [Routing & Access Control](#routing--access-control)
- [Permission System](#permission-system)
- [UI Design System](#ui-design-system)
- [API Integration](#api-integration)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2.0 |
| Language | TypeScript | 5.9.3 |
| Build Tool | Vite | 7.2.4 |
| State Management | Redux Toolkit | 2.11.2 |
| Routing | React Router DOM | 7.13.0 |
| HTTP Client | Axios | 1.13.2 |
| Styling | Tailwind CSS | 4.1.18 |
| Icons | Lucide React | 0.563.0 |
| Notifications | React Hot Toast | 2.x |
| Date Utilities | date-fns | 4.x |
| Class Utilities | clsx | 2.x |

---

## Feature Modules

The app is organized into self-contained feature modules under `src/features/`. Each module owns its API layer, Redux slice, TypeScript types, pages, and components.

### Authentication (`auth`)
- JWT-based login with persistent token storage
- Auth state in Redux with `user`, `token`, `isAuthenticated`
- Automatic token injection via Axios interceptor
- Redirect to `/login` on 401 responses

### Organization Management (`org`)
- **Tenants:** SUPER_ADMIN manages all client organizations
- **Users:** Create/edit system users, assign system roles and optional custom roles
  - Custom role badge displayed inline in the users table
  - Custom role selector in create/edit modal (fetched live from API)
- **Roles:** Define custom roles with granular permission toggles
  - 30+ permissions grouped by domain (recruitment, payroll, attendance, etc.)
  - Permission grid UI for visual assignment
- **Departments:** Department CRUD for organizational structure

### Employee Management (`employees`)
- Full employee profile with personal details, job info, and salary
- Link employees to system user accounts (dropdown shows name + email + role/custom role)
- Employee lifecycle management
- Avatar URL support
- Employee list with search and department filter

### Recruitment (`recruitment`)

The most feature-rich module — a complete Applicant Tracking System.

#### Job Board (`/recruitment/jobs`)
- Job postings grid with status badges (`OPEN`, `CLOSED`, `DRAFT`, `PAUSED`)
- Create/edit modal with full job details (type, location, salary range, description, requirements, closing date)
- SUPER_ADMIN: tenant selector for cross-tenant job creation
- Toggle job status (open/close)
- Delete with confirmation

#### Candidate Pipeline (`/recruitment/candidates`)

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  APPLIED   │  │ SCREENING  │  │ INTERVIEW  │  │   OFFER    │  │   HIRED    │
│            │  │            │  │            │  │            │  │            │
│ [card]     │  │ [card]     │  │ [card]     │  │ [card]     │  │ [card]     │
│ [card]     │  │ [card]     │  │ [card]     │  └────────────┘  └────────────┘
└────────────┘  └────────────┘  └────────────┘
```

- **Kanban view** with drag-free stage advancement buttons per card
- **Table view** with full candidate list, sortable columns
- Add candidate form: name, email, phone, source, LinkedIn URL, resume URL, notes
- Edit candidate modal: all profile fields editable inline
- Stage update with Redux-optimistic pipeline count sync
- Status management: `ACTIVE`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`
- Interview scheduling modal per candidate:
  - Date/time, duration, type (PHONE/VIDEO/IN_PERSON)
  - Interviewer selector (fetched from users API)
- Interview result recording: feedback text, 1-5 star rating, status
- Export buttons: pipeline report, candidate report, interview report, offer letter (all PDF)

### Leave Management (`leaves`)
- Submit leave requests with date range and type
- Manager approval/rejection workflow
- Leave balance summary cards
- Calendar-style date picker

### Attendance (`attendance`)
- Clock-in / clock-out per employee
- Daily attendance log table
- Monthly attendance summary with late/absent indicators

### Payroll (`payroll`)
- Monthly payroll run initiation
- Per-employee payslip breakdown (gross, deductions, net)
- Payroll status lifecycle badges
- Payslip download (PDF)

### Shift Management (`shifts`)
- Shift template creation (name, start time, end time)
- Employee shift assignment with date ranges
- Weekly schedule calendar view

### Performance Reviews (`performance`)
- Review cycle management
- Self-assessment and manager rating forms
- Goals list with completion tracking
- Status badges: `DRAFT`, `IN_PROGRESS`, `COMPLETED`

### Billing (`billing`)
- Subscription plan display and management
- Invoice list with payment status
- Plan upgrade prompts (for CLIENT_ADMIN)

---

## Application Architecture

```
src/
├── features/                    # Domain feature modules
│   └── {module}/
│       ├── api/                 # Axios API calls
│       ├── store/               # Redux slice (actions + reducers)
│       ├── types/               # TypeScript interfaces & enums
│       ├── pages/               # Route-level page components
│       └── components/          # Module-specific UI components
│
├── common/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar/         # Navigation with permission gating
│   │   │   ├── Header/          # Top bar with user menu
│   │   │   └── AppLayout.tsx    # Authenticated shell layout
│   │   └── ui/                  # Shared UI primitives (buttons, modals, etc.)
│   └── hooks/                   # Shared React hooks
│
├── store/
│   └── index.ts                 # Redux store setup, root reducer
│
├── router/
│   └── routes.tsx               # Route definitions + PrivateRoute guard
│
├── lib/
│   └── api/
│       └── axiosInstance.ts     # Axios base config + interceptors
│
└── main.tsx                     # App entry point
```

### Data Flow

```
User Action
    │
    ▼
Page Component (dispatch)
    │
    ▼
Redux Thunk (createAsyncThunk)
    │
    ▼
API Layer (axiosInstance)
    │
    ▼
Backend REST API
    │
    ▼
Redux Slice (extraReducers)
    │
    ▼
React Component (useSelector re-render)
```

---

## State Management

Redux Toolkit manages all server state. Each feature has its own slice:

| Slice | State Shape |
|---|---|
| `auth` | `user`, `token`, `isAuthenticated`, `loading` |
| `recruitment` | `jobs[]`, `candidates[]`, `interviews[]`, `pipeline`, `selectedJob` |
| `employees` | `employees[]`, `loading`, `error` |
| `leaves` | `leaves[]`, `balances`, `loading` |
| `attendance` | `records[]`, `summary`, `loading` |
| `payroll` | `payrolls[]`, `payslips[]`, `loading` |
| `performance` | `reviews[]`, `goals[]`, `loading` |
| `shifts` | `shifts[]`, `assignments[]`, `loading` |
| `billing` | `plans[]`, `invoices[]`, `loading` |

### Async Thunk Pattern

```typescript
// Every API operation follows this pattern:
export const fetchJobs = createAsyncThunk(
  'recruitment/fetchJobs',
  async () => await recruitmentApi.getJobs()
);

// Slice handles all three states:
builder
  .addCase(fetchJobs.pending, (state) => { state.loading = true; })
  .addCase(fetchJobs.fulfilled, (state, action) => {
    state.loading = false;
    state.jobs = action.payload;
  })
  .addCase(fetchJobs.rejected, (state, action) => {
    state.loading = false;
    state.error = action.error.message;
  });
```

### Optimistic UI Updates

The recruitment pipeline maintains a `PipelineSummary` with `countPerStage`. When a candidate's stage is updated, the slice immediately adjusts the count — no refetch needed:

```typescript
.addCase(updateCandidateStage.fulfilled, (state, action) => {
  const oldStage = state.candidates[index].currentStage;
  state.candidates[index] = action.payload;
  state.pipeline.countPerStage[oldStage]--;
  state.pipeline.countPerStage[action.payload.currentStage]++;
})
```

---

## Routing & Access Control

### Route Structure

```
/login                           (public)
/
├── /dashboard                   (all authenticated users)
├── /org
│   ├── /tenants                 (SUPER_ADMIN only)
│   ├── /users                   (CLIENT_ADMIN+)
│   ├── /roles                   (CLIENT_ADMIN+)
│   └── /departments             (CLIENT_ADMIN+)
├── /employees                   (MANAGER+)
├── /recruitment
│   ├── /jobs                    (MANAGER+)
│   └── /candidates              (MANAGER+)
├── /attendance                  (MANAGER+)
├── /leaves                      (all employees)
├── /payroll                     (CLIENT_ADMIN+)
├── /shifts                      (MANAGER+)
├── /performance                 (MANAGER+)
└── /billing                     (CLIENT_ADMIN+)
```

### PrivateRoute Guard

```tsx
// Routes are wrapped in PrivateRoute which checks:
// 1. isAuthenticated (redirects to /login if false)
// 2. hasPermission(requiredPermission) (shows 403 if false)
<PrivateRoute permission="RECRUITMENT_VIEW">
  <CandidatePipelinePage />
</PrivateRoute>
```

---

## Permission System

Permissions are evaluated client-side based on the authenticated user's role and custom role permissions stored in the JWT/auth state.

### Permission Check

```typescript
const hasPermission = (permission: Permission): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.customPermissions) return user.customPermissions.includes(permission);
  return getDefaultPermissions(user.role).includes(permission);
};
```

### Sidebar Gating

```tsx
// Each sidebar item is conditionally rendered:
{hasPermission('RECRUITMENT_VIEW') && (
  <NavItem to="/recruitment/jobs" icon={Briefcase} label="Recruitment" />
)}
```

### Default Permissions by Role

| Permission | EMPLOYEE | MANAGER | CLIENT_ADMIN | SUPER_ADMIN |
|---|---|---|---|---|
| `RECRUITMENT_VIEW` | — | ✓ | ✓ | ✓ |
| `RECRUITMENT_MANAGE` | — | ✓ | ✓ | ✓ |
| `PAYROLL_VIEW` | — | — | ✓ | ✓ |
| `PAYROLL_MANAGE` | — | — | ✓ | ✓ |
| `USER_MANAGE` | — | — | ✓ | ✓ |
| `TENANT_MANAGE` | — | — | — | ✓ |
| `LEAVE_VIEW` | ✓ | ✓ | ✓ | ✓ |
| `ATTENDANCE_VIEW` | — | ✓ | ✓ | ✓ |

---

## UI Design System

### Color Palette

| Usage | Tailwind Class | Notes |
|---|---|---|
| Primary actions | `bg-indigo-600` | Buttons, active states |
| Success / Hired | `bg-green-100 text-green-700` | Status badges |
| Warning / Pending | `bg-yellow-100 text-yellow-700` | Status badges |
| Danger / Rejected | `bg-red-100 text-red-700` | Status badges |
| Custom Roles | `bg-violet-50 text-violet-600` | Role badges |
| System Roles | `bg-blue-50 text-blue-600` | Role badges |
| Surface | `bg-white` + `border border-gray-100` | Cards, modals |
| Background | `bg-gray-50` | Page backgrounds |

### Typography

- Headers: `text-2xl font-bold text-gray-900`
- Subheaders: `text-lg font-semibold text-gray-800`
- Body: `text-sm text-gray-600`
- Labels: `text-xs font-medium text-gray-500 uppercase tracking-wide`

### Component Patterns

```tsx
// Status badge pattern used throughout:
<span className={clsx(
  "px-2.5 py-0.5 rounded-full text-xs font-medium",
  status === 'OPEN' && "bg-green-100 text-green-700",
  status === 'CLOSED' && "bg-red-100 text-red-700",
  status === 'DRAFT' && "bg-gray-100 text-gray-600",
  status === 'PAUSED' && "bg-yellow-100 text-yellow-700",
)}>
  {status}
</span>

// Card pattern:
<div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
  ...
</div>

// Modal overlay:
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
    ...
  </div>
</div>
```

### Loading States

All async operations show a spinner overlay or skeleton:

```tsx
{loading && (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
  </div>
)}
```

---

## API Integration

### Axios Instance

```typescript
// src/lib/api/axiosInstance.ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — injects JWT
axiosInstance.interceptors.request.use(config => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handles 401
axiosInstance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) store.dispatch(logout());
    return Promise.reject(err);
  }
);
```

### API Module Pattern

```typescript
// Each feature's api/ file exports a plain object:
export const recruitmentApi = {
  getJobs: () =>
    axiosInstance.get<JobPosting[]>('/recruitment/jobs').then(r => r.data),
  createJob: (data: JobPostingRequest) =>
    axiosInstance.post<JobPosting>('/recruitment/jobs', data).then(r => r.data),
  // ...
};
```

### File Downloads

PDF exports use `arraybuffer` response type and trigger browser download:

```typescript
const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `pipeline-report-${jobId}.pdf`;
a.click();
URL.revokeObjectURL(url);
```

---

## Environment Variables

Create a `.env` file in the project root:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api` |

```bash
# .env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+ or pnpm 9+
- LsHRB backend running on port 8080

### 1. Install Dependencies

```bash
cd LsHRF
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit VITE_API_BASE_URL to point to your backend
```

### 3. Start Dev Server

```bash
npm run dev
# Opens at http://localhost:5173
```

### 4. Build for Production

```bash
npm run build
# Output in dist/
```

### 5. Preview Production Build

```bash
npm run preview
```

### TypeScript Check

```bash
npx tsc --noEmit
```

---

## Project Structure

```
LsHRF/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.tsx                          # App entry — Redux Provider + Router
│   ├── App.tsx                           # Router outlet
│   │
│   ├── store/
│   │   └── index.ts                      # Redux store + root reducer
│   │
│   ├── router/
│   │   └── routes.tsx                    # All route definitions
│   │
│   ├── lib/
│   │   └── api/
│   │       └── axiosInstance.ts          # Axios base instance + interceptors
│   │
│   ├── common/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx         # Authenticated shell
│   │   │   │   ├── Sidebar/
│   │   │   │   │   └── Sidebar.tsx       # Nav with permission gating
│   │   │   │   └── Header/
│   │   │   │       └── Header.tsx        # Top bar + user menu
│   │   │   └── ui/                       # Shared primitive components
│   │   └── hooks/                        # usePermissions, useDebounce, etc.
│   │
│   └── features/
│       ├── auth/
│       │   ├── api/authApi.ts
│       │   ├── store/authSlice.ts
│       │   ├── types/auth.types.ts
│       │   └── pages/LoginPage.tsx
│       │
│       ├── org/
│       │   ├── api/
│       │   │   ├── userApi.ts
│       │   │   ├── tenantApi.ts
│       │   │   └── roleApi.ts
│       │   ├── store/
│       │   │   └── orgSlice.ts
│       │   ├── types/
│       │   │   └── user.types.ts
│       │   └── pages/
│       │       ├── UserListPage.tsx
│       │       ├── TenantListPage.tsx
│       │       └── RolesPage.tsx
│       │
│       ├── employees/
│       │   ├── api/employeeApi.ts
│       │   ├── store/employeeSlice.ts
│       │   ├── types/employee.types.ts
│       │   ├── pages/EmployeeListPage.tsx
│       │   └── components/EmployeeFormModal.tsx
│       │
│       ├── recruitment/
│       │   ├── api/recruitmentApi.ts
│       │   ├── store/recruitmentSlice.ts
│       │   ├── types/recruitment.types.ts
│       │   └── pages/
│       │       ├── JobBoardPage.tsx
│       │       └── CandidatePipelinePage.tsx
│       │
│       ├── leaves/
│       ├── attendance/
│       ├── payroll/
│       ├── shifts/
│       ├── performance/
│       └── billing/
│
├── index.html
├── vite.config.ts                        # @ alias → ./src
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

<div align="center">

Built with **React 19 · TypeScript 5 · Vite 7 · Redux Toolkit · Tailwind CSS 4**

---

A part of **LIJI GROUPS** project &nbsp;|&nbsp; Copyright &copy; Liji Groups. All rights reserved.

</div>
