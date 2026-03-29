==================================================
FASE 1 — SETUP & DATABASE
==================================================

PROMPT 0 (Database & Multi-tenant Setup)
Initialize the Supabase database schema and RLS policies.

Requirements:
- Use the provided `schema_db_supebase.sql` to create all tables.
- The system is MULTI-TENANT from day 1. All users, processes, and candidates belong to a `client_id` via the `client_users` table.
- Implement Row Level Security (RLS) policies to ensure clients only see their own data.
- Global tests have `client_id` as null, private tests have a specific `client_id`.

Deliver:
- Executed SQL schema
- Configured RLS policies

=================

PROMPT 1
Initialize a production-ready Next.js application using App Router, TypeScript, and Tailwind CSS.

Requirements:
- Use feature-based folder structure (not flat)
- Separate UI, hooks, services, and domain logic
- Configure Supabase client (server + client)
- Environment variables must be typed and validated
- Add ESLint and Prettier configuration

Architecture & Design rules:
- No business logic inside components
- Use server actions for mutations
- Server State: Use React Query for data fetching and caching.
- UI System: Use Shadcn UI (or Radix primitives) for a premium, clean design.
- Multi-tenant: Every fetch must securely filter by the current user's `client_id`.

Deliver:
- Folder structure
- Supabase setup
- Example feature module
- Clean and scalable base

=================

PROMPT 2
Implement authentication using Supabase.

Requirements:
- Email login (magic link or OTP)
- Store user role (admin, client)
- Protect routes based on role

Deliver:
- Auth pages
- Middleware for protected routes
- Session handling

==================================================
FASE 2 — CANDIDATE FLOW
==================================================

PROMPT 1
Build a production-ready candidate test flow.

Context:
Candidates access via a unique token and complete assigned tests.

Requirements:

Access:
- Validate token securely against database
- Reject expired or invalid tokens
- Load candidate + process context

Test Engine:
- Fetch tests, questions, and options dynamically
- Support multiple question types (forced_choice, likert)
- Questions must be paginated (not all at once)

State Management:
- Use custom hook (useTestEngine)
- Keep UI stateless

Security:
- Validate candidate ownership in backend
- Never trust client-side only validation

Deliver:
- Page implementation
- useTestEngine hook
- Data fetching logic

=================

PROMPT 2
Load test data dynamically.

Requirements:
- Fetch tests assigned to process
- Fetch questions and options
- Render questions dynamically
- Support forced_choice and likert

Deliver:
- Data loading logic
- UI components for questions

=================

PROMPT 3
Implement a robust autosave system for test responses.

Requirements:
- Save answers immediately on selection
- Use debounce (300–500ms)
- Use upsert (candidate_id, question_id)
- Prevent duplicate submissions
- Handle concurrent updates safely

Failure Handling:
- Retry failed requests
- Show error state in UI

Performance:
- Avoid unnecessary API calls
- Minimize re-renders

Deliver:
- useAutosave hook
- Retry mechanism
- Error handling strategy

=================

PROMPT 4
Implement countdown timer for test.

Requirements:
- Start timer when test begins
- Disable answers when time ends
- Persist remaining time if page reloads
- Validate time on backend

Deliver:
- Timer hook
- UI component
- Backend validation logic

=================

PROMPT 5
Implement test completion flow.

Requirements:
- Detect when all questions are answered
- Mark candidate as completed
- Show success message
- Prevent re-entry

Deliver:
- Completion logic
- UI confirmation page

==================================================
FASE 3 — SCORING ENGINE
==================================================

PROMPT 1
Build a scalable scoring engine.

Requirements:

Input:
- Candidate responses
- Question → dimension mapping
- Dimension → competency mapping

Processing:
1. Aggregate scores per dimension
2. Normalize scores (1–10)
3. Map to competencies
4. Apply weights

Architecture:
- Pure functions only
- No side effects
- No hardcoded logic

Deliver:
- scoringEngine.ts
- clear data flow
- Comprehensive unit tests (using Jest/Vitest) testing mathematical edge cases

=================

PROMPT 2
Normalize dimension scores.

Requirements:
- Handle min/max scaling
- Avoid division by zero
- Ensure consistent 1–10 output

Deliver:
- Normalization function

=================

PROMPT 3
Map dimension scores to competencies.

Requirements:
- Use dimension_competency_map
- Apply weights
- Calculate final score

Deliver:
- Competency calculation logic

=================

PROMPT 4
Implement safe dynamic formula evaluation.

Requirements:
- Do NOT use eval
- Use a safe parser (expr-eval or mathjs)
- Replace variables (Q1, Q2...) with answers

Validation:
- Validate formula before execution
- Handle invalid formulas

Deliver:
- Formula evaluator
- Validation layer

==================================================
FASE 4 — CLIENT
==================================================

PROMPT 1
Build a production-ready client dashboard.

Requirements:
- Show processes with pagination
- Show metrics:
  - total candidates
  - completed
  - pending
- Avoid N+1 queries

UX:
- Loading states
- Empty states
- Error states

Deliver:
- Dashboard UI
- Optimized queries

=================

PROMPT 2
Implement process creation.

Requirements:
- Select tests or combos
- Add candidates (email list)
- Set start and end dates

Deliver:
- Form UI
- Backend logic

=================

PROMPT 3
Show candidate progress.

Requirements:
- Completed vs pending
- Ability to resend invitations
- Basic statistics

Deliver:
- Table UI
- Actions

==================================================
FASE 5 — ADMIN & REPORTS
==================================================

PROMPT 1
Build admin panel.

Requirements:
- CRUD tests
- CRUD questions
- CRUD options
- No hardcoded logic

Deliver:
- Admin UI
- CRUD logic

=================

PROMPT 2
Implement mapping system.

Requirements:
- Assign weights dynamically
- Map questions → dimensions
- Persist mappings in DB

Deliver:
- Mapping UI
- Persistence logic

=================

PROMPT 3
Build candidate report system.

Requirements:
- Show dimension scores
- Show competency scores
- Display interpretation text based on ranges

Deliver:
- Report UI

=================

PROMPT 4
Build ranking system.

Requirements:
- Rank candidates by selected competencies
- Handle ties
- Sort descending

Deliver:
- Ranking logic
- UI table

==================================================
FASE 6 — (MERGED INTO FASE 1)
==================================================
(Note: Multi-tenant architecture and RLS are now enforced from Day 1 in Fase 1 to avoid massive refactoring).

==================================================
FASE 7 BILLING (💸 AQUÍ ESTÁ EL NEGOCIO)
==================================================

Implement a billing system using Stripe.

Context:
Clients pay for using the platform.

Requirements:

Plans:
- Free plan (limited usage)
- Paid plan (monthly subscription)

Billing Model:
- Charge per candidate OR per process
- Store usage in database

Stripe:
- Create products and prices
- Handle subscriptions
- Webhooks for:
  - payment success
  - subscription updates

Database:
- subscriptions table
- usage tracking table

Logic:
- Block features if subscription inactive
- Track usage in real-time

Deliver:
- Stripe integration
- Webhook handler
- Usage tracking logic

==================================================
FASE 8 LIMITS & CONTROL
==================================================

Implement usage limits and feature gating.

Requirements:

Limits:
- Max candidates per month
- Max processes per month

Logic:
- Check limits before:
  - creating process
  - adding candidates

Behavior:
- If limit reached:
  - block action
  - show upgrade message

Performance:
- Cache usage counters
- Avoid heavy queries

Deliver:
- Limit validation service
- Middleware for enforcement

==================================================
FASE 9 EMAIL SYSTEM (REAL)
==================================================

Implement a transactional email system.

Context:
Candidates receive invitations and notifications.

Requirements:

Provider:
- Use Resend or similar

Emails:
- Invitation email with token link
- Reminder email
- Completion confirmation

Features:
- Retry failed emails
- Track delivery status

Templates:
- Use reusable templates
- Dynamic variables (name, link, deadline)

Security:
- Tokens must be secure and expirable

Deliver:
- Email service
- Templates
- Sending logic

==================================================
FASE 10 OBSERVABILITY (PRO LEVEL)
==================================================

Implement logging and monitoring.

Requirements:

Logs:
- Track:
  - errors
  - user actions
  - scoring execution

Tools:
- Use a logging service (or custom table)

Error Handling:
- Centralized error handler
- Log all failures

Metrics:
- Track:
  - number of tests completed
  - average completion time

Deliver:
- Logging system
- Error tracking
- Metrics collection

==================================================
FASE 11 SECURITY HARDENING
==================================================

Improve application security.

Requirements:

Backend:
- Validate all inputs
- Sanitize data

Auth:
- Ensure role-based access
- Protect admin routes

Data:
- Prevent unauthorized access
- Validate ownership

Rate limiting:
- Prevent abuse (especially candidate endpoints)

Deliver:
- Security improvements
- Validation layer

==================================================
FASE 12 PERFORMANCE
==================================================

Optimize performance.

Requirements:

Frontend:
- Use server components where possible
- Lazy load heavy components

Backend:
- Optimize queries
- Avoid N+1 problems

Caching:
- Cache:
  - dashboard data
  - scoring results

Deliver:
- Performance improvements
- Optimized queries

==================================================
FASE 13 DEPLOYMENT
==================================================

Prepare application for production deployment.

Requirements:

Environment:
- Separate dev and prod configs

CI/CD:
- Setup build pipeline

Deployment:
- Use Vercel or similar

Secrets:
- Secure environment variables

Deliver:
- Deployment config
- CI/CD setup

==================================================
PATHWAY
==================================================

1. MVP & Multi-tenant (Fases 1–5)
2. Billing (Fase 7)
3. Limits (Fase 8)
4. Emails (Fase 9)
5. Observability & Security (Fases 10-11)
6. Performance & Deploy (Fases 12-13)