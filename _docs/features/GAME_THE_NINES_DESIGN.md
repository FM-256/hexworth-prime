# THE NINES — design decisions (Cloud Master game)

Mini Metro for cloud capacity. Requests climb forever; you draw the topology that survives them.
Score is how long you held your nines.

Nancy PAUSED the first spec with three blockers. This resolves all three, before any code.

## 1. The simulation model — backlog and latency, NOT a saturation stopwatch

REJECTED (my first spec): "component turns red when demand > capacity, outage after N seconds
saturated." That model says nothing is wrong at 99% utilisation and everything is wrong at 101%,
so a student learns that running at 95% is safe. That is the single most expensive false belief in
capacity planning and it would be worse than teaching nothing.

ADOPTED, per tick, per component:

    arrivals      incoming requests this tick
    served        min(arrivals + backlog, capacity)
    backlog      += arrivals - served                  # integrator: drains when demand falls
    utilisation   = arrivals / capacity
    latency       = base / max(1 - min(utilisation, 0.99), 0.01)

Latency is the classic M/M/1-shaped response curve: it rises gently to ~70%, noticeably by 85%, and
goes vertical approaching 1.0. The player FEELS degradation before failure, which is the true
intuition.

LOSS CONDITION is backlog, not saturation: a component whose backlog exceeds its bound has dropped
requests it can never catch up on. A transient spike is survivable because backlog drains; sustained
overload is not. This also makes the QUEUE component expressible — its whole real purpose is burst
absorption, which a saturation stopwatch cannot represent at all.

Colour = latency, not a boolean: cyan healthy, amber as the curve bends, red as it goes vertical.

## 2. Failure domains must sometimes PUNISH spreading, or it is a lecture with a timer

Nancy: "if spreading always wins, mechanic 2 is decoration." Correct, and my spec had exactly that
hole. The fix is that spread costs REAL throughput, not a rounding error:

- Budget is hard-capped. A second AZ does not add capacity; it SPLITS it. Two AZs at half capacity
  each cost the same as one at full, plus a cross-AZ latency penalty on every request that traverses
  them.
- AZ failure timing comes from the seed. Some seeds fail an AZ early, some late, SOME NEVER.
- Therefore: on a no-failure seed, the concentrated player has strictly more usable throughput and
  survives the demand curve LONGER. The spread player paid an insurance premium that never claimed.

That is a real trade with a real loser, which is what makes it a decision rather than a lesson. The
run-end screen states which seed class you drew, so the player learns the distribution over runs
rather than concluding from one.

## 3. Topology scope — TIER-ADJACENT edges only

Arbitrary player-drawn topology means routing traffic over a general graph: cycles, multi-path
splits, and a distribution rule that produces nonsense without real flow solving. Nancy costed that
at ~3,000 lines and "a physics-debugging marathon".

ADOPTED: components live in ordered tiers (edge -> balancer -> compute -> cache -> data). An edge
may only connect a tier to a LATER tier (forward-only).

REVISED 2026-08-03, Nancy-approved: the original rule was strictly tier-adjacent (N to N+1).
Play-testing showed that refuses compute -> data, making a cache STRUCTURALLY MANDATORY to reach
the database -- which is false in real cloud architecture and killed a reasonable build at tick 7.
Forward-only preserves both original constraints (no cycle is representable; flow is still a single
ordered forward sweep) without encoding that false implication. No cycles are representable, so flow is a simple forward
sweep with even split across outgoing edges. Keeps the build near 1,500 lines and the model honest.

## 4. Cataloguing — file it CORRECTLY, fix the hub separately

The hub bug is FIFTEEN games wide, not one: every cloud game is correctly catalogued under
`category: 'games'`, which no cloud-master child claims in `catalogCategories`, so none project.

DECISION: this game ships as `category: 'games'`, `components: ['game']` — consistent with its 15
siblings and correct as data. It will be invisible on the hub until the projection is fixed, and
that is the honest state.

REJECTED: `category: 'cloud'` to force visibility. It surfaces ONE game while fifteen stay dark and
makes this the only cloud game not filed with its siblings — a permanent data inconsistency encoded
to work around a hub bug. Symptom-treating, which is what killed the previous design.

The projection fix is a SEPARATE change with its own review: naively adding 'games' to a cloud
child drags 22 foreign-house games onto the hub (Packet Invaders, Crypto Pong, Threat Swarm...),
because the projection has no house filter by design. It needs house-scoped categories, not a
one-line edit.

## 5. Failure modes named up front (they go in the Chris gate prompt too)

- Cause attribution must derive from the SAME state that triggered the loss, and must be able to say
  "multiple". If two components blow in one tick, naming whichever the loop reached first is a
  confident lie. If it cannot say multiple, it must not attribute.
- The AZ-failure message must not claim "you lost because you packed into one AZ" on a run where the
  demand curve was already killing the player. False causation is failure mode 1 verbatim.
- "A cache reduces database load" is only true if reads actually route through it with a hit rate.
  If the cache is modelled as "+X capacity on the DB", the text lies about mechanism.
- NEVER `if (window.AchievementManager)`. Components are top-level `const`; 38 dead guards were
  found 2026-07-31 and 31 games awarded nothing. Use `typeof X !== 'undefined'`.
- ONE seeded PRNG for every draw including AZ timing. A stray `Math.random()` makes both
  reproducibility and score comparability false.
- Seed fixed per level (not per run) or scores compare different difficulties.
- HUD must not be `position: fixed` over the canvas — CLAUDE.md rule 5 / HEUR-008.
- `components[0]` is order-dependent: `['game','lab']` buckets to games, `['lab','game']` to labs.

## 6. Stack

Wire into the existing arcade rather than reinventing: `GameTracker.js` (run history),
`ArcadeScoreModal.js` + `GameScoreboard.js` (score + leaderboard), `HexworthGameAudio.js` (sound).
Canvas render in the platform's neon-noir language — dark field, cyan and violet, traffic as moving
light along drawn edges, latency as heat.

Not a duplicate: `cloud-architect` scores STRUCTURE ("is a load balancer present?") via
set-membership tests; this scores BEHAVIOUR ("does this topology survive the curve?"). No
topology/flow game exists anywhere on the platform.
