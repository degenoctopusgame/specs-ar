# Movement Club

Open `park-circuit-lens.esproj` in Lens Studio. Use **SPECS 27 → Interactive → Sunlit Outdoor** for the park or select a room in the Preview dropdown. The Lens opens at **Choose a workout**. Return to the menu with **Menu** in every game. Choose **Setup** on the main menu to adjust eye-to-floor height for all three games and recenter while standing in a clear practice space. Each new selection starts a fresh session.

| Game | First action | What earns points |
|---|---|---|
| **Park Circuit** | Start Game | Hit approaching foot, hand and obstacle cues on the beat. |
| **Court Coach** | Start Game, or optional Watch demo | Reach the shot’s zone for 50 points and recover to centre for another 50. |
| **Dance Trail** | Start Game, or optional Watch demo | Follow eight counts after the count-in; the optional demo also offers self-paced practice. |

**Court Coach.** The badminton opponent sends seven guided shots, followed by seven in shuffled order. Eight compact rings mark centre, left, right, short left, short right, front left, front right and front centre. Each destination appears in both rounds. A perfect game earns 1,400 points. The second round asks you to read the shuttle. In mouse mode, click its landing ring on the forward court diagram, before the shuttle lands, then click the centre ring. Guided shots take six seconds and shuffled shots four seconds; the visible flight and hit deadline use the same duration. On Specs, move into the corresponding small ring beside your stance and recover to base. A brief dwell registers each arrival. The score measures position and recovery. A racket is optional.

**Dance Trail.** Choose **Start Game** to enter the timed phrase directly, or **Watch demo** to watch the coach’s gold shoes demonstrate left, centre, right, centre, front left, centre, front right, centre. Rehearse all eight counts, then perform them after the four-count musical introduction. Tap **Pace ›** before **Watch demo** to cycle through Warm-up (40), Easy (60, the default), Steady (80), Brisk (100), Fast (120) and Expert (144) counts per minute. Each level has a matching music track with one audible pulse per count. At Easy, counts are one second apart. The demo and timed repeat use the selected pace. The middle practice round is self-paced. A correctly timed destination awards 70 or 100 points. A missed count awards zero. The timed repeat uses floor highlights and forward counts after the coach steps out of view. In Preview, click the corresponding rings. On glasses, the Lens measures headset position over the nearby zones.

**Testing.** Mac Preview starts in mouse mode. Court and Dance have an input toggle on their welcome panels for testing the tracked camera path. Pause freezes the lesson and, during the dance repeat, the music. Resume tracked play from centre. [Three-game verification](devpost/workout-verification.md)

## Park Circuit

Park Circuit turns the floor into a four-lane rhythm course for Specs. Follow 20 cues over an open floor course to the original 120 BPM track *Park Circuit Pulse*. The kick marks each beat. Boxed footprints slide along the floor into matching lane outlines, hand targets approach from the front, and full-width obstacles pass your stance.

## Play

1. Open `park-circuit-lens.esproj` in Lens Studio. Choose **Interactive Preview**, **SPECS 27** and **Sunlit Outdoor** for the original park. Use the environment dropdown at the top of Preview to switch to Sunlit Room, Evening Room, Colorful Home or the other installed presets. Reset the interactive camera and refresh Preview after switching environments.
2. Stand centred, face the start sign and choose **Start Game**. The Lens samples your standing head height here. Listen to the eight-beat count-in. The first cue lands at four seconds.
3. Follow the action named on the sign. **Relaxed** gives you four beats between targets. **Steady** gives you three beats. Each pace has a matching original music master with its movement cues mixed at the correct times.
4. Choose **Pause** to freeze the course and music. Return to the centre to resume. At the end, the results show your points, hits, misses and longest streak.

| Cue | How to play |
|---|---|
| Footprint | Step into the matching near lane as the moving box lines up with the matching outline ahead. Move out before repeating a lane. |
| Left or right punch | Start with the named hand near your chest and jab forward on the beat. Draw it back to prepare for another punch. |
| Clap | Start with hands apart in view and bring them together on the beat. |
| Raise left or right | Lift the named hand from below shoulder level to about eye level. |
| Hurdle | Rise as the low rail reaches you. The Lens measures the rise of your head, so a small hop or quick heel lift can register. |
| Duck | Bend your knees and keep your head low as the overhead bar passes. |
| Pose wall | Centre yourself, raise both wrists beside your face with elbows out and hold them still before and through the wall. |

The four near lane centres are about 56 cm left, 19 cm left, 19 cm right and 56 cm right, each 27 cm forward. **Setup** offers a narrower footprint, heading adjustment and manual floor-height calibration. Steps use horizontal headset displacement. Hand moves use tracked wrists. The jump and duck use changes in headset height.

## How to read a beat

The start sign calls the upcoming action. On its beat you hear the movement itself: a shoe striking the ground, a glove thump, a clap, a rising sweep, a springing jump, a downward swish or a steady wall tone. That sound plays even if you stay still.

The Lens scores the tracked movement automatically. A scored hit gets a bright two-note confirmation and **HIT +100** or **HIT +70**. A miss gets a descending tone and **MISS +0**, and resets the streak. The score panel keeps the last move and its points visible until another move is graded. Pinching operates menu buttons. You can keep your hands in the required position throughout a duck or wall hold.

If you edit the chart or pace constants, rebuild the two pace tracks with Node 24 using `node --experimental-transform-types tempAssetGen/mix_movement_tracks.mjs`.

The course is static until **Start Game**. Incoming cues begin during the musical count-in after starting.

## Desktop simulation

Mouse mode is enabled automatically when the project runs in Lens Studio, including after a refresh. Confirm **PREVIEW SIM** above the sign, then choose **Start Game**. If you deliberately selected headset testing, use **Setup → Preview sim → Done** to switch back.

Follow the current moving footprint, glove, hand, hurdle arrow, duck beam or pose badge. When the sign says **CLICK NOW**, click its visible shape at its current position. Every move uses the same mouse timing window, within 0.45 seconds of its beat. A valid click immediately adds **100** or **70** points, plays the hit response and removes that target. An early click shows guidance and lets you try again. Empty space, the wall opening and later cues do not score. Skipping the current cue produces **MISS +0**.

Desktop clicks rehearse targeting, timing, scoring and feedback. They do not simulate or validate a physical punch, jump, duck or sustained pose. On Specs, mouse mode is disabled and the original tracked head and wrist recognition, including continuous holds, remains active. The game stays still before Start Game in every environment.

Earlier Park Circuit recordings and design history are in the development project’s `devpost/` folder. They may show superseded controls. See [current release verification](devpost/release-verification.md), [current design brief](devpost/design-brief.md), and [submission description](devpost/submission-description.md).

The older Word testing guide is historical. This README and the current release verification describe the submission build.
