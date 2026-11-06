# Native build record

Date: October 30, 2026 (Europe/Lisbon).

## Starting point

- Project: `park-circuit-lens.esproj`.
- Lens Studio project version: 5.23.2, build 26081320.
- Lens Studio MCP confirmed this exact project path and an authorized account before scene edits.
- Base template includes Perspective camera, world tracking, Spectacles Interaction Kit and Spectacles UIKit.
- Initial preview: SPECS 27 Interactive Plane; baseline log check reported no errors.
- Park Circuit gameplay is new implementation for this project; no previous Room Invaders or Resonant gameplay was copied.

## Design provenance

The user chose a hands-free outdoor follow-along workout, then Park Circuit with a footwork-focused first lesson. The shared planning conversation established lateral/diagonal movement, return to centre, reduced hints, replay, pace and honest region-based feedback. The reconstructed `design-brief.md` records these decisions and labels numeric defaults.

The installed Devpost Learn skill template and AR/preview guidance informed the brief. Formal interview completion and learner sign-off are not asserted.

## Assets and tools

- Standard Lens Studio base-template assets and installed Snap SIK/UIKit packages.
- CLAD skills and Lens Studio MCP for native scene construction, compilation and preview checks.
- Original procedural rings/arrows/coach markers; no purchased models.
- Original short synthesized cue sounds; no licensed commercial music.
- Material icons imported via the CLAD icon selector, where present.
- Any inspection/interaction or test packages are development dependencies, to be documented by the final build verification.

## Evidence boundaries

The final test observations belong in `verification.md`. Compile success alone is not a runtime pass. A scripted simulated pose is not evidence of physical foot detection. Preview success establishes desktop behavior, not outdoor tracking quality or comfort on glasses.

No payments, public repository, public video, Lens publication or competition submission were made during this build.

## October 31 build

The saved project reopened in Lens Studio 5.23.2.26081320. Its Lens display name is now **Park Circuit**. Spectacles Interaction Kit 2.0.0 and Spectacles UIKit 2.0.0 supply the interaction and UI components. The other packed dependencies are Motion 4.0.0 and Icons 4.0.0. The unpacked preview inspector under `Assets/` uses import paths matching those installed packages.

Setup now offers two course sizes, three headings and a manual eye-height control. The floor markers, arrow, boundary and headset scoring use the same course transform. The coach stays in front of the learner while the floor layout rotates. The simulation switch appears only during setup in the editor. Repeated frame updates skip unchanged text to avoid rebuilding button layouts.

The built-in **Sunlit Outdoor** environment supplies the desktop streetscape. The Lens itself draws only the course, cues and coach in the user's surroundings.

## October 31 rhythm runway revision

The learner supplied a video reference with a four-lane approach and outlined landing boxes. Park Circuit now has original procedural portal frames, side braces, a curved runway, moving edge lights, and four continuous marked pads. A pool of footprint tiles travels to the four landing boxes in the same forward view as **Start Game**. Optional setup controls fold away during the demonstration. A single clock schedules both the visible impact and the timing window for real headset input and desktop taps. See the latest [verification](verification.md) and [current release verification](release-verification.md).

## Full-body rhythm circuit

The score has twenty movement cues. The first two bars give the player eight beats to prepare. Steps, alternating jabs, a clap, single-hand lifts, a low hurdle, an overhead duck bar and a two-hand pose wall share the audio transport. The Lens samples the SIK wrists and headset pose. Desktop rehearsal supplies equivalent movement samples through the same timing checks.

*Park Circuit Pulse* is an original 24-bar instrumental produced for the Lens, with 96 straight quarter-note kicks, a house clap and hat groove, synth bass, offbeat electric piano, plucked synth and a marimba answer. The harmony moves through C, D, E minor and B with added ninths. The bundled master is 48 seconds of 44.1 kHz stereo PCM. No audio or artwork from the reference videos is used.

## November 1 scoring and floor audio revision

Each movement has its own synthesized beat cue. Shoes, gloves and claps have percussive attacks. A rising sweep, spring sound, downward swish and steady tone distinguish the raise, jump, duck and pose wall. A separate two-note hit sound or descending miss sound plays when the scorer grades the movement.

The score card shows the last action, points earned, running points and streak while the main sign calls the next action. A check or cross at the lane edge gives a second visual signal. Full-size boxed footsteps travel on the floor into their matching receiving outlines. Their orientation stays flat through impact.

## November 1 open course and direct mouse interaction

Decorative tunnel ribs, side supports and moving edge lights are removed. The setup screen keeps all incoming cues disabled until Start Game. The floor lines and receivers remain in place.

Desktop simulation now intersects the mouse ray with the current incoming cue's displayed triangles. The click target travels with the cue. A short timing gate and one accepted attempt per cue prevent taps on distant future notes or repeated attempts from awarding points. A small filled pose badge exists only in editor simulation. On glasses, the hand and headset scoring paths continue to use tracked movement. The duck bar and pose wall now use sparse outlines to keep the surroundings visible.

For that revision, the desktop backdrop was Lens Studio's Plane environment. Earlier recordings used Sunlit Outdoor, whose white arch installation is part of that preview backdrop. Earlier videos also show the prior decorative tunnel and fixed action control.


## Restored environments and immediate mouse scores

The user asked to restore the park and reported that clicking moving objects did not score. Runtime logs showed simulation=false after a preview reset, so the desktop was waiting for tracked movement. A second problem was that accepted clicks generated synthetic poses, whose preparation and hold rules could still reject the movement.

The editor now starts in PREVIEW SIM after every reset. Direct clicks on the current displayed object use the shared 0.45-second timing window and grade immediately for 100 or 70 points. An early click gives retry guidance and does not consume the target. A countdown changes to CLICK NOW near the beat. The actual Specs movement evaluator and hold requirements remain active on glasses.

The Sunlit Outdoor park is restored, and all installed room/outdoor presets remain selectable. Native tests scored all seven target types in the park and a footprint in Sunlit Room. Compilation and 120 startup checks passed. The project was left at the park Start Game screen. The testing guide now distinguishes direct mouse timing rehearsal from physical movement recognition.

## November 6 submission preparation

The current Lens display name is Movement Club, with Park Circuit, Court Coach and Dance Trail as its three games. Prior sections above describe historical builds. All landing pages now offer direct Start Game and Menu; Court/Dance retain an optional Watch demo. Menu columns use matching 68-point labels; Court/Dance landing controls remain in one row. Park's three main labels match at 70.

Court animation and scoring now share a shot duration (6 seconds guided, 4 shuffled; demo 1.8). Boundary checks cover successful hits before landing, rejection exactly at/after landing, and zero recovery points following a miss. Shared main-menu Setup changes eye height for every game and recentres the floor anchor.

The Devpost Learn planning skill and its references/template were read again for this release; the current design brief reuses the learner's prior decisions, documents the implemented three-game flow and records remaining hardware limits. This is a current planning revision, not a claim that an earlier formal interview or approval took place.

Original audio now includes two Park masters and six Dance masters. Standard Snap packages and the Lens Studio preview environment remain external dependencies; no commercial reference-video assets are included. Final release checks and publication status are recorded separately.
