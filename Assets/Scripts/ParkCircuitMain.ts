import {HandInputData} from "SpectaclesInteractionKit.lspkg/Providers/HandInputData/HandInputData";
import {ParkCircuitCoachUI} from "./ParkCircuitCoachUI";
import {ParkCircuitCourse} from "./ParkCircuitCourse";
import {BodyFrame, CHART, FIRST_BEAT, ParkCircuitState, RELAXED_INTERVAL, STEADY_INTERVAL, Side, Wrist, WINDOW, cueName, simulatedBody} from "./ParkCircuitState";
import {canClickCue} from "./ParkCircuitTargets";
import {runParkCircuitTests} from "./ParkCircuitStateTests";

const ANGLES=[0,15,-15];
const DIRECTIONS = {
  step:"Step into the matching floor pad.",
  punch:"Extend the matching hand from guard.",
  raise:"Lift that wrist above eye level.",
  clap:"Bring both hands together on the beat.",
  jump:"Rise as the low hurdle passes.",
  duck:"Lower your head until the beam clears.",
  steady:"Wrists beside face. Elbows out. Hold."
};

@component
export class ParkCircuitMain extends BaseScriptComponent {
  @input cameraObject:SceneObject;
  @input courseRoot:SceneObject;
  @input ui:ParkCircuitCoachUI;
  @input course:ParkCircuitCourse;
  @input @widget(new SliderWidget(120,210,5)) @hint("Manual eye-to-ground height in cm.") eyeHeightCm:number=170;
  @input @widget(new SliderWidget(4,10,1)) @hint("Time in seconds for a Relaxed note to travel the runway.") relaxedCueSeconds:number=8;
  @input @widget(new SliderWidget(0,1,0.05)) soundVolume:number=0.25;
  private state:ParkCircuitState;
  private camera:Camera;
  private click:AudioComponent;
  private success:AudioComponent;
  private miss:AudioComponent;
  private simulation=false;
  private compact=false;
  private steady=false;
  private angleIndex=0;
  private tracked=true;
  private ready=false;
  private workoutActive=false;
  private hands:HandInputData;
  private standingY=0;
  private song:AudioComponent;
  private body:BodyFrame=simulatedBody(null,-1);
  private hintUntil=0;
  private attempted=new Set<number>();
  private lastRevision=-1;
  private flashAt=-100;
  private mouseMessage="";
  private mouseMessageUntil=0;

  onAwake(){
    this.createEvent("OnStartEvent").bind(()=>this.start());
    this.createEvent("UpdateEvent").bind(()=>this.update());
    this.createEvent("TouchStartEvent").bind(ev=>this.tapPreview(ev.getTouchPosition()));
  }
  private newState(){ return new ParkCircuitState(this.steady?5:Math.max(4,Math.min(10,this.relaxedCueSeconds)),this.steady?STEADY_INTERVAL:RELAXED_INTERVAL); }
  private master():AudioTrackAsset {
    // Each pace has its twenty prompts mixed at their exact sample positions in the music.
    return (this.steady?requireAsset("../GeneratedSFX/ParkCircuitSteady.wav"):
      requireAsset("../GeneratedSFX/ParkCircuitRelaxed.wav")) as AudioTrackAsset;
  }
  private resetChart(){
    this.state=this.newState();this.attempted.clear();this.mouseMessage="";this.song.audioTrack=this.master();this.song.position=0;this.lastRevision=-1;
  }
  private start(){
    if(!this.cameraObject||!this.courseRoot||!this.ui||!this.course)throw new Error("Park Circuit scene references missing.");
    // Preview resets must remain mouse-testable. A deployed Lens always uses tracked movement.
    this.simulation=global.deviceInfoSystem.isEditor();
    print("[ParkCircuit tests] "+runParkCircuitTests()+" rhythm checks passed");
    this.camera=this.cameraObject.getComponent("Component.Camera");
    this.state=this.newState();
    this.hands=HandInputData.getInstance();
    this.course.initialize();
    this.song=this.audio(this.master());
    this.song.playbackMode=Audio.PlaybackMode.LowLatency;
    this.song.volume=Math.min(1,this.soundVolume*3.25);this.song.fadeOutTime=1.0;
    this.click=this.audio(requireAsset("../GeneratedSFX/ParkClick.wav") as AudioTrackAsset);
    this.success=this.sound(requireAsset("../GeneratedSFX/MoveHit.wav") as AudioTrackAsset,1.4);
    this.miss=this.sound(requireAsset("../GeneratedSFX/MoveMiss.wav") as AudioTrackAsset,1.5);
    const tracking=this.cameraObject.getComponent("Component.DeviceTracking") as DeviceTracking;
    if(tracking) {
      tracking.trackingStatus.onStopped.add(()=>{this.tracked=false;});
      tracking.trackingStatus.onStarted.add(()=>{this.tracked=true;});
    }
    this.ui.onPrimary.add(()=>this.primary());
    this.ui.onPause.add(()=>{
      if(this.state.phase==="paused")this.resume();else if(this.state.phase==="play"){this.state.pause();this.pauseAudio();}
    });
    this.ui.onReset.add(()=>this.reset());
    this.ui.onPace.add(()=>{
      if(this.state.phase==="place"){this.steady=!this.steady;this.resetChart();}
    });
    this.ui.onMode.add(()=>{
      if(global.deviceInfoSystem.isEditor() && this.state.phase==="place")this.simulation=!this.simulation;
    });
    this.ui.onResize.add(()=>{this.compact=!this.compact;this.configure();});
    this.ui.onRotate.add(()=>{this.angleIndex=(this.angleIndex+1)%ANGLES.length;this.configure();});
    this.ui.onHeight.add(()=>{this.eyeHeightCm=this.eyeHeightCm>=210?120:this.eyeHeightCm+5;this.place();});
    this.place();
    this.ready=true;
    this.setWorkoutActive(false);
  }
  get hasTracking(){return this.tracked;}
  anchorWorkout(){this.place();}
  adjustEyeHeight(delta:number){
    this.eyeHeightCm=Math.max(120,Math.min(210,this.eyeHeightCm+delta));
    this.place();
  }
  setWorkoutActive(active:boolean) {
    this.workoutActive=active;
    if(!this.ready)return;
    this.reset();
    this.course.markers.enabled=active;
    this.ui.sceneObject.enabled=active;
    if(active)this.render();
  }
  private audio(track:AudioTrackAsset){
    const a=this.sceneObject.createComponent("Component.AudioComponent") as AudioComponent;
    a.audioTrack=track;a.volume=this.soundVolume;a.mixToSnap=true;return a;
  }
  private sound(track:AudioTrackAsset,level:number){
    const shot=this.audio(track);shot.playbackMode=Audio.PlaybackMode.LowLatency;
    shot.volume=Math.min(1,this.soundVolume*level);return shot;
  }
  private quietShots(){
    for(const shot of [this.success,this.miss])if(shot.isPlaying())shot.stop(false);
  }
  private pauseAudio(){this.song.pause();this.quietShots();}
  private configure(){
    const degrees=ANGLES[this.angleIndex];
    const rotation=quat.angleAxis(degrees*Math.PI/180,vec3.up());
    this.course.setFootprint(this.compact?0.8:1,degrees,this.eyeHeightCm);
    const board=this.ui.sceneObject.getTransform();
    board.setLocalPosition(rotation.multiplyVec3(new vec3(0,this.eyeHeightCm+29,-165)));
    board.setLocalRotation(rotation);
  }
  private place(){
    const cam=this.cameraObject.getTransform(),p=cam.getWorldPosition();
    const root=this.courseRoot.getTransform();
    root.setWorldPosition(new vec3(p.x,p.y-this.eyeHeightCm,p.z));
    root.setWorldRotation(quat.angleAxis(Math.atan2(cam.forward.x,cam.forward.z),vec3.up()));
    this.configure();
  }
  private primary(){
    this.click.play(1);
    switch(this.state.phase){
      case "place":
        this.standingY=this.cameraObject.getTransform().getWorldPosition().y;
        this.state.start();this.song.play(1);break;
      case "paused":this.resume();break;
      case "results":this.reset();break;
      case "play":this.hintUntil=this.state.elapsed+3;break;
    }
  }
  private resume(){
    const f=this.sampleBody(this.state.elapsed);
    if((this.simulation||this.tracked) && this.state.resume(f.point)){
      this.song.position=this.state.elapsed;
      this.song.resume();
    }
  }
  private reset(){
    this.song.stop(false);this.quietShots();this.flashAt=-100;this.resetChart();this.hintUntil=0;
    this.place();
  }
  private sampleBody(clock:number):BodyFrame {
    if(this.simulation)return simulatedBody(null,-1);
    const head=this.cameraObject.getTransform().getWorldPosition();
    const localRotation=this.course.markers.getTransform().getWorldRotation().invert();
    const wrist=(side:Side):Wrist|null=>{
      const hand=this.hands.getHand(side);
      if(!hand.isTracked())return null;
      const local=localRotation.multiplyVec3(hand.wrist.position.sub(head));
      return {x:local.x,y:local.y,z:local.z};
    };
    return {point:this.course.zonePosition(head),height:head.y-this.standingY,left:wrist("left"),right:wrist("right")};
  }
  private tapPreview(screen:vec2) {
    if(!this.ready || !this.workoutActive || !global.deviceInfoSystem.isEditor() || !this.simulation || this.state.phase!=="play")return;
    const s=this.state,index=s.index,clock=this.song.position;
    const origin=this.cameraObject.getTransform().getWorldPosition();
    const target=this.camera.screenSpaceToWorldSpace(screen,100);
    if(this.ui.blocksCourseTap(origin,target))return;
    // Reconcile transforms with the audio clock even if input arrives between updates.
    this.course.show(clock,FIRST_BEAT,s.interval,s.flightSeconds,true,true,index);
    if(!this.course.hitCue(index,origin,target)){
      this.mouseHint("Click the current move’s coloured shape.",clock);return;
    }
    const result=s.previewClick(index,clock);
    if(result==="early")this.mouseHint("Too early. Retry when CLICK NOW appears.",clock);
    else if(result==="late")this.mouseHint("Too late. Get ready for the next move.",clock);
    else if(result==="hit"){
      this.attempted.add(index);this.mouseMessage="";this.mouseMessageUntil=0;
      this.flashAt=getTime();this.success.play(1);
      this.course.show(clock,FIRST_BEAT,s.interval,s.flightSeconds,s.phase==="play",true,s.index);
      if(s.phase==="results")this.song.stop(true);
      this.render();
    }
    print("[ParkCircuit click] "+JSON.stringify({index,cue:CHART[index].kind,at:clock,due:s.beat(index),result,score:s.score}));
  }
  private mouseHint(message:string,clock:number){
    this.mouseMessage=message;this.mouseMessageUntil=clock+0.9;this.render();
  }
  private update(){
    if(!this.ready || !this.workoutActive)return;
    const dt=getDeltaTime(),s=this.state;
    const wasPlaying=s.phase==="play";
    if(wasPlaying){
      const priorIndex=s.index,clock=this.song.position;
      this.body=this.sampleBody(clock);
      s.update(clock,dt,this.body,this.simulation||this.tracked,!this.simulation);
      if(s.index!==priorIndex){
        this.flashAt=getTime();
        if(s.elapsed-s.beat(s.grade.index)<=0.7)(s.grade.points>0?this.success:this.miss).play(1);
      }
    }
    if(wasPlaying && this.state.phase==="paused")this.pauseAudio();
    if(wasPlaying && this.state.phase==="results")this.song.stop(true);
    this.course.show(s.elapsed,FIRST_BEAT,s.interval,s.flightSeconds,s.phase==="play" || s.phase==="paused",this.simulation,s.index);
    this.course.showGrade(s.grade?.points ?? 0,getTime()-this.flashAt,s.phase==="play" || s.phase==="results");
    this.render();
    if(this.lastRevision!==s.revision){this.lastRevision=s.revision;print("[ParkCircuit] "+JSON.stringify(this.getSnapshot()));}
  }
  private render(){
    const s=this.state,setup=s.phase==="place";
    let status="PARK CIRCUIT",primary="Start Game";
    let instruction=this.simulation?"Mouse ready. Click approaching objects on beat.":"Stand tall. Match each cue to the beat.";
    let progress=(this.compact?"Compact":"Full size")+"  ·  "+ANGLES[this.angleIndex]+"°  ·  Eye "+this.eyeHeightCm+" cm";
    if(s.phase==="play"){
      const c=s.cue,remaining=s.beat(s.index)-s.elapsed;
      status=cueName(c).toUpperCase();
      if(!this.simulation)instruction=DIRECTIONS[c.kind];
      else {
        const target=c.kind==="step"?"footprint":c.kind==="jump"?"hurdle arrow":c.kind==="duck"?"beam":c.kind==="steady"?"pose badge":"hand";
        const clickable=canClickCue(remaining,this.attempted.has(s.index));
        instruction=clickable?"CLICK NOW · "+target:remaining>WINDOW?"Follow the "+target+" · "+remaining.toFixed(1)+" s":"Next move coming…";
        if(this.mouseMessage && this.mouseMessageUntil>s.elapsed && !clickable)instruction=this.mouseMessage;
        if(this.hintUntil>s.elapsed && !clickable)instruction="Click the moving "+target+" at CLICK NOW.";
      }
      const needsBoth=c.kind==="steady" || c.kind==="clap";
      if(!this.simulation && ((needsBoth && (!this.body.left || !this.body.right)) || (c.side && !this.body[c.side])))instruction="Bring "+(needsBoth?"both hands":"your "+c.side+" hand")+" into view.";
      if(remaining<0.45 && remaining>0 && !needsBoth && !this.simulation)instruction=DIRECTIONS[c.kind];
      progress="NEXT  "+(s.index+1)+" / "+CHART.length;
      primary="Show hint";
    }else if(s.phase==="paused"){
      status="TRACK PAUSED";instruction=s.reason+"  ·  Return to centre.";progress="Music paused";primary="Resume";
    }else if(s.phase==="results"){
      status="CIRCUIT COMPLETE";instruction=s.successes+" hits  ·  "+s.missed+" misses  ·  Best ×"+s.bestCombo;
      progress="FINAL  "+CHART.length+" / "+CHART.length;primary="Play again";
    }
    this.ui.setView({status,instruction,progress,primary,setup,score:s.score,streak:s.combo,grade:s.grade,paused:s.phase==="paused",results:s.phase==="results",simulation:this.simulation,pace:this.steady?"Steady":"Relaxed"});
  }
  getSnapshot(){
    const s=this.state,c=s.cue;
    return {phase:s.phase,round:s.round,index:s.index,target:c?.lane ?? -1,cue:c?.kind ?? null,side:c?.side ?? null,lane:c?.lane ?? -1,due:c?s.beat(s.index):null,
      successes:s.successes,missed:s.missed,elapsed:s.elapsed,songPosition:this.song.position,last:s.lastResult,lastMove:s.grade?cueName(CHART[s.grade.index]):null,lastPoints:s.grade?.points ?? null,
      pace:this.steady?"Steady":"Relaxed",master:this.song.audioTrack.name,score:s.score,combo:s.combo,bestCombo:s.bestCombo,
      simulation:this.simulation,attemptedCurrent:this.attempted.has(s.index),position:this.body.point,headHeight:this.body.height,leftTracked:!!this.body.left,rightTracked:!!this.body.right};
  }
}
