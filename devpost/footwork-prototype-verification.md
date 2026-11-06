# First prototype verification

October 31, 2026 · Lens Studio 5.23.2.26081320 · SPECS 27 Interactive Preview

## Camera-driven playthrough

The saved project reopened and TypeScript compiled. A fresh preview printed **12 invariant tests passed**, followed by the Park Circuit startup message. The post-refresh runtime log contained no errors.

For the full run, the preview camera supplied position to the ordinary headset input path. The simulation flag remained false. The run used the **Plane** environment, compact footprint, +15° rotation, 175 cm eye height and Relaxed pace.

| Check | Observation |
|---|---|
| Size and heading | The coach showed 1.76 × 1.40 m. The left ring moved from the full-size default of (−55, 0) to (−42.50, 11.39) cm in world X/Z. Its right-hand counterpart measured (42.50, −11.39) cm. |
| First cue | Yawing in place, raising the camera 24 cm, and entering the opposite zone left the score at zero. Dwelling in the left zone scored once. |
| Centre recovery | All 12 hits went to **Return to centre**. Each new cue required a centre dwell. The final centre return opened results. |
| Rounds and hints | The four lateral and four diagonal cues completed. In the mixed round, the right cue changed to **Remember the direction** after two seconds. **Show hint** restored **Right**. |
| Results | **12 / 12 zones reached**, zero timeouts, 2.2 seconds average arrival and 42 seconds active time. Timings describe the scripted preview camera moves. |
| Replay | **Place again** returned to setup. Successes, misses and elapsed time were zero, and the selected footprint, angle and eye height remained available. |
| Boundary | In a separate run, moving the camera outward in two 50 cm steps paused the lesson with **Outside practice area**. Returning to centre and pressing **Resume** resumed the demonstration. |
| Outdoor rendering | In **Sunlit Outdoor**, the coach rendered over the streetscape. Looking down showed the coloured rings, course boundary and gold demo marker over the paving. |

[Compact setup](preview/compact-setup.png) · [Tracked results](preview/tracked-results.png) · [Outdoor setup](preview/outdoor-setup.png) · [Floor view](preview/outdoor-floor.png)

## Seated desktop walkthrough

In **Sunlit Outdoor**, the setup control switched the source label to **Preview simulation**. After **Start practice**, the **Simulate move** button drove every destination and every return to centre through the normal lesson logic. The final screen showed **12 / 12**, zero timeouts, 2.9 seconds average arrival and 69 seconds active time. It explicitly displayed **SIMULATED RESULTS · Preview only**. [Simulated results](preview/simulated-results.png)

## Coverage

The 12 startup assertions run the same state machine as the Lens. They cover home gating, minimum dwell, single scoring, pause and resume, boundary exit, timeout, tracking loss, large position jumps and a full lesson. The camera-driven run above also exercised the scene transforms, the coach controls and displayed results.

LEAF scenarios were not run. The available interaction-test package previously introduced incompatible package imports in this project. Physical hand input, outdoor tracking quality, comfort and sunlight readability still need a SPECS device test. This Lens measures headset-region entry and timing. It cannot establish individual foot placement or exercise form.
