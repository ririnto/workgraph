# Bug Fix Playbook

Reproduce the trigger on the matching execution surface before fixing it.
Use observations to eliminate competing causes and confirm the surviving mechanism.
When a cheap local regression path exists, make it fail for the intended reason before changing production code.
Otherwise, use the closest executable reproduction and record its limits.
Rerun the original trigger after the fix and check affected consumers.
