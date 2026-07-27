# Specialized Gates

Two conditional gates, loaded from `SKILL.md` when their activation condition fires. Each adds required fields to the plan; the plan is incomplete until those fields are present.

## Visual Reference Gate

Activate when the user provides a Figma URL, screenshot, mock, design frame, or asks to match a visual reference.

The plan is incomplete unless the first acceptance result names the reference source, target surface, states, viewport matrix, required evidence, allowed masks, and review rule.

Default threshold: 0 unapproved visual diffs. Dynamic text or data may be masked; layout, spacing, typography, colors, borders, radius, shadows, icons, selected states, empty states, and filled states may not be masked unless the user explicitly approves.

Weak substitutes do not satisfy this gate: `looks aligned`, `manual smoke`, `Figma inspect`, or an uncaptured screenshot comparison.

## Migration Parity Gate

Activate when migrating a component, module, workflow, framework, or implementation from a source project/path into a target.

The plan is incomplete unless it names the source baseline, target location, public contract surface, fixture/state matrix, parity evidence, allowed differences, and stop gate.

Adapting imports, file layout, naming, formatting, framework conventions, local helpers, and design-system primitives does not authorize observable behavior changes.
