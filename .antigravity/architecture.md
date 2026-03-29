# Architecture

Frontend:
- Next.js App Router
- Components (UI)
- Hooks (logic)
- Services (API calls)

Backend:
- Supabase (DB + Auth)
- Server Actions (Next.js)

Core Modules:

1. Test Engine
- Load test
- Render questions
- Save responses (autosave)
- Handle timer

2. Scoring Engine
- Calculate dimension scores
- Normalize results
- Map to competencies

3. Process Management
- Create process
- Assign candidates
- Track progress

4. Reporting
- Candidate report
- Global ranking