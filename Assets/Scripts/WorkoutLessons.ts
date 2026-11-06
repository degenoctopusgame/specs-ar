export type Workout = "menu" | "park" | "court" | "dance";
export type Zone = "base" | "left" | "right" | "frontLeft" | "frontRight" | "shortLeft" | "shortRight" | "front";
export const DANCE_ZONES: Zone[] = ["base", "left", "right", "frontLeft", "frontRight"];
export const COURT_DESTINATIONS: Zone[] = ["left", "right", "shortLeft", "shortRight", "frontLeft", "frontRight", "front"];
export const COURT_ZONES: Zone[] = ["base", ...COURT_DESTINATIONS];
export const COURT_STANCE_RADIUS = 14;
export const DANCE_STANCE_RADIUS = 19;
export const COURT_GUIDED_FLIGHT_SECONDS = 6;
export const COURT_RALLY_FLIGHT_SECONDS = 4;
export const COURT_DEMO_FLIGHT_SECONDS = 1.8;
// Animation and scoring share this duration; 1 means the shuttle has landed.
export function courtFlightProgress(elapsed: number, duration: number): number {
  return Math.max(0, Math.min(1, elapsed / duration));
}
export const POSITIONS: Record<Zone, [number, number]> = {
  base: [0, 0], left: [-52, -8], right: [52, -8],
  frontLeft: [-40, -55], frontRight: [40, -55],
  shortLeft: [-25, -28], shortRight: [25, -28], front: [0, -70]
};
export const ZONE_NAMES: Record<Zone, string> = {
  base: "Centre", left: "Left side", right: "Right side",
  frontLeft: "Front left", frontRight: "Front right",
  shortLeft: "Short left", shortRight: "Short right", front: "Front centre"
};
export function standingZone(x: number, z: number, court: boolean): Zone | null {
  for (const zone of court ? COURT_ZONES : DANCE_ZONES) {
    const [cx, cz] = POSITIONS[zone];
    if (Math.hypot(x - cx, z - cz) <= (court ? COURT_STANCE_RADIUS : DANCE_STANCE_RADIUS)) return zone;
  }
  return null;
}

// Require a stable landing. A fresh entry is a single action, even across many frames.
export class ZoneEntry {
  private zone: Zone | null = null;
  private duration = 0;
  private delivered = false;
  reset() { this.zone = null; this.duration = 0; this.delivered = false; }
  sample(zone: Zone | null, dt: number): Zone | null {
    if (zone !== this.zone) { this.reset(); this.zone = zone; }
    this.duration += dt;
    if (!zone || this.delivered || this.duration < 0.14) return null;
    this.delivered = true;
    return zone;
  }
}

export class CourtLesson {
  phase: "intro" | "demo" | "ready" | "reach" | "recover" | "results" = "intro";
  time = 0;
  index = 0;
  points = 0;
  arrivals = 0;
  recoveries = 0;
  feedback = "";
  private reached = false;
  readonly shots: Zone[];
  constructor(random = Math.random) {
    const guided = COURT_DESTINATIONS;
    const rally = guided.slice();
    for (let i = rally.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [rally[i], rally[j]] = [rally[j], rally[i]];
    }
    this.shots = guided.concat(rally);
  }
  get guided() { return this.index < COURT_DESTINATIONS.length; }
  get shotSeconds() {
    return this.phase === "demo" ? COURT_DEMO_FLIGHT_SECONDS :
      this.guided ? COURT_GUIDED_FLIGHT_SECONDS : COURT_RALLY_FLIGHT_SECONDS;
  }
  get target(): Zone {
    if (this.phase === "recover") return "base";
    if (this.phase === "demo") return this.time < COURT_DEMO_FLIGHT_SECONDS ? "frontLeft" : "base";
    return this.shots[this.index] || "base";
  }
  startDemo() { if (this.phase === "intro") { this.phase = "demo"; this.time = 0; } }
  startDrill() {
    if (this.phase !== "intro" && this.phase !== "ready") return;
    this.phase = "reach"; this.time = 0; this.feedback = "";
  }
  advance(dt: number) {
    this.time += dt;
    if (this.phase === "demo" && this.time >= COURT_DEMO_FLIGHT_SECONDS * 2) { this.phase = "ready"; this.time = 0; }
    if (this.phase === "reach" && courtFlightProgress(this.time, this.shotSeconds) >= 1) {
      this.reached = false; this.feedback = "Shot missed · recover to centre";
      this.phase = "recover"; this.time = 0;
    }
  }
  enter(zone: Zone): boolean {
    if (this.phase !== "reach" && this.phase !== "recover") return false;
    if (zone !== this.target) { this.feedback = "Find " + ZONE_NAMES[this.target].toLowerCase(); return false; }
    if (this.phase === "reach") {
      this.reached = true; this.arrivals++; this.points += 50;
      this.phase = "recover"; this.feedback = "Reached +50 · return to centre";
    } else {
      if (this.reached) { this.recoveries++; this.points += 50; }
      this.feedback = this.reached ? "Recovered +50" : "Ready for the next shot";
      this.reached = false; this.index++;
      this.phase = this.index === this.shots.length ? "results" : "reach";
    }
    this.time = 0;
    return true;
  }
}

// Two four-count motifs, first side to side, then into the front corners.
export const PHRASE: Zone[] = ["left", "base", "right", "base", "frontLeft", "base", "frontRight", "base"];
export const DANCE_LEVELS = [
  {name:"Warm-up", bpm:40}, {name:"Easy", bpm:60}, {name:"Steady", bpm:80},
  {name:"Brisk", bpm:100}, {name:"Fast", bpm:120}, {name:"Expert", bpm:144}
];
export const COUNT_IN = 4;
export class DanceLesson {
  phase: "intro" | "demo" | "practice" | "ready" | "countIn" | "timed" | "results" = "intro";
  index = 0;
  time = 0;
  points = 0;
  hits = 0;
  feedback = "";
  constructor(public beatSeconds = 1) {}
  get target(): Zone { return PHRASE[this.index] || "base"; }
  get due() { return (COUNT_IN + this.index) * this.beatSeconds; }
  // Input can arrive early or late; the count shown to the dancer belongs to the music.
  get shownIndex() {
    if (this.phase !== "timed") return this.index;
    return Math.max(0, Math.min(PHRASE.length-1, Math.floor(this.time/this.beatSeconds) - COUNT_IN));
  }
  get shownTarget(): Zone { return PHRASE[this.shownIndex] || "base"; }
  get window() { return this.beatSeconds * 0.42; }
  startDemo() { if (this.phase === "intro") { this.phase = "demo"; this.time = 0; } }
  syncDemo(clock: number) {
    if (this.phase !== "demo") return;
    this.time = clock;
    this.index = Math.floor(this.time / this.beatSeconds);
    if (this.index >= PHRASE.length) { this.phase = "practice"; this.index = 0; this.time = 0; }
  }
  startMusic() {
    if (this.phase !== "intro" && this.phase !== "ready") return;
    this.phase = "countIn"; this.time = 0; this.index = 0; this.feedback = "";
  }
  // Music position is the single clock for both visual counts and timed entries.
  sync(clock: number) {
    if (this.phase !== "timed" && this.phase !== "countIn") return;
    this.time = clock;
    if (clock >= COUNT_IN * this.beatSeconds) this.phase = "timed";
    while (this.phase === "timed" && this.index < PHRASE.length && clock > this.due + this.window) this.finishCount(0);
    if (clock >= (COUNT_IN+PHRASE.length)*this.beatSeconds) this.phase="results";
  }
  enter(zone: Zone): boolean {
    if (this.phase !== "practice" && this.phase !== "timed") return false;
    if (this.index >= PHRASE.length) return false;
    if (zone !== this.target) { this.feedback = "Find " + ZONE_NAMES[this.target].toLowerCase(); return false; }
    if (this.phase === "practice") {
      this.feedback = "Learned count " + (this.index + 1); this.index++;
      if (this.index === PHRASE.length) { this.index = 0; this.phase = "ready"; }
      return true;
    }
    const error = Math.abs(this.time - this.due);
    if (error > this.window) { this.feedback = "Early · try again on the count"; return false; }
    this.finishCount(error < this.beatSeconds * 0.16 ? 100 : 70);
    return true;
  }
  private finishCount(points: number) {
    this.feedback = points ? "Count " + (this.index + 1) + " · HIT +" + points : "Count " + (this.index + 1) + " · MISS +0";
    this.points += points;
    if (points) this.hits++;
    this.index++;
  }
}
