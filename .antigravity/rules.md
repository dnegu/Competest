# Development Rules

- Always use TypeScript
- Use clean architecture principles
- Avoid hardcoding business logic
- All scoring logic must be configurable from database
- Use server actions when possible
- Follow modular structure

DO NOT:
- Hardcode test logic (DISC, Bochum)
- Mix UI with business logic
- Use any unsafe eval (use safe math parser)
- Create monolithic components

ALWAYS:
- Create reusable hooks
- Separate domain logic from UI
- Use proper typing
- Think in scalability