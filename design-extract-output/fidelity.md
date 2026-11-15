# Clone fidelity — scanthecharts.com

**31% overall** (F)  ·  visual 6%  ·  motion 68%

Source: https://scanthecharts.com/warmup

## Motion

| aspect | score | original → clone |
| --- | --- | --- |
| feel | 50% | mixed → responsive |
| durations | 100% | 200 → 150, 200, 350 |
| easings | 50% | ∅ → custom, ease-out, ease-out |
| springs | 100% | 0 → 0 |
| keyframes | 0% | ∅ → slide |
| scrollLinked | 100% | yes → yes |
| choreography | 100% | 0 → 0 |

## Correction plan

- **[low/motion]** motion aspect "keyframes" diverges from the original (score 0.00).
  - _fix:_ Author @keyframes for the missing motion kinds (n/a) and wire them to the elements that animate on the source.
- **[low/motion]** feels responsive, original feels mixed
  - _fix:_ Shift the clone's motion feel toward "mixed" — adjust easing and duration tokens so transitions read mixed, not responsive.
- **[low/motion]** motion aspect "easings" diverges from the original (score 0.50).
  - _fix:_ Apply the original's easing families (n/a) via transition-timing-function instead of custom, ease-out.
