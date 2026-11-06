import {ParkCircuitMain} from "./ParkCircuitMain";
import {WorkoutMenuUI, LessonView} from "./WorkoutMenuUI";
import {COUNT_IN, CourtLesson, DANCE_LEVELS, DanceLesson, PHRASE, Workout, standingZone, ZoneEntry, ZONE_NAMES, Zone} from "./WorkoutLessons";
import {WorkoutStage} from "./WorkoutStage";
import {runWorkoutChecks} from "./WorkoutLessonChecks";

const DANCE_MASTERS: Record<number, () => AudioTrackAsset> = {
  40: () => requireAsset("../GeneratedSFX/Dance40.wav") as AudioTrackAsset,
  60: () => requireAsset("../GeneratedSFX/Dance60.wav") as AudioTrackAsset,
  80: () => requireAsset("../GeneratedSFX/Dance80.wav") as AudioTrackAsset,
  100: () => requireAsset("../GeneratedSFX/Dance100.wav") as AudioTrackAsset,
  120: () => requireAsset("../GeneratedSFX/Dance120.wav") as AudioTrackAsset,
  144: () => requireAsset("../GeneratedSFX/Dance144.wav") as AudioTrackAsset
};

@component
export class WorkoutClub extends BaseScriptComponent {
  @input park: ParkCircuitMain;
  @input consoleUI: WorkoutMenuUI;
  @input courtRoot: SceneObject;
  @input danceRoot: SceneObject;

  private mode: Workout = "menu";
  private court: CourtLesson;
  private dance: DanceLesson;
  private courtStage: WorkoutStage;
  private danceStage: WorkoutStage;
  private entry = new ZoneEntry();
  private mouse = false;
  private levelIndex = DANCE_LEVELS.findIndex(level => level.bpm === 60);
  private paused = false;
  private pauseReason = "";
  private ready = false;
  private music: AudioComponent;
  private hit: AudioComponent;
  private miss: AudioComponent;
  private previousView = "";
  private lastPoint: vec3 | null = null;
  onAwake() {
    this.createEvent("OnStartEvent").bind(()=>this.start());
    this.createEvent("UpdateEvent").bind(()=>this.update());
    this.createEvent("TouchStartEvent").bind(e=>this.tap(e.getTouchPosition()));
  }
  private start() {
    if (!this.park || !this.consoleUI || !this.courtRoot || !this.danceRoot) throw new Error("Workout Club scene references are missing.");
    this.mouse = global.deviceInfoSystem.isEditor();
    this.music = this.audio(DANCE_MASTERS[DANCE_LEVELS[this.levelIndex].bpm](), .62);
    this.hit = this.audio(requireAsset("../GeneratedSFX/MoveHit.wav") as AudioTrackAsset, .40);
    this.miss = this.audio(requireAsset("../GeneratedSFX/MoveMiss.wav") as AudioTrackAsset, .27);
    this.consoleUI.choose.add(mode=>this.select(mode));
    this.consoleUI.primary.add(()=>this.primary());
    this.consoleUI.demo.add(()=>this.demo());
    this.consoleUI.auxiliary.add(()=>this.option());
    this.consoleUI.input.add(()=>{
      if (!global.deviceInfoSystem.isEditor() || !this.isIntro()) return;
      this.mouse = !this.mouse; this.render();
    });
    this.consoleUI.setup.add(()=>this.consoleUI.showSetup(this.park.eyeHeightCm));
    this.consoleUI.setupHeight.add(delta=>{
      this.park.adjustEyeHeight(delta);this.positionConsole();
      this.consoleUI.showSetup(this.park.eyeHeightCm);
    });
    this.consoleUI.recenter.add(()=>{
      this.park.anchorWorkout();this.positionConsole();
      this.consoleUI.showSetup(this.park.eyeHeightCm,true);
    });
    this.consoleUI.setupDone.add(()=>this.select("menu"));
    this.park.ui.onGames.add(()=>this.select("menu"));
    this.ready=true;
    print("[Workout Club tests] "+runWorkoutChecks()+" lesson checks passed");
    this.select("menu");
  }
  private audio(track:AudioTrackAsset, volume:number) {
    const a=this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent;
    a.audioTrack=track; a.playbackMode=Audio.PlaybackMode.LowLatency; a.mixToSnap=true; a.volume=volume; return a;
  }
  private stopAudio() {
    for(const a of [this.music,this.hit,this.miss]) {
      if(a.isPlaying() || a.isPaused()) a.stop(false);
    }
    this.music.position=0;
  }
  private select(mode:Workout) {
    this.stopAudio(); this.mode=mode; this.paused=false; this.pauseReason=""; this.entry.reset();
    this.lastPoint=null; this.previousView="";
    this.park.setWorkoutActive(mode==="park");
    this.consoleUI.sceneObject.enabled=mode!=="park";
    this.courtRoot.enabled=mode==="court"; this.danceRoot.enabled=mode==="dance";
    if(mode==="park") { print("[Workout Club] Park Circuit"); return; }
    this.park.anchorWorkout();
    this.positionConsole();
    if(mode==="menu") { this.consoleUI.showLibrary(true); print("[Workout Club] main menu"); return; }
    if(mode==="court") {
      this.court=new CourtLesson();
      if(!this.courtStage)this.courtStage=new WorkoutStage(this.courtRoot,this.park.course.material,true);
      this.courtStage.highlight(null); this.courtStage.courtShot(null,0,this.court.shotSeconds);
    } else {
      this.configureDance();
      if(!this.danceStage)this.danceStage=new WorkoutStage(this.danceRoot,this.park.course.material,false);
      this.danceStage.highlight(null); this.danceStage.danceStep(null,0);
    }
    this.render();
  }
  private positionConsole(){
    this.consoleUI.sceneObject.getTransform().setLocalPosition(new vec3(0,this.park.eyeHeightCm+25,-175));
  }
  private configureDance() {
    const bpm = DANCE_LEVELS[this.levelIndex].bpm;
    this.dance = new DanceLesson(60/bpm);
    this.music.audioTrack = DANCE_MASTERS[bpm]();
    this.music.position = 0;
  }
  private isIntro() { return this.mode==="court" ? this.court.phase==="intro" : this.mode==="dance" && this.dance.phase==="intro"; }
  private activeLesson() {
    if(this.mode==="court")return this.court.phase==="reach" || this.court.phase==="recover";
    if(this.mode==="dance")return ["practice","countIn","timed"].includes(this.dance.phase);
    return false;
  }
  private primary() {
    if(this.paused) { this.resume(); return; }
    if(this.mode==="court") {
      if(this.court.phase==="intro" || this.court.phase==="ready") {
        this.court.startDrill(); this.entry.reset(); this.lastPoint=null;
      }
      else if(this.court.phase==="results")this.select("court");
      else this.pause("Paused");
    } else if(this.mode==="dance") {
      if(this.dance.phase==="intro" || this.dance.phase==="ready") {
        this.dance.startMusic(); this.music.position=0; this.music.play(1); this.entry.reset(); this.lastPoint=null;
      } else if(this.dance.phase==="results")this.select("dance");
      else this.pause("Paused");
    }
    this.render();
  }
  private demo() {
    if(this.paused || !this.isIntro())return;
    if(this.mode==="court")this.court.startDemo();
    else {
      this.dance.startDemo(); this.music.position=0; this.music.play(1);
    }
    this.entry.reset(); this.lastPoint=null; this.render();
  }
  private option() {
    if(this.paused) { this.select(this.mode); return; }
    if(this.mode==="dance" && this.dance.phase==="intro") {
      this.levelIndex=(this.levelIndex+1)%DANCE_LEVELS.length;
      this.configureDance(); this.render();
    }
  }
  private pause(reason:string) {
    this.paused=true; this.pauseReason=reason; this.entry.reset(); this.lastPoint=null;
    if(this.music.isPlaying())this.music.pause();
    this.render();
  }
  private playerPoint() {
    const camera=this.park.cameraObject.getTransform().getWorldPosition();
    return this.park.courseRoot.getTransform().getInvertedWorldTransform().multiplyPoint(camera);
  }
  private resume() {
    const p=this.playerPoint();
    if(!this.mouse && (!this.park.hasTracking || Math.hypot(p.x,p.z)>25)) {
      this.pauseReason="Return to centre to resume"; this.render(); return;
    }
    this.paused=false;this.entry.reset();this.lastPoint=null;
    if(this.music.isPaused())this.music.resume();
    this.render();
  }
  private tap(screen:vec2) {
    if(!this.ready || !global.deviceInfoSystem.isEditor() || !this.mouse || this.paused || !this.activeLesson())return;
    const camera=this.park.cameraObject.getComponent("Component.Camera") as Camera;
    const origin=this.park.cameraObject.getTransform().getWorldPosition();
    const point=camera.screenSpaceToWorldSpace(screen,100);
    const stage=this.mode==="court"?this.courtStage:this.danceStage;
    const zone=stage.pick(origin,point);
    if(zone)this.enter(zone);
  }
  private enter(zone:Zone) {
    let accepted=false;
    if(this.mode==="court")accepted=this.court.enter(zone);
    else {
      if(this.dance.phase==="timed" || this.dance.phase==="countIn")this.dance.sync(this.music.position);
      accepted=this.dance.enter(zone);
    }
    if(accepted)this.hit.play(1);
    this.render();
  }
  private update() {
    if(!this.ready || this.paused || (this.mode!=="court" && this.mode!=="dance"))return;
    const dt=getDeltaTime();
    if(!this.mouse && this.activeLesson()) {
      const p=this.playerPoint();
      const jumped=this.lastPoint && p.sub(this.lastPoint).length>80;
      if(!this.park.hasTracking || !Number.isFinite(p.x+p.z) || dt>.65 || jumped || Math.abs(p.x)>112 || p.z< -110 || p.z>65) {
        this.pause("Tracking or practice boundary"); return;
      }
      this.lastPoint=p;
    }
    if(this.mode==="court")this.updateCourt(dt);else this.updateDance();
    if(!this.mouse && this.activeLesson()) {
      const p=this.playerPoint(), landing=this.entry.sample(standingZone(p.x,p.z,this.mode==="court"),dt);
      if(landing)this.enter(landing);
    }
    this.render();
  }
  private updateCourt(dt:number) {
    const c=this.court, before=c.phase;
    c.advance(dt);
    if(before==="reach" && c.phase==="recover") { this.entry.reset(); this.miss.play(1); }
    const moving=c.phase==="reach" || c.phase==="recover" || c.phase==="demo";
    this.courtStage.courtShot(moving?c.target:null,c.time,c.shotSeconds);
    this.courtStage.highlight(moving && (c.guided || c.phase==="recover") ? c.target : null);
  }
  private updateDance() {
    const d=this.dance, previous=d.index, before=d.phase;
    if(before==="demo") {
      d.syncDemo(this.music.position);
      if(d.phase==="practice")this.music.stop(false);
    }
    if(d.phase==="timed" || d.phase==="countIn") {
      d.sync(this.music.position);
      if(d.index>previous && d.feedback.includes("MISS"))this.miss.play(1);
    }
    if(d.phase==="results" && this.music.isPlaying())this.music.stop(false);
    if(before!==d.phase)this.entry.reset();
    const teaching=d.phase==="demo" || d.phase==="practice";
    const visible=teaching || d.phase==="timed";
    this.danceStage.highlight(visible ? d.shownTarget : null);
    this.danceStage.danceStep(teaching?d.target:null,d.phase==="demo"?(d.time/d.beatSeconds)%1:1,
      d.index>0?PHRASE[d.index-1]:"base");
  }
  private render() {
    if(this.mode!=="court" && this.mode!=="dance")return;
    const source=this.mouse?"MOUSE":"TRACKED";
    const v:LessonView={theme:this.mode,kicker:"",title:"",detail:"",record:"",primary:"",auxiliary:"",input:"",demo:this.isIntro()};
    if(this.mode==="court") {
      const c=this.court;
      v.kicker="COURT COACH   /   "+source;
      v.record=c.feedback || c.shots.length+" shots   ·   50 reach + 50 recover";
      if(c.phase==="intro" || c.phase==="ready") {
        v.title=c.phase==="intro"?"Badminton footwork":"Take your ready stance";
        v.detail=this.mouse?"Testing Mode on PC - Click the shot's floor ring before it lands on the floor, then click the centre ring to continue to next round":"Step to a ring beside you. The distant court is your map.";
        v.primary="Start Game";
      } else if(c.phase==="results") {
        v.title="Rally complete"; v.detail=c.arrivals+" shots reached   ·   "+c.recoveries+" recovered";
        v.record=c.points+" / "+(c.shots.length*100)+" points";v.primary="Play again";
      } else {
        const demo=c.phase==="demo", guided=c.guided;
        v.kicker+="   /   "+(demo?"DEMO":guided?"GUIDED":"READ THE SHOT");
        v.title=demo || guided || c.phase==="recover" ? ZONE_NAMES[c.target] : "Read the shuttle";
        v.detail=c.phase==="recover"?"Return to the centre ring.":demo?"Watch the shot, then its recovery.":this.mouse?"Follow the opponent’s shuttle.":"Shuffle to the matching ring beside you.";
        v.record=c.points+" PTS   ·   "+(c.index+1)+"/"+c.shots.length+"   ·   "+c.feedback;
        v.primary="Pause";
      }
    } else {
      const d=this.dance, level=DANCE_LEVELS[this.levelIndex];
      const pace=d.phase==="practice"?"SELF-PACED":level.name.toUpperCase()+" · "+level.bpm+" / MIN";
      v.kicker="DANCE TRAIL   /   "+source+"   /   "+pace;
      v.record=d.feedback || "Side · home · side · home, then two diagonals";
      if(d.phase==="intro") {
        v.title="Learn the eight-count"; v.detail=this.mouse?"Start Game to follow the lit rings on the beat, or Watch demo to learn.":"Start Game to step on the beat, or Watch demo to learn.";
        v.record=level.name+"   ·   "+d.beatSeconds.toFixed(2)+" s per count   ·   Tap Pace to change";
        v.primary="Start Game";v.auxiliary="Pace ›";
      } else if(d.phase==="ready") {
        v.title="Ready for music";v.detail="Four counts in, then repeat the eight steps.";v.primary="Play phrase";
      } else if(d.phase==="results") {
        v.title="Phrase complete";v.detail=d.hits+" / 8 counts landed";v.record=d.points+" / 800 points   ·   "+d.feedback;v.primary="Play again";
      } else if(d.phase==="countIn") {
        v.title="Count in   "+Math.min(4,1+Math.floor(d.time/d.beatSeconds))+" / 4";
        v.detail="First move is left.";v.primary="Pause";
      } else {
        const name=d.phase==="demo"?"WATCH":d.phase==="practice"?"PRACTICE":"ON THE BEAT";
        v.kicker+="   /   "+name;v.title=(d.shownIndex+1)+"   ·   "+ZONE_NAMES[d.shownTarget];
        v.detail=d.phase==="demo"?"Watch the coach’s feet and the highlighted ring.":d.phase==="practice"?
          (this.mouse?"Click each lit ring to learn the phrase.":"Enter each lit zone to learn the phrase."):
          d.time < (COUNT_IN+d.shownIndex)*d.beatSeconds+d.window?"NOW   ·   land on the count":"Prepare for the next count";
        v.record=d.points+" PTS   ·   "+(d.feedback || "Phrase 1–4, then 5–8");v.primary="Pause";
      }
    }
    if(global.deviceInfoSystem.isEditor() && this.isIntro())v.input=this.mouse?"Mouse":"Tracked";
    if(this.paused) {
      v.title="Paused";v.detail=this.pauseReason+(this.mouse?"":" · Return to centre");
      v.primary="Resume";v.auxiliary="Restart";v.input="";v.demo=false;
    }
    const key=JSON.stringify(v);
    if(key!==this.previousView) {
      this.previousView=key; this.consoleUI.showLesson(v);
      print("[Workout Club] "+v.kicker+" | "+v.title+" | "+v.record);
    }
  }
}
