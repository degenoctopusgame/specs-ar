# Movement Club

**Tagline:** Three spatial movement games that keep your hands free and your eyes up.

## Inspiration
Following a workout on a phone means repeatedly looking away from the space where you are moving. We wanted a coach that puts the next destination in that space: a rhythm lane, a badminton recovery target, or the next step of a dance phrase.

## What it does
Movement Club is a Specs Lens with three short movement-practice games. Park Circuit combines 20 foot, hand and obstacle cues with original music and timing feedback. Court Coach teaches reaching seven destinations and returning to centre across a guided and a shuffled round. Dance Trail teaches an eight-count phrase at six tempos, from 40 to 144 counts per minute.

Each game supports direct start. Court and Dance also offer optional demonstrations. Shared setup calibrates eye-to-floor height, and pause, replay and visible hit/miss feedback support practice at your own pace.

## Why glasses
The cues are anchored around the learner's starting stance. Hands remain available for movement, while forward prompts and floor zones indicate where and when to move. The purpose is spatial timing and movement practice without holding a screen.

## How we built it
The project began during the hackathon using the standard Specs Base Template in Lens Studio 5.23.2. We used an AI coding agent with CLAD and Lens Studio MCP, and the Devpost Learn planning template and design/preview guidance. TypeScript implements the lesson state machines, scoring, procedural geometry and music synchronisation. SIK and Spectacles UIKit provide the menu controls. Geometry and synthesized music/cues were created for this project.

## Challenges and what we learned
We learned to keep the visual cue, sound and scoring window on the same clock; to separate mouse rehearsal from physical sensing; and to make demonstrations optional so returning players can start immediately. Preview testing exposed a shuttle/scoring deadline mismatch, which was corrected with shared flight timing and boundary checks. We also revised menu typography, kept landing controls in one row, and made calibration accessible before any game.

## What the demo proves
The video shows the actual Lens Studio Preview with desktop mouse simulation: working menus, animations, timing, scoring, recovery and results. Court/Dance's deployed input uses headset position over floor zones, and Park additionally samples wrists and head height. The prototype does not detect individual feet or assess exercise form. Physical tracking quality, comfort and outdoor use have not been validated on Specs hardware. The streetscape is Lens Studio's built-in preview environment.

## What's next
Test on Specs, refine comfort and readability, and tune movement thresholds with real users. Longer practice sessions and adaptive progression can follow that validation.

## Submission fields
- Name: Movement Club
- Built with: Lens Studio, TypeScript, Specs, CLAD, Lens Studio MCP, Spectacles Interaction Kit, Spectacles UIKit
- Public repository: https://github.com/degenoctopusgame/specs-ar
- Public YouTube video: pending publication
