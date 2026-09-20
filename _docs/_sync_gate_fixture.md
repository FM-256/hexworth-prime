# Fixture: a doc with a deliberately rotted line reference

**This is a test asset, not documentation.** It exists so the refusal path of
`_tools/confluence/sync-published-docs.sh` can be exercised, because a gate whose refusal has
never fired is a gate nobody has tested.

The reference below points at a blank line on purpose. Do not "fix" it.

    _app/arena/tournament-board.html:843

Run the refusal test with:

    _tools/confluence/sync-published-docs.sh --registry <a registry naming this file>

`verify-doc-line-refs.js` skips files whose basename begins with `_` when sweeping with `--all`,
so this fixture does not pollute the platform-wide count. An explicit path is always checked, which
is what makes it usable as a fixture.
