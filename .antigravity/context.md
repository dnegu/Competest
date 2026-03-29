# Project Context

This is a SaaS web application for psychometric evaluations (HRTech).

The platform allows companies (clients) to evaluate candidates using predefined or custom combinations of tests (DISC, Bochum, Intelligence, etc.).

There are 3 main roles:
- Admin: manages tests, competencies, scoring logic
- Client: creates evaluation processes and reviews results
- Candidate: takes tests through a unique link

Core features:
- Test engine with autosave
- Time-limited assessments
- Dynamic scoring system
- Competency-based ranking
- Report generation

Tech stack:
- Next.js (App Router)
- TypeScript
- Supabase (PostgreSQL, Auth)
- Tailwind CSS

Important:
- The system must support multiple processes per person
- Scoring must be dynamic and configurable
- The system must be scalable and multi-tenant