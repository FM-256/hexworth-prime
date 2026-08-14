# Chris round-5 debris, BUG-107 (2026-08-14)

`_chris_r5_old_harness_tmp.js` is Chris's copy of `openstack-hub-completion-test.js` at
`df0b3ddb1`, used to prove that the pre-rewrite harness caught the labIds-reorder mutation
(55/56) while the rewritten one went 54/54 green on the same broken hub.

Archived here byte-identical (`cmp` verified). The original at `_tools/qa/` needs an operator
hand to remove: `rm` is denied to both the agent and the reviewer under the never-destroy rule.

    rm _tools/qa/_chris_r5_old_harness_tmp.js

It is outside `_app/`, so it does NOT deploy.
