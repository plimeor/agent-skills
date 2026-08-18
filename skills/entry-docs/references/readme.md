# README.md

Load with the Funnel Gate. This page is the human-entrypoint contract, distilled from [Art of README](https://github.com/hackergrrl/art-of-readme) (CC BY 2.0, [Kira / hackergrrl](https://github.com/hackergrrl)). Node-module examples there generalize: the "module" is whatever public interface a consumer uses — library API, CLI, app, plugin, or skill index.

A README is often the only look a consumer gets. Its job is to (1) say what the project is, with context, (2) show it in action, (3) show how to use it, (4) add other relevant details. Quality here is the public measure of the work.

The documentation, not the code, defines the public interface. A consumer should be able to use that interface without opening the source. If they cannot, the README is incomplete unless Gaps says so.

The file should be as short as it can be without being shorter. Long reference material belongs on separate pages, linked from the right funnel stage — the same disclosure idea as `AGENTS.md`, aimed at human attention rather than every-request tokens.

## Funnel order

Required section order. Broadest first. A reader who has seen hundreds of repos is pattern-matching so they can **short-circuit**: take it, or leave, as soon as they know. Describe the work; do not sell it.

1. **What it is** — name, then a one-liner. Self-explanatory names help; if the name is opaque, the one-liner defines the terms (`aabb`, "crew", …).
2. **Background** — only when the one-liner is not enough: uncommon abstractions, or motivation versus already-known alternatives. Skip when the name and one-liner already suffice.
3. **In action** — a runnable picture of use: code, CLI transcript, or the smallest command that shows the thing working. Prefer a file in the repo (`example.js` or equivalent) when the example is code. A screenshot must not be the only usage evidence.
4. **How to use** — the public interface in enough detail to operate it: signatures, optional parameters and defaults, accepted option keys, return shapes, events, caveats. Tiny extra examples are for non-obvious calls; a function that needs an essay may be too big. Link out rather than growing an encyclopedia in the README. For a CLI, show invocations and output; if a file changes, show before/after. For a repo of skills or apps, this stage is the index of what the consumer actually invokes.
5. **Installation** — even when standard, show the command; newcomers exist. Nonstandard notes belong here.
6. **License** — usually last. A non-permissive or unusual license belongs at the **top**, so incompatible consumers can leave immediately.

Do not invent a different order for "apps" versus "libraries." Installation after "how to use" is intentional: the reader should know what they are installing. Changelog, credits, and deep bibliography trail the funnel; they must not precede "what it is." Contributor and maintainer process belongs in `CONTRIBUTING.md` or a linked doc, not ahead of these consumer stages.

## Completeness checklist

Each item is in the README, in Gaps, or N/A with a reason:

- [ ] One-liner explaining purpose
- [ ] Background context and links, when the one-liner is not enough
- [ ] Unfamiliar terms link to sources
- [ ] Clear, runnable usage example
- [ ] Installation instructions
- [ ] Public-interface documentation sufficient to use without reading source
- [ ] Funnel order above
- [ ] Caveats and limitations mentioned up front when they would disqualify a user
- [ ] Essential information does not depend on images
- [ ] License

## Optional practices

Use when they help a real reader; they are not padding targets.

- Link modules, ideas, and people you mention.
- State types when convention does not make them obvious.
- Be stingy with badges. Each one must help the typical README viewer; CI status often belongs in email or issues, not as header chrome. Badges also fail when the Markdown is read offline.
- `package.json` `keywords` (or the ecosystem equivalent) help discovery; they are not a README substitute.
- Keep the documented interface small. Every API change is a docs change. Prefer a new focused module or entry over fattening this one.
- Inline anything essential to future readers. The git repo and this README will outlive the current host and most hyperlinks — especially images.

API formatting is otherwise local taste, as long as optionality, defaults, types, and option-object keys are visible.
