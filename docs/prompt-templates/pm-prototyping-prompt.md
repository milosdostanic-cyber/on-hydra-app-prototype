# PM Prototyping Prompt Template

Use this prompt whenever testing a new screen idea or iterating on an existing one.

## Prompt
Work only within the requested screen/flow.

Before making any change:
1. identify the closest existing screen, section, or pattern
2. state whether an acceptable existing pattern exists
3. identify which existing Ant Design or approved existing components will be reused
4. confirm that existing shared/core components will remain unchanged
5. confirm that existing tokens will remain unchanged
6. explain whether the solution is local to this screen or has broader impact
7. if anything is ambiguous, present 2–3 options and recommend one before implementation

Rules:
- do not create new core components
- do not modify existing shared/core components
- do not create or modify tokens
- do not use raw visual values
- reuse existing patterns first
- if no acceptable pattern exists, you may create a local screen-level composition using existing components and existing semantic tokens only
- do not change unrelated screens
- do not silently change shared behavior

Output:
- show the reasoning briefly
- show what pattern is reused or why no acceptable pattern exists
- show the proposed UI direction
- clearly label whether this is a reused pattern or a new local composition
- keep the solution implementation-friendly

