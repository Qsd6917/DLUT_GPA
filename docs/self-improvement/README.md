# Self-Improvement Memory

This directory stores lightweight self-improvement artifacts for the project.

## Structure

```text
docs/self-improvement/
├── README.md
└── memory/
    ├── semantic-patterns.json
    ├── episodic/
    │   └── 2026/
    └── working/
```

## Purpose

- Keep reusable patterns separate from application source code.
- Track concrete engineering episodes with timestamps and outcomes.
- Preserve current-session context in a predictable location.

## Conventions

- `semantic-patterns.json` stores reusable patterns with confidence and usage data.
- `episodic/YYYY/` stores one JSON file per meaningful session or incident.
- `working/` stores transient session state.

<!-- Evolution: 2026-03-16 | source: ep-2026-03-16-001 | skill: self-improving-agent -->

## Initial Pattern

When bootstrapping self-improvement in a normal product repository, keep the memory scaffold under `docs/` first. This makes the system inspectable without coupling it to runtime code or build output.
