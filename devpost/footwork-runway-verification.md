# Four-lane rhythm runway verification

October 31, 2026 · Lens Studio 5.23.2.26081320 · SPECS 27 Interactive Preview · Sunlit Outdoor

| Check | Observed result |
|---|---|
| Start composition | With camera position and rotation reset to zero, the start sign, four complete landing boxes and the tunnel entrance appeared in the same forward-facing frame. The start screen previewed approaching tiles before input. |
| Motion and disappearance | The native recording shows successive coloured footprints following the curved lanes toward the camera. They flatten and shrink at the matching floor box. Its outline flashes on impact. |
| Seated play | The editor simulation received taps on the visible floor boxes. The complete three-round run scored 12 hits and 0 misses. The input label identified the simulation throughout. |
| Tracked play | A separate run moved the native preview camera into the four near step areas using the headset-position input path. All 12 beats scored, with 0 misses. |
| Early, late and wrong entries | The 16 startup checks include early camping, stepping out before impact, wrong lanes, a late hit within the window and the full sequence. Both ends of each pad map to the same lane. |
| Pause | An incoming tile had the same coordinates in two native scene queries 0.9 seconds apart while paused. Resume restarted the clock. |
| Build | Native TypeScript compilation succeeded. A fresh preview logged 16 passing rhythm checks with no runtime errors in the post-reset log. |

Historical recording retired; current demo details are in [video metadata](video-metadata.md).

[Start view](preview/rhythm-start.jpg) · [Incoming tiles](preview/rhythm-play.jpg) · [Tracked results](preview/rhythm-tracked-results.jpg) · [Simulated results](preview/rhythm-sim-results.jpg)

The recording uses the real Lens Studio renderer at normal speed. The moving camera used for the separate tracked test was a desktop preview camera. Physical SPECS tracking, foot contact and outdoor comfort remain unverified.

The [first prototype verification](footwork-prototype-verification.md) covers the earlier ring-and-return design.
