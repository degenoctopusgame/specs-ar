---
status: draft
updated: 2026-11-06
---

# Design brief: Movement Club

Current design for the three-game build, revised using the Devpost Learn plan-lens template, AR design rules and preview limits on 6 November 2026. The learner's existing decisions are reused; this revision does not claim that a new interview or explicit approval of this text has occurred. Earlier brief: [October 30 archive](history/design-brief-2026-10-30.md).

## The one spatial moment

“Exercise in a park but with the ability to have a follow along course or coach” inside glasses, so the hands stay free. Movement Club places a movement destination in the learner's space and gives timing and recovery feedback while they look ahead.

## Why it belongs on glasses
- Uses: draws in the world and leaves the body free.
- A phone video shows someone else's movement. This Lens places destinations relative to the learner's starting stance and reacts to their movement without requiring a handheld controller.
- The three games share the same spatial idea: reach the indicated place or pose at the right time, then prepare for the next move.

## Product or overlay
- Type: product — a spatial movement-practice game over the visible surroundings.
- Current modes: Park Circuit (20 rhythm cues), Court Coach (14 reach-and-recover shots), Dance Trail (one eight-count phrase at six selectable tempos).
- Sensing: Park uses headset position and SIK wrists. Court/Dance use horizontal headset position over a manually calibrated floor plane with 0.14-second dwell (default).
- Preview stand-in: clearly labelled mouse timing and targeting. Click moving Park objects or the Court/Dance diagram rings. This demonstrates the real scoring/state flow but does not establish physical form, individual foot position, a real racket stroke, or a real jump.
- No camera recognition, automatic floor detection, route mapping, internet service, or AI inference is required.

## Where things live
- The learner looks ahead at the next cue and a forward court/trail diagram, with small reachable floor zones beside their stance.
- Content is anchored to the starting headset position and heading. Manual eye-to-floor height defaults to 170 cm; shared Setup adjusts 120–210 cm in 5 cm steps and recentres the course (defaults).
- Main console: 175 cm forward, with the lesson centre 25 cm above eye height; the menu is offset 22 cm below that (defaults). These are the existing visually reviewed positions, not a claim of hardware comfort.
- Park: four lane centres at approximately −56, −19, 19 and 56 cm laterally, 27 cm forward. Optional compact footprint and heading adjustment remain in Park Setup.
- Court: centre plus seven destinations, up to 52 cm sideways and 70 cm forward; stance rings have 14 cm radius (defaults).
- Dance: centre, left/right and front diagonals; stance rings have 19 cm radius (defaults).
- The forward diagrams extend roughly 6–12 m away (defaults). They are visual direction maps; the learner does not walk to the distant opponent. Hardware readability/comfort at that distance remains unproven.

## Hands and input
- Standard SIK/UIKit buttons operate Menu, Start Game, Watch demo, Setup, Pace, Pause, Resume and Replay.
- The learner explicitly requested direct Start Game in Court and Dance, with the demo optional, full-size button labels in one row, and matching menu-column typography.
- Shared Setup is reached through the main menu from any game. It changes height for all three games; it does not force a tutorial before play.
- In tracked mode, exercise input is measured automatically. Mouse controls are editor-only and visibly labelled; voice is not used.

## When things show
- Main menu appears on launch. Selecting a game opens its landing page.
- Park starts its eight-beat introduction directly. Court starts a shot directly. Dance starts a four-count introduction directly.
- Optional Court demo shows one shot and recovery. Optional Dance demo leads to self-paced practice, then the timed phrase.
- Court's guided shots fly for 6 seconds; the shuffled round uses 4 seconds (defaults). A hit must arrive before the same deadline used by the flight animation. Recovery is required after hits and misses.
- Dance offers 40/60/80/100/120/144 counts per minute; one shared audio clock drives the displayed count and scoring.
- Pause freezes time/audio; tracked resume requires returning to centre. Leaving the practice bounds or a tracking discontinuity pauses tracked play.
- Setup and optional demo controls disappear during active play. Results show scored outcomes; Play again creates a fresh lesson.

## Done criteria
Each criterion is checkable in Lens Studio Preview. Evidence and limitations are recorded in release-verification.md.
1. Launch into the three-game menu; enter each game directly and return using Menu, with full-size labels and single-row landing controls.
2. Change height in shared Setup, recenter and verify that all games use the same calibration.
3. Court accepts an on-time reach and centre recovery, rejects late/wrong targets, and completes 14 shots with correct totals; visual landing and hit expiry agree.
4. Dance supports both direct start and optional demo/practice, all six tempos, count-in, hit/miss scoring and results.
5. Park completes 20 cues with visible hit/miss feedback and results; pause/resume and replay preserve/reset the correct state.
6. Switching games stops the previous audio. A clean extracted project compiles and opens in Preview.

## Out of scope
- Individual foot tracking, full-body form assessment, calories, medical or fitness-outcome claims.
- Automatic obstacle detection, navigation, real-place recognition, multiplayer or persistent spatial anchors.
- Hardware-validated tracking quality, latency or comfort; no Specs hardware is available.
- A fourth game, photorealistic coach, online services or a new visual redesign before submission.

## Risks and open questions
- Leaning can move the headset into a zone without the intended step. A score establishes a positional/timing match, not exercise quality.
- Park's two-hand actions and sustained poses cannot be validated through a single mouse. They remain explicitly labelled as unproven on hardware.
- Wide landing controls and distant diagrams need an eventual glasses comfort check. Current layout preserves the learner's requested font sizes and single-row buttons.
- The background streetscape is Lens Studio's Sunlit Outdoor preview environment, not an environment built or scanned by this Lens.
- Current design and scoring are inspectable; physical feel remains unproven.

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
This part is for you, after CLAD finishes.

1. **Does it work?** Ask your agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Open the preview in Interactive Preview. Use WASD to move, Q and E to go down and up, and right-drag (or hold Shift) to look around. Clicking acts as a pinch. Stand where a user would and look at the task.
3. **Ask the three questions.**
   - Does it use what I'm looking at?
   - Does it put something in my space, where it belongs?
   - Does it free my hands or let me keep my eyes up?
   - Would it be just as good on a phone? If so, what would make it need the glasses?
4. **Check comfort.**
   - Everything I need is in view while I do the task. Nothing sits at the edges, behind me, or stuck to my face.
   - Every control is within reach of someone standing there.
   - Text reads easily from where I stand. No dark UI disappearing.
   - Things show when needed and get out of the way.
5. **Label what you know.** Write "logic proven" next to anything the tests and preview show working, and "feel unproven" next to anything only real glasses could tell you (comfort over time, real hand tracking, real recognition).
6. **Fix with design notes, not code.** Tell your agent what to change in design terms, for example: "Move the step card 15 cm lower and next to the pan. Make the Next button twice as big. Re-run the tests." If a fix takes under a minute, like nudging a panel, do it yourself in the scene.
7. **Submit.** Record a video under 3 minutes of your Lens in the preview, public on YouTube. Make your repo public with your Lens Studio project and this `devpost/` folder. Details are on the hackathon site: https://learn-specs.devpost.com/resources

