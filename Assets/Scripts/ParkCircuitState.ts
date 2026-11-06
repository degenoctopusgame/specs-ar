// All distances are course-local centimetres. Lanes are numbered left to right.
export type Point = {x:number; z:number};
export type Phase = "place" | "play" | "paused" | "results";
export const LANE_NAMES = ["Outer left", "Inner left", "Inner right", "Outer right"];
export type Side = "left" | "right";
export type Action = "step" | "punch" | "clap" | "raise" | "jump" | "duck" | "steady";
export type Cue = {kind:Action; side?:Side; lane?:number};
export type Grade = {index:number; label:string; points:number; at:number};
export type Wrist = {x:number; y:number; z:number};
export type BodyFrame = {point:Point; height:number; left:Wrist|null; right:Wrist|null};
export type PreviewClickResult = "hit" | "early" | "late" | "ignored";
export const CHART:Cue[] = [
  {kind:"step",lane:1},{kind:"punch",side:"left"},{kind:"step",lane:2},{kind:"punch",side:"right"},
  {kind:"clap"},{kind:"jump"},{kind:"step",lane:0},{kind:"raise",side:"left"},
  {kind:"duck"},{kind:"step",lane:3},{kind:"steady"},{kind:"raise",side:"right"},
  {kind:"punch",side:"left"},{kind:"step",lane:2},{kind:"clap"},{kind:"punch",side:"right"},
  {kind:"jump"},{kind:"step",lane:0},{kind:"duck"},{kind:"steady"}
];
export function cueName(c:Cue):string {
  switch(c.kind){
    case "step":return LANE_NAMES[c.lane]+" step";
    case "punch":return c.side==="left"?"Left punch":"Right punch";
    case "raise":return c.side==="left"?"Raise left":"Raise right";
    case "clap":return "Clap";
    case "jump":return "Jump hurdle";
    case "duck":return "Duck beam";
    case "steady":return "Hold pose";
  }
}
export const WINDOW = 0.45;
export const FIRST_BEAT = 4.0;
export const RELAXED_INTERVAL = 2.0, STEADY_INTERVAL = 1.5;
export const HIT_Z = -715;
export const SPAWN_Z = -2520;
export const NEAR_PITCH = 37;
export const FAR_PITCH = 79;
export const STEP_Z = -27;

export function laneX(lane:number, pitch:number):number {
  return (lane - 1.5) * pitch;
}

// Matches the two straight sections of each continuous floor pad.
export function padLane(p:Point):number {
  if (p.z > -4 || p.z < HIT_Z - 72) return -1;
  const spread = Math.min(1, Math.max(0, (-p.z - 85) / (-HIT_Z - 85 - 70)));
  const pitch = NEAR_PITCH + (FAR_PITCH - NEAR_PITCH) * spread;
  const lane = Math.floor(p.x / pitch + 2);
  return lane >= 0 && lane < 4 && Math.abs(p.x - laneX(lane,pitch)) <= pitch * 0.46 ? lane : -1;
}

// Editor input generates centimetre samples. The scorer sees the same frame shape on Specs.
export function simulatedBody(cue:Cue|null, age:number):BodyFrame {
  const f:BodyFrame={point:{x:0,z:0},height:0,left:{x:-22,y:-27,z:-27},right:{x:22,y:-27,z:-27}};
  if(!cue || age<0 || age>1.05)return f;
  const end=cue.kind==="steady"?0.85:cue.kind==="duck"?0.63:0.34;
  const v=Math.max(0,Math.min(1,age/0.12,(end+0.18-age)/0.18));
  switch(cue.kind){
    case "step":f.point={x:laneX(cue.lane,NEAR_PITCH)*v,z:STEP_Z*v};break;
    case "punch":f[cue.side].z-=31*v;break;
    case "raise":f[cue.side].y+=40*v;break;
    case "clap":f.left.x+=19*v;f.right.x-=19*v;break;
    case "jump":f.height=16*v;break;
    case "duck":f.height=-29*v;break;
    case "steady":
      for(const side of ["left","right"] as Side[]){
        f[side].x+=(side==="left"?-10:10)*v;
        f[side].y+=23*v;
      }
      break;
  }
  return f;
}

const SIDES:Side[]=["left","right"];
const distance=(a:Wrist,b:Wrist)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export class ParkCircuitState {
  phase:Phase="place";
  elapsed=0; index=0; successes=0; missed=0; score=0; combo=0; bestCombo=0;
  timingTotal=0; timedHits=0; revision=0; reason="";
  grade:Grade|null=null;
  private previous:BodyFrame|null=null;
  private occupied=-1;
  private enteredAt=-100;
  private outsideTime=0;
  private punchArmed={left:false,right:false};
  private raiseArmed={left:false,right:false};
  private clapArmed=false;
  private jumpArmed=false;
  private eventAt=-100;
  private holdSince=-1;
  private holdOrigin:BodyFrame|null=null;

  constructor(public flightSeconds:number,public interval=RELAXED_INTERVAL) {}
  get lastResult():string {return this.grade?.label || "";}
  get resultTime():number {return this.grade?.at ?? -10;}
  get round():number {return Math.min(3,1+Math.floor(this.index/7));}
  get cue():Cue|null {return CHART[this.index]||null;}
  beat(index:number):number {return FIRST_BEAT+index*this.interval;}
  start(){if(this.phase==="place"){this.phase="play";this.revision++;}}
  // Desktop rehearsal grades the click itself. The caller must guard this with isEditor().
  // Tracked play continues through update()/motions()/hold(), including sustained holds.
  previewClick(index:number,clock:number):PreviewClickResult {
    if(this.phase!=="play" || index!==this.index || !Number.isFinite(clock) || clock<this.elapsed-0.05)return "ignored";
    const error=clock-this.beat(index);
    if(error < -WINDOW-0.000001)return "early";
    if(error > WINDOW+0.000001)return "late";
    this.elapsed=Math.max(this.elapsed,clock);
    const timing=Math.abs(error),perfect=timing<0.15;
    this.successes++;this.combo++;this.bestCombo=Math.max(this.combo,this.bestCombo);
    this.timingTotal+=timing;this.timedHits++;
    this.finish(perfect?"Perfect":"On beat",perfect?100:70);
    return "hit";
  }
  pause(reason="Paused"){
    if(this.phase!=="play")return;
    this.reason=reason;this.phase="paused";this.revision++;
  }
  resume(p:Point):boolean {
    if(this.phase!=="paused" || !Number.isFinite(p.x) || !Number.isFinite(p.z) || Math.hypot(p.x,p.z)>23)return false;
    this.previous=null;this.occupied=-1;this.enteredAt=-100;this.eventAt=-100;this.holdSince=-1;
    this.punchArmed={left:false,right:false};this.raiseArmed={left:false,right:false};
    this.jumpArmed=false;this.clapArmed=false;this.outsideTime=0;this.reason="";
    this.phase="play";this.revision++;return true;
  }
  private event(kind:Action,side?:Side) {
    if(this.cue.kind===kind && this.cue.side===side)this.eventAt=this.elapsed;
  }
  private motions(f:BodyFrame,dt:number) {
    const prev=this.previous;
    for(const side of SIDES){
      const w=f[side],old=prev && prev[side];
      if(!w){this.punchArmed[side]=false;this.raiseArmed[side]=false;continue;}
      if(w.z>=-34)this.punchArmed[side]=true;
      if(w.y<=-15)this.raiseArmed[side]=true;
      if(!old)continue;
      if(this.punchArmed[side] && w.z<=-44 && w.y<1 && (old.z-w.z)/dt>=45){
        this.punchArmed[side]=false;this.event("punch",side);
      }
      if(this.raiseArmed[side] && w.y>=0 && (w.y-old.y)/dt>=25){
        this.raiseArmed[side]=false;this.event("raise",side);
      }
    }
    if(f.left && f.right){
      const gap=distance(f.left,f.right);
      if(gap>=32)this.clapArmed=true;
      if(this.clapArmed && gap<=15 && prev && prev.left && prev.right &&
         (distance(prev.left,prev.right)-gap)/dt>=38){
        this.clapArmed=false;this.event("clap");
      }
    }else this.clapArmed=false;
    if(f.height<4)this.jumpArmed=true;
    if(this.jumpArmed && f.height>=10 && prev && (f.height-prev.height)/dt>=30){
      this.jumpArmed=false;this.event("jump");
    }
  }
  private hold(f:BodyFrame,due:number):boolean {
    const wall=this.cue.kind==="steady";
    const pre=wall?0.32:0.16,post=wall?0.10:0.06;
    if(this.elapsed<due-pre-0.20)return false;
    const wristsUp=(w:Wrist|null,sign:number)=>w && w.x*sign>=17 && w.x*sign<=62 && w.y>=-14 && w.y<=14 && w.z<=-8 && w.z>=-61;
    const correct=wall ? Math.abs(f.height)<9 && Math.hypot(f.point.x,f.point.z)<22 &&
      wristsUp(f.left,-1) && wristsUp(f.right,1) : f.height<=-18;
    if(!correct){this.holdSince=-1;this.holdOrigin=null;return false;}
    // Limit drift relative to the start of the hold, including each tracked wrist.
    const o=this.holdOrigin;
    if(wall && o && (Math.hypot(f.point.x-o.point.x,f.point.z-o.point.z,f.height-o.height)>6 ||
       distance(f.left,o.left)>8 || distance(f.right,o.right)>8))this.holdSince=-1;
    if(this.holdSince<0){this.holdSince=this.elapsed;this.holdOrigin=f;}
    return this.holdSince<=due-pre && this.elapsed>=due+post;
  }
  update(clock:number,dt:number,f:BodyFrame,tracked=true,checkPoseJump=true) {
    if(this.phase!=="play")return;
    const p=f.point,old=this.previous;
    if(!tracked || !Number.isFinite(p.x+p.z+f.height)){this.pause("Tracking lost");return;}
    if(checkPoseJump && (dt>0.5 || (old && Math.hypot(p.x-old.point.x,p.z-old.point.z,f.height-old.height)>80))){
      this.pause("Tracking jumped");return;
    }
    if(dt>0.5){this.holdSince=-1;this.holdOrigin=null;}
    const outside=Math.abs(p.x)>110 || p.z < -110 || p.z>65;
    this.outsideTime=outside?this.outsideTime+dt:0;
    if(this.outsideTime>0.25){this.pause("Outside practice area");return;}
    if(!Number.isFinite(clock) || clock<this.elapsed-0.05){this.pause("Music clock interrupted");return;}
    this.elapsed=Math.max(this.elapsed,clock);
    const lane=outside?-1:padLane(p);
    if(lane!==this.occupied){this.occupied=lane;this.enteredAt=this.elapsed;}
    this.motions(f,Math.max(dt,0.001));
    this.previous=f;
    const due=this.beat(this.index), kind=this.cue.kind;
    const sustained=kind==="steady" || kind==="duck";
    const held=sustained && this.hold(f,due);
    if(this.elapsed<due)return;
    const eventTime=kind==="step"?(lane===this.cue.lane?this.enteredAt:-100):this.eventAt;
    const err=Math.abs(eventTime-due);
    if(this.elapsed<=due+WINDOW && (held || (!sustained && err<=WINDOW))){
      const perfect=held || err<0.15;
      this.successes++;this.combo++;this.bestCombo=Math.max(this.combo,this.bestCombo);
      if(!sustained){this.timingTotal+=err;this.timedHits++;}
      this.finish(held?"Cleared":perfect?"Perfect":"On beat",perfect?100:70);
    }else if(this.elapsed>due+WINDOW){
      this.missed++;this.combo=0;this.finish("Miss",0);
    }
  }
  private finish(label:string,points:number) {
    this.grade={index:this.index,label,points,at:this.elapsed};this.score+=points;
    this.index++;this.revision++;
    this.holdSince=-1;this.holdOrigin=null;this.eventAt=-100;
    if(this.index===CHART.length)this.phase="results";
  }
}
