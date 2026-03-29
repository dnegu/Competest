Initialize a production-ready Next.js application using App Router, TypeScript, and Tailwind CSS.

Requirements:
- Use feature-based folder structure (not flat)
- Separate UI, hooks, services, and domain logic
- Configure Supabase client (server + client)
- Environment variables must be typed and validated
- Add ESLint and Prettier configuration

Architecture rules:
- No business logic inside components
- Use server actions for mutations
- Use reusable hooks for data fetching

Deliver:
- Folder structure
- Supabase setup
- Example feature module (test module)
- Clean and scalable base

======================================================================================================
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

Autosave:
- Save answers immediately
- Upsert responses (avoid duplicates)
- Debounce requests to avoid excessive calls

State Management:
- Use custom hook (useTestEngine)
- Keep UI stateless

Error Handling:
- Handle network failures gracefully
- Retry logic for autosave

Security:
- Never trust client-only validation
- Validate candidate ownership in backend

Deliver:
- Page implementation
- useTestEngine hook
- Supabase queries
- Clean separation of concerns
======================================================================================================
Implement a robust autosave system for test responses.

Requirements:

- Use optimistic UI updates
- Use debounce (300–500ms)
- Prevent duplicate submissions
- Handle concurrent updates safely

Database:
- Use upsert (candidate_id, question_id)

Failure Handling:
- Queue failed requests
- Retry automatically
- Show error state in UI if needed

Performance:
- Minimize re-renders
- Avoid unnecessary API calls

Deliver:
- useAutosave hook
- Retry mechanism
- Error handling strategy
======================================================================================================
Build a scalable scoring engine.

Requirements:

Input:
- Candidate responses
- Question to dimension mapping
- Dimension to competency mapping

Processing:
1. Aggregate scores per dimension
2. Normalize scores to 1–10 scale
3. Map dimensions to competencies
4. Apply weights

Architecture:
- Pure functions only (no side effects)
- Fully testable
- No hardcoded logic

Extensibility:
- Must support:
  - mapping-based scoring (DISC)
  - formula-based scoring (Bochum)

Deliver:
- scoringEngine.ts
- normalization functions
- clear data flow
======================================================================================================
Implement a safe dynamic formula evaluation system.

Requirements:

- Do NOT use eval
- Use a safe expression parser (like expr-eval or mathjs)
- Replace variables like Q1, Q2 with actual answers

Validation:
- Validate formula before execution
- Handle invalid formulas gracefully

Security:
- Prevent arbitrary code execution
- Sandbox evaluation

Deliver:
- Formula evaluator
- Validation layer
- Integration with scoring engine
======================================================================================================
Implement multi-tenant data access control.

Context:
Multiple clients must not see each other's data.

Requirements:

- Use Supabase Row Level Security (RLS)
- Ensure:
  - Clients only see their processes
  - Candidates only access their own data

Backend:
- All queries must be scoped
- No global queries without filters

Security:
- Validate ownership in every query
- Never trust client-side filtering

Deliver:
- RLS policies
- Secure queries
- Access validation logic
======================================================================================================
Build a production-ready client dashboard.

Requirements:

- Show processes with pagination
- Show metrics:
  - total candidates
  - completed
  - pending
- Use efficient queries (avoid N+1 problem)

UX:
- Loading states
- Empty states
- Error states

Performance:
- Use server components where possible
- Cache data when appropriate

Deliver:
- Dashboard page
- Optimized queries
- Clean UI
======================================================================================================
Build a flexible candidate ranking system.

Requirements:

- Rank candidates based on selected competencies
- Allow dynamic selection (5–10 competencies)
- Compute weighted average

Edge cases:
- Handle ties
- Handle missing data

Performance:
- Avoid recalculating everything on each request
- Cache computed results if needed

Deliver:
- Ranking service
- Sorting logic
- UI table
======================================================================================================
Build a professional candidate report system.

Requirements:

- Show:
  - dimension scores
  - competency scores
- Include interpretation text based on score ranges

UX:
- Clear visual hierarchy
- Use charts (bar or radar)

Extensibility:
- Prepare for PDF export (future)

Deliver:
- Report UI
- Interpretation mapping
======================================================================================================
Refactor the current implementation.

Goals:
- Improve readability
- Enforce separation of concerns
- Remove duplicated logic

Check:
- Hooks are reusable
- Components are clean
- No business logic in UI

Deliver:
- Improved structure
- Cleaner code
======================================================================================================
Debug and fix the issue in the current implementation.

Context:
[describe bug]

Steps:
1. Identify root cause
2. Fix issue
3. Improve code to prevent regression

Requirements:
- Do not patch superficially
- Fix underlying problem
- Keep code clean

Deliver:
- Explanation
- Fixed code
======================================================================================================
======================================================================================================
======================================================================================================
======================================================================================================
======================================================================================================