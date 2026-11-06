# Movement Club release verification

Date: 6 November 2026 (Europe/Lisbon). This record supersedes older test records for release decisions.

## Results

| Check | Observed result |
|---|---|
| TypeScript build and native startup | Compilation succeeds. 120 Park rhythm checks + 234 lesson checks = **354 passing checks**. |
| Court landing boundary | Guided flight 6 seconds; shuffled flight 4 seconds; demo 1.8 seconds. Animation and scoring share duration. New checks cover just before, exactly at and after landing, including no recovery points after a miss. |
| Original requested UI | Park Menu/Start Game/Setup use 70-point labels. Both menu columns use 68. Court has four landing controls in one row; Dance has five; font sizes are retained. All games offer direct Start Game and Menu. |
| Shared setup | Main Menu → Setup opens. Eye height changes 170→175→170 cm, Recenter displays Centred, Done returns to menu. All games consume the shared floor anchor/height in code. |
| Park native complete run | All 20 cues resolved: 20 hits, 0 misses, 1,730 points, streak 20. |
| Court native complete run | 14 shots resolved: 13 reached, 13 recovered; 1,300/1,400 points. Results shown; return to menu works. |
| Court optional demo | Watch demo advances to Take your ready stance with Start Game available. |
| Dance direct-start native run | Count-in, pause/resume, timed phrase and results observed; 4/8 timed counts, 280 points. The pause state remained stable for about 13 seconds before resume. |
| Dance optional learning path | Watch demo reaches self-paced Practice. Clicking the eight correct destinations advances all counts and reaches Ready for music / Play phrase. |
| Six Dance tempos | Native welcome page cycles through 60, 80, 100, 120, 144, 40 and back to 60 counts/minute. Timing/scoring at all tempos is covered by lesson logic checks. |
| Fresh source-copy startup | Copied project/assets/packages into a separate source folder, opened that `.esproj` in Lens Studio, recompiled, refreshed and observed menu plus all 354 checks. No dependency on the original generated Cache was copied. Full gameplay sessions were run in the primary project, not repeated in the copied project. |
| Restored working project | Primary project reopened, recompiled and saved; left at Choose a workout. |
| Submission video | Revised v2: Court Coach re-recorded at a paced 14/14 reaches + 14/14 recoveries (1,400/1,400); static pauses limited to four seconds and Park music aligned with gameplay. Actual native Preview capture edited to 118.52 seconds, H.264 1920×1080/30 fps with AAC audio. English explanatory side panels; excerpts retain normal speed. Complete file decodes without errors. |

## Reproduce

1. Extract the source archive to a new folder. Open `park-circuit-lens.esproj` in Lens Studio 5.23.2 or a compatible version and allow imports to complete.
2. Select Specs 27, Interactive, Sunlit Outdoor. Expand the Preview panel if the editor opens a narrow default workspace. Refresh Preview.
3. Verify the two startup log lines report 120 rhythm checks and 234 lesson checks, then follow the three games in README. Use mouse input for desktop testing.
4. Test each landing page's Start Game and Menu; Court/Dance Watch demo; main-menu Setup; each game's pause/replay; and Dance's six pace options.
5. Skipping cues must produce misses. Court recovery after a missed shot must not add points. Dance Easy uses one second per count.

## Evidence limits

These are logic and native Preview checks, not LEAF tests or physical device validation. The editor network service intermittently logs `Host requires authentication`; no gameplay exception was observed in the final compile/startup passes. That service warning remains unresolved. The packaged SIK manifest version and its internal runtime banner differ; no package upgrade was attempted during release preparation.

Mouse success does not establish foot detection, movement-form accuracy, physical comfort or outdoor safety. Specs hardware tracking, field of view, thermal behaviour and performance profiling remain unverified. The 6–12 metre forward court diagram is a teaching map; nearby stance rings drive physical movement. Its readability and comfort still need hardware testing.
