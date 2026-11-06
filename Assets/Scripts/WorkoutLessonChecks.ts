import {COUNT_IN, courtFlightProgress, COURT_DESTINATIONS, CourtLesson, DANCE_LEVELS, DanceLesson, PHRASE, POSITIONS, standingZone, ZoneEntry} from "./WorkoutLessons";

export function runWorkoutChecks():number {
  let passed=0;
  const check=(condition:boolean,label:string)=>{
    if(!condition)throw new Error("Workout check failed: "+label);passed++;
  };
  check(standingZone(-40,-55,true)==="frontLeft" && standingZone(40,-55,true)==="frontRight","physical diagonals");
  check(standingZone(0,-35,true)===null,"space between physical pads");
  for(const z of COURT_DESTINATIONS) {
    const [x,depth]=POSITIONS[z];
    check(standingZone(x,depth,true)===z,"court target is reachable: "+z);
  }
  check(standingZone(-25,-28,false)===null,"short court rings do not become dance input");
  const entry=new ZoneEntry();
  check(entry.sample("left",.08)===null && entry.sample("left",.08)==="left","stable landing");
  check(entry.sample("left",.6)===null,"no repeat for standing still");
  const c=new CourtLesson(()=>.4);
  check(!c.enter("left") && c.points===0,"no score at menu");
  c.startDemo();c.advance(1);check(c.target==="frontLeft","shot demonstration");
  c.advance(1);check(c.target==="base","recovery demonstration");
  c.advance(2);c.startDrill();
  check(!c.enter("frontRight") && c.index===0,"wrong shot");
  check(c.enter("left") && c.points===50 && !c.enter("left"),"reach requires recovery");
  check(c.enter("base") && c.points===100 && c.index===1,"return to base");
  c.advance(6.1);check(c.phase==="recover" && c.enter("base") && c.points===100,"miss gives no recovery points");
  check(c.shots.length===14 && new Set(c.shots.slice(7)).size===7,"every shot in shuffled round");
  while(c.index<c.shots.length){c.enter(c.target);c.enter("base");}
  check(c.phase==="results" && c.points===1300 && c.arrivals===13 && c.recoveries===13,"mixed rally completes");
  const directCourt=new CourtLesson(()=>.4);
  directCourt.startDrill();
  check(directCourt.phase==="reach" && directCourt.index===0 && directCourt.points===0,"court starts without demo");
  check(directCourt.enter(directCourt.target) && directCourt.enter("base") && directCourt.points===100,"direct court start scores reach and recovery");
  directCourt.advance(1);directCourt.startDrill();
  check(directCourt.index===1 && directCourt.time===1,"start cannot reset an active court round");
  for(const guided of [true,false]) {
    for(const offset of [-.001,0,.001]) {
      const boundary=new CourtLesson(()=>.4);boundary.startDrill();
      if(!guided)for(let i=0;i<7;i++){boundary.enter(boundary.target);boundary.enter("base");}
      const target=boundary.target, score=boundary.points, duration=boundary.shotSeconds;
      check(duration===(guided?6:4),"guided and rally flight durations");
      boundary.advance(duration+offset);
      const landed=courtFlightProgress(duration+offset,duration)===1;
      check(landed===(offset>=0),"visible landing boundary");
      check(boundary.enter(target)===(offset<0),"hit accepted only before landing");
      check(boundary.points===score+(offset<0?50:0),"late shot never scores");
      boundary.enter("base");
      check(boundary.points===score+(offset<0?100:0),"missed shot recovery never scores");
    }
  }
  for(const {bpm} of DANCE_LEVELS){
    const beat=60/bpm;
    const directDance=new DanceLesson(beat);
    directDance.startMusic();
    check(directDance.phase==="countIn" && !directDance.enter("left"),"direct dance start keeps count-in at "+bpm);
    PHRASE.forEach((zone,i)=>{
      directDance.sync((COUNT_IN+i+.001)*beat);directDance.enter(zone);
    });
    directDance.sync((COUNT_IN+PHRASE.length)*beat);
    check(directDance.phase==="results" && directDance.hits===8 && directDance.points===800,"direct dance round scores without demo or practice at "+bpm);
    directDance.startMusic();
    check(directDance.phase==="results" && directDance.points===800,"start cannot reset dance results at "+bpm);
    const d=new DanceLesson(beat);
    d.startDemo();
    for(let i=0;i<8;i++) {
      d.syncDemo((i+.001)*beat);
      check(d.index===i,"demo count "+(i+1)+" at "+bpm);
    }
    d.syncDemo(8*beat);
    check(d.phase==="practice" && !d.enter("right"),"practice must follow phrase");
    PHRASE.forEach(z=>d.enter(z));
    check(d.phase==="ready" && d.points===0,"practice prepares timed round");
    d.startMusic(); d.sync(beat);check(!d.enter("left"),"no points during count-in");
    PHRASE.forEach((zone,i)=>{
      d.sync((COUNT_IN+i+.001)*beat);
      check(d.shownIndex===i,"timed cue is on the music beat at "+bpm);
      if(i===3)return;
      d.enter(zone);
      check(d.shownIndex===i,"hit keeps displayed count until next beat");
    });
    d.sync((COUNT_IN+8)*beat);
    check(d.phase==="results" && d.hits===7 && d.points===700,"music clock counts skipped steps");
  }
  return passed;
}
