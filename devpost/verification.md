# Restored park and direct mouse scoring

November 1, 2026 · Lens Studio 5.23.2 · SPECS 27 Interactive Preview · Sunlit Outdoor

[Park click-scoring result](preview/park-mouse-scoring.jpg) · [Room click test](preview/room-mouse-scoring.jpg)

- Restored the original Sunlit Outdoor park. The preset list still includes Sunlit Room, Evening Room, Colorful Home, Evening Outdoor and Plane. Switch using the dropdown at the top of Preview.
- A fresh preview initializes PREVIEW SIM automatically on the computer. A switch to Sunlit Room and refresh also retained mouse mode. Actual Specs uses tracked head and wrist input.
- Native clicks scored all seven action types, including the pose-wall badge, in the restored park. A complete run ended with 16 hits, four misses and 1,150 points. One punch was deliberately skipped. Three additional injected test clicks did not score. Misses earned zero and reset the streak.
- A click on the first footprint about one second early displayed “Too early. Retry when CLICK NOW appears.” Retrying earned 100 points. A separate room test scored a footprint click for 70 points.
- Every mouse action now uses a direct ±0.45-second timing window. Successful clicks immediately update the total, show HIT +100/+70, play the confirmation and remove the cue. Duck and pose-wall clicks require no simulated physical hold. Actual tracked holds and movement thresholds are unchanged.
- TypeScript compilation succeeded. A fresh startup reported 120 passing checks. No gameplay runtime errors were observed. Checks cover every mouse cue, early retry, duplicates, timing boundaries, late/invalid/future/paused inputs and both full charts, plus the existing tracked-movement tests.

Physical recognition and comfort still need testing on Specs. Desktop clicking validates target picking, timing and feedback. The older captures below document previous input behavior and layouts.

## Earlier open course and moving mouse targets


November 1, 2026 · Lens Studio 5.23.2 · SPECS 27 Interactive Preview · Plane

[Static start screen](preview/open-course-start.jpg) · [Click the moving glove](preview/moving-object-clicks.jpg)

- Two scene reads 1.1 seconds apart matched before Start. All 20 incoming cues were disabled. Decorative portal objects, animated edge lights and the fixed action control were absent.
- A native desktop run clicked moving footprints, gloves, hands, hurdles and duck beams through their displayed geometry. It scored 17 hits. A skipped punch earned zero. Both wall attempts in that run were too late to sustain their required holds.
- A focused pose-wall test clicked its moving badge earlier in the approach and earned HIT +100. The filled badge is rendered only in editor simulation.
- Startup reported 70 passing checks with no runtime errors. Picking checks include visible borders, an open wall centre, empty space, parallel and backwards rays, expired targets and one attempt per cue.
- The tracked wrist/head adapter and scorer are preserved. Decorative geometry is removed in all modes. The duck beam and pose wall use sparse outlines. Mouse clicks are enabled only in editor simulation.

The screenshots in this earlier section use the plain Preview backdrop. Older videos below show the previous tunnel and fixed centre controls. Physical Specs comfort and recognition remain to be tested on a headset.

## Earlier scoring and floor cues

November 1, 2026 · Lens Studio 5.23.2.26081320 · SPECS 27 Interactive Preview

Historical recording retired. [Compare a punch hit and a miss](preview/park-circuit-feedback-example.jpg)

| Check | Observed result |
|---|---|
| Successful punch | At 0:07, the left punch earned 100 points. The panel showed 200 total and a two-hit streak, the green check appeared beside the lanes, and the sign called the next step. |
| Missed punch | Around 0:12, the right-punch cue sounded even though the tester skipped it. The grade showed MISS +0, the total stayed at 300, the streak reset and a red cross appeared. |
| Finished run | The 46-second recording shows an 18/20 desktop run with 1,650 points. The final pose wall earned 100 points and remained identified on the results screen. |
| Grounded footprints | A step box moved from course-local z = −857.0 cm into its lane at z = −715 cm, with identical height and identity rotation in both scene reads. The small vertical layer offset separates the printed surfaces from the receiving outline. |
| Both paces | All seven sound types were compared to their source waveforms at all 20 target sample positions in each pace. Every comparison passed. A slow render frame cannot skip an embedded beat sound. The click, hit and miss responses remain independent of the music. |
| Movement tracking | With desktop simulation off, lowering the native preview camera by 30 cm through the Steady duck crossing scored HIT +100. The paused Steady playhead stayed at 3.065 seconds and an approaching tile held the same transform across the pause. |
| Build | TypeScript compiled. A fresh preview reported 61 passing startup checks and no errors. |

The video uses the native renderer and captured audio. Video frame times were matched to the native scoring log for export. Five audio checks from 3 to 39 seconds matched the selected game master. Player input in the video is the editor simulation. Physical Specs tracking and comfort still need a headset test.

## October 31 full-body Park Circuit verification

October 31, 2026 · Lens Studio 5.23.2.26081320 · SPECS 27 Interactive Preview · Sunlit Outdoor

Historical recording retired; see [current demo details](video-metadata.md).

| Check | Observed result |
|---|---|
| Complete run | In Preview sim, timed taps on the floor boxes and action button cleared all 20 cues. The run earned 1,970 of 2,000 points with a 20-hit streak and zero misses. |
| Hand cues | Left and right jabs use distinct coloured glove targets. Clap shows two facing palms. Hand raises show a palm and an up arrow. A new gesture requires preparation with the correct hand. |
| Obstacles | The low striped hurdle, high duck bar and cutout wall travel through the runner’s position. A raised arrow stays visible as the near hurdle drops below the display. The two-arm wall requires a stable head and both wrists through the crossing. |
| Headset input path | With Preview sim off, moving the native camera into lanes scored steps. Raising it by 15 cm scored a hurdle and lowering it by 27 cm cleared a duck bar. Unperformed gestures registered misses. |
| Music and pause | The audio component's playback position drives every cue, animation and timing window. The pause test froze the playhead at 2.926 seconds. An approaching footprint had identical coordinates in two scene reads across the pause. Resuming advanced from the saved position. |
| Build and regressions | Native TypeScript compilation succeeded. A fresh preview reported 50 passing checks and zero errors. Checks cover both chart speeds, early camping, the wrong side, lost wrists, moving during a hold, tracking loss and an idle 0/20 run. |

The gameplay recording uses the native renderer and its captured audio. The player input in the video is desktop simulation. Both floor taps and action taps feed synthetic poses through the normal scoring logic. The score background, taps and success sounds come from the Lens.

During export, the recorder compressed the picture timeline relative to its audio. The clip corrects the video frame timing against the twenty graded HUD frames and their matching logged song positions. Audio alignment against the original master was constant at five checkpoints from 3 to 39 seconds. No music was added in post.

The tracked camera test and synthetic wrist tests were run on desktop. Physical Specs hand visibility, tracking thresholds and movement comfort remain unverified.

[Previous four-lane runway verification](footwork-runway-verification.md) · [First prototype verification](footwork-prototype-verification.md)
