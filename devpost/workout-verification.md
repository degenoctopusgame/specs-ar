# Movement Club preview checks

November 3, 2026. Lens Studio 5.23.2, SPECS 27 Interactive Preview, Sunlit Outdoor.

The shared planning conversation identified three lessons for one app. This build uses badminton for Court Coach and an original eight-count footwork phrase for Dance Trail. The court dimensions, 14-shot drill, score values and dance tempos are implementation choices for this build.

| Flow | Observed in native Preview |
|---|---|
| Launch and navigation | A fresh reset opened the three-game menu. Each selection opened its own welcome screen. Menu returned from Court Coach. Games returned from Park Circuit and Dance Trail. |
| Court Coach with mouse | The demo illustrated a shot and centre recovery. An incorrect ring earned zero. Pause and resume worked. Seven guided shots and seven shuffled shots completed with 14 reaches, 14 recoveries and 1,400/1,400 points. Menu and Start Game were visible together after the demonstration. Play again returned to the welcome panel. |
| Court Coach with tracked camera | From the first guided shot, moving the Preview camera 52 cm left and 8 cm forward earned 50 points. Moving back to the original position earned the recovery points and advanced to the next shot. A new short-left shot at 25 cm left and 28 cm forward also registered, and the three completed shot-and-return pairs reached 300 points. |
| Dance Trail with mouse | All six paces were selectable through the Pace button (40, 60, 80, 100, 120 and 144 counts/min). The 60-counts-per-minute demo transitioned into eight-step practice. After Play phrase, four musical counts led into the timed steps. Seven timed clicks plus one intentionally skipped count finished at 700/800 with seven hits. |
| Park Circuit regression | After returning from Court Coach, Start Game played the existing chart. A click on the first moving footprint produced HIT +70, 70 PTS and a streak of one. Games returned to the main menu during the song. |
| Compile and checks | Native TypeScript compilation passed. Fresh startup logged 120 Park Circuit checks and 183 lesson checks. No gameplay exceptions were observed. |

The earlier dance build used a 120 BPM soundtrack at either pace. Its kick peaks at 0, 0.5, 1 and 1.5 seconds explained the audible double pulse at 60. Each selectable pace now has a dedicated track with one kick per count, and its playback position drives the demo, count-in, timed display and grading. The middle practice is explicitly self-paced.

Across the six generated WAVs, a 5 ms energy-onset scan placed all 12 intended pulses within 4 ms of the beat grid. The 60 track measured 60.0 counts/min. In native Preview, count changes during the 60 timed phrase averaged 0.994 seconds, with intervals of 0.964–1.038 seconds. A successful first-count click earned 100 while the sign still showed count one. The 40 and 144 demos were also exercised in Preview, including pause and resume at 40.

The new checks cover zone entry and dwell, incorrect destinations, required recovery, missed shots, full rally completion, eight-count practice, missed counts and timed results at every selectable tempo.

The outdoor park and room presets are desktop environments. On glasses, the two new lessons use headset position over reachable floor zones. Testing on physical Specs is still needed for tracking, comfort, readability and timing.

[Main menu](preview/workout-menu.jpg) · [Court buttons and rings](preview/court-start.jpg) · [Dance pace control](preview/dance-pace.jpg) · [Court recovery](preview/court-recovery.jpg) · [Court result](preview/court-results.jpg) · [Dance demonstration](preview/dance-demo.jpg) · [Dance result](preview/dance-results.jpg)
