# Database Overview

Key tables:

- persons
- candidates
- processes
- tests
- questions
- options
- responses
- dimensions
- competencies

Important relationships:

- person → multiple candidates
- candidate → one process
- test → many questions
- question → many options
- option → maps to dimensions
- dimensions → map to competencies

Constraints:

- unique(candidate_id, question_id)
- person email must be unique

Scoring:

- mapping-based (DISC)
- formula-based (Bochum)