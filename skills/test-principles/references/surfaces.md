# Output Surfaces

What counts as the contract on each surface, and what a test asserts there. Everything outside the contract may change freely, so tests leave it alone.

## Command Line

- **Exit code and streams.** The exit code and what goes to stdout versus stderr are the contract. Every test asserts which stream its output went to, and asserts the other stream empty where it should be.
- **Machine-readable output** (`--json` and similar). Parse, then assert. Status and error-code fields are compared exactly; the data payload is compared on contract fields only. How the envelope is serialized is tested once at the shared layer, not again per command.
- **Human-readable text.** Assert key facts only: the conclusion, the object and environment acted on, the failure reason, the next command offered, and what must not appear (secrets, removed wording, state that should not have been written). Never compare whole paragraphs, spacing, or alignment.
- **Style rules** (no color when not a TTY or when `NO_COLOR` is set) are held by structure, not by per-command tests: color and formatting happen only in one shared toolkit handed to each command, and commands never write escape codes themselves. Test the toolkit once in each mode, test once through the real binary on a TTY and a pipe, and have the shared test helper reject escape codes in every plain-text result, which keeps commands from emitting their own.
- **Help text.** Do not compare it per command. Walk the command registry and test properties: `--help` exits 0, writes to stdout, writes no files, makes no network or daemon calls, and lists the options the registry declares.
- **Errors.** Assert the error code (in machine mode), or stderr plus a nonzero exit, plus the one fact that lets a person act. Do not compare the whole sentence.

## Secrets

No secret appears on any output surface: results, human text, error messages, error details, logs. Enforce it in the shared helpers that call commands, so every test checks it without asking: the helper scans each surface for every secret in the fixtures and the ones the test passed in, including derived forms (hashes, encodings). A call that hands out a secret by design is allowed explicitly in the helper, and its own test asserts what it hands out. Secrets that differ per test and are not in the fixture list need a dedicated scan that calls each secret-touching command in turn; adding such a command means adding it to the scan. Failures recorded and shown later are surfaces too.

## HTTP API

- Status code and contract fields of the parsed body; content type when clients depend on it.
- Error responses: status and error code exactly, message by key fact.
- Headers only when they carry a contract: caching, auth challenges, CORS, rate limits.
- Request-side guards (origin, host, auth) get a rejection test paired with one normal-request control, so a server that rejects everything does not pass.

## UI

- Query by role, label, and visible text the user perceives, not by DOM structure, class names, or component internals.
- Assert what the user sees or can do after an action: text present or absent, control enabled or disabled, navigation happened.
- Visual layout belongs to visual-regression tooling with reviewed diffs, if the project has it, not to DOM assertions.
- A fake client standing in for the backend is strict: an unarranged call fails the test.

## Files and Persistence

- Generated files whose bytes are consumed by another program: compare bytes.
- Config and data files the system reads back: assert by reading them through the system's own loader, not by matching their text.
- Migrations: from each shipped schema or file shape directly to current, asserting no data is lost and the result loads.
- Permissions, ownership, and locations of installed files are contract when an installer or another tool depends on them.
