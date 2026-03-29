Build the candidate test flow.

Requirements:

- User accesses via token-based URL
- Load candidate and assigned process
- Load tests dynamically
- Show questions one by one or paginated
- Autosave answers on selection
- Prevent duplicate answers
- Handle time limit (countdown)
- Disable access after deadline

Tech:
- Next.js App Router
- Server Actions for saving responses
- Supabase queries

Deliver:
- Page structure
- Components
- Hook for test engine
- Autosave logic