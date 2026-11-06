---
status: draft
updated: 2026-10-30
---

# Design brief: Park Circuit — Footwork Foundations

Prepared with the installed Devpost Learn `plan-lens` template and its AR-design and preview guidance. The user's decisions are carried forward from the shared planning conversation; implementation assumptions are marked **(default)**. This is not a claim that the formal interview or brief sign-off has been completed. The user has explicitly requested the first native build.

## October 31 direction from the learner

The current build is a four-lane rhythm runway. The start sign and all four landing boxes share the forward view. A winding series of open gates sits over the environment. Coloured footprint tiles travel through those gates, flatten as they meet their matching boxes, and disappear. The runner steps into the corresponding connected near lane at impact. A shared clock drives tile positions and hit detection. See the current [play instructions](../README.md) and [verification](verification.md).

The sections below document the original ring-and-return prototype.

## The one spatial moment

Exercise in a park with a follow-along course or coach inside the glasses, keeping the hands free. A glowing target shows where to move; a home zone teaches returning to centre before the next lateral or diagonal movement.

## Why it belongs on glasses
- Uses: draws in the world; leaves the body free.
- The instruction appears in the space where the movement happens, without holding a phone. A cue ahead supplements floor markers so the learner need not keep looking down.

## Product or overlay
- Type: product — a spatial movement trainer over the visible surroundings.
- Sensing: headset position projected onto a calibrated practice plane. This is a proxy for entering a region, not foot contact, foot identity or exercise form.
- Preview: actual Interactive Preview camera movement drives the normal input path. An explicitly labelled simulation control may supply test positions for a desktop demonstration **(default)**. Simulation results must be labelled and never presented as verified physical movement.
- The floor is manually calibrated; no automatic obstacle recognition or real-place recognition is claimed.

## Where things live
- The learner mainly looks ahead; the current direction is visible on a compact coach panel, while world-anchored floor targets show spatial destinations.
- Home zone: at the user's confirmed starting position, projected to a manually chosen floor height **(default)**.
- Four destinations: left, right, forward-left and forward-right, with a centre return after each **(default)**. Exact spacing and radius are tunable implementation defaults documented in the source.
- Coach panel: world-anchored in front of the course, below eye level **(default)**; must be visually checked in the SPECS preview.
- A visible course boundary communicates the available practice area. It does not certify that the real area is clear.

First-build numeric defaults: lateral destinations ±55 cm; diagonals ±45 cm and 55 cm forward; destination and home radius 20 cm; dwell 0.35 seconds with 6 cm exit hysteresis. Boundary extends 110 cm either side, 110 cm forward and 65 cm behind home. Manual standing head height starts at 170 cm. Three rounds contain four target-and-return pairs each; relaxed pace allows 8 seconds, steady pace 5 seconds. All of these are **(default)** values chosen for the prototype, not user-specified measurements.

## Hands and input
- Setup, pace, pause, replay and hints: standard SIK/UI Kit pinch buttons, also operable with the preview mouse **(default)**.
- Exercise advancement: entering the correct target, dwelling briefly, then returning to the centre **(default)**.
- Targets are big and highlight when aimed at.
- Voice is not required. No phone/controller is needed during the movement sequence.

## When things show
- Placement guidance appears before confirmation.
- A ghost marker demonstrates target-and-return movement before practice **(default)**.
- The active destination and short direction prompt appear during guided practice.
- Reduced-hint practice removes optional guidance; a hint/replay action restores help.
- Boundary or tracking discontinuity suspends scoring and requires explicit recovery **(default)**.
- Results appear at the end; replay clears the previous session.
- Short original cue sounds supplement visual feedback **(default)**.

## Done criteria
Each one can be checked in Lens Studio's preview. Record which checks were actually run in `verification.md`.
1. Place and confirm a compact practice course; markers are visible at real scale.
2. Watch a demonstration, then complete lateral, diagonal and reduced-hint mixed practice to reach results.
3. Active-target entry advances once after dwell; wrong regions do not score; the next target requires a return to centre.
4. Pause stops scoring and lesson time; resume continues; replay clears scores and time.
5. Boundary exit or a sudden pose discontinuity suspends scoring; recovery is explicit. Pure rotation or vertical movement does not count as a lateral hit.
6. Pace and hint controls work; simulated input is visibly distinguished from headset movement.

## Out of scope
- Detecting individual feet, exact floor contact, whole-body form, jump verification or fitness/calorie claims.
- Running, jumping, blind backwards drills, route navigation, GPS, obstacle clearance or persistent spatial anchors.
- Court Coach and Dance Trail are later extensions, not unfinished modes in this first build.
- Photoreal coach assets, purchased content, cloud AI, background music or custom park scenery are not dependencies of this prototype.
- Publication, YouTube upload and Devpost submission remain on hold.

## Risks and open questions
- Head movement can result from leaning; a zone hit does not establish a correct step.
- Floor height and course placement need user calibration; outdoor tracking and sunlight legibility remain untested on hardware.
- Physical comfort and real-world safety cannot be proved in a desktop preview.
- This brief is reconstructed from the existing discussion. The learner should review the defaults and finish formal planning sign-off before final competition packaging.

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

The final step above is template guidance for a future submission, not authorization to publish now.
