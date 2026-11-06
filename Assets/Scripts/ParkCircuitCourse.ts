import {Shapes, sole} from "./WorkoutGeometry";
import {FAR_PITCH, HIT_Z, NEAR_PITCH, Point, CHART, Cue, cueName, SPAWN_Z, STEP_Z, laneX} from "./ParkCircuitState";

const LANE_COLORS = [
  new vec4(0.17,0.93,1,1), new vec4(1,0.68,0.16,1),
  new vec4(0.87,0.38,1,1), new vec4(0.38,1,0.48,1)
];
const socketColor=(c:vec4)=>new vec4(c.x*0.50,c.y*0.50,c.z*0.50,1);
const ICE = new vec4(0.78,0.98,1,1);
const INK = new vec4(0.055,0.095,0.16,1);
const CAP_NEAR = HIT_Z+70, CAP_FAR = HIT_Z-72;
const LAND_HOLD = 0.12;
const PRINT_LAYER = 0.35;
const PAD_WIDTH = FAR_PITCH*0.92, PAD_DEPTH = 142;

function routeX(z:number):number {
  const u=Math.max(0,Math.min(1,(HIT_Z-z)/(HIT_Z-SPAWN_Z)));
  return 170*Math.sin(u*Math.PI*2)*u;
}

function keyOutline(x:number,z:number,w:number,d:number):number[][] {
  const a=w/2,b=d/2,k=Math.min(a,b)*0.28;
  return [[x-a+k,z-b],[x+a-k,z-b],[x+a,z-b+k],[x+a,z+b-k],
          [x+a-k,z+b],[x-a+k,z+b],[x-a,z+b-k],[x-a,z-b+k]];
}
function outline(shape:Shapes,p:number[][],width:number,y:number) {
  p.forEach((v,i)=>{const n=p[(i+1)%p.length];shape.stripe(v[0],v[1],n[0],n[1],width,y);});
}
// Both the travelling tile and its floor receiver use this exact outline, sole and lane code.
function footprint(pad:Shapes,mark:Shapes,x:number,z:number,lane:number):number[][] {
  const cap=keyOutline(x,z,PAD_WIDTH,PAD_DEPTH);
  outline(pad,cap,3.5,1.8);
  sole(mark,x,z+3,41,lane<2?-1:1,2.1);
  for(let i=0;i<=lane;i++){
    const px=x+(i-lane/2)*8;
    mark.stripe(px-2.5,z+52,px+2.5,z+52,5,2.1);
  }
  return cap;
}

// The front face of an incoming cue faces +Z, towards the wearer.
function stroke(s:Shapes,points:number[][],width:number,z=1){
  for(let i=1;i<points.length;i++)s.line(new vec3(points[i-1][0],points[i-1][1],z),new vec3(points[i][0],points[i][1],z),width);
}
function ring(s:Shapes,x:number,y:number,r:number,width:number){
  const points:number[][]=[];
  for(let i=0;i<=16;i++)points.push([x+Math.cos(i*Math.PI/8)*r,y+Math.sin(i*Math.PI/8)*r]);
  stroke(s,points,width);
}
function front(s:Shapes,points:number[][],z=0){
  s.face(points.map(p=>new vec3(p[0],p[1],z)),new vec3(0,0,1));
}
function palm(s:Shapes,x:number,sign:number){
  const p=(u:number,v:number)=>[x+sign*u,v];
  front(s,[p(-5,-7),p(6,-7),p(8,2),p(4,7),p(-5,5)]);
  for(let j=0;j<4;j++)stroke(s,[p(-4+j*3,4),p(-4+j*3,10+(j===1?3:0))],2.3);
  stroke(s,[p(5,-1),p(10,4)],2.8);
}

function icon(c:Cue):{shape:Shapes;detail:Shapes;color:vec4;ink:vec4}{
  const shape=new Shapes(),detail=new Shapes();
  let color=new vec4(1,0.31,0.38,1),ink=ICE;
  switch(c.kind){
    case "step":
      footprint(shape,detail,0,0,c.lane);
      color=LANE_COLORS[c.lane];ink=ICE;break;
    case "punch":
      color=c.side==="left"?new vec4(1,0.27,0.22,1):new vec4(0.17,0.73,1,1);
      ring(shape,0,0,17,3.6);ring(detail,0,0,12.8,1.6);
      // Four knuckles on an upright boxing glove, with a separate cuff.
      front(shape,[[-7,-2],[-8,4],[-6,8],[-3,7],[0,9],[3,7],[6,8],[8,4],[7,0],[5,-5],[-5,-5]],2);
      front(detail,[[-5,-8],[5,-8],[5,-5.8],[-5,-5.8]],2);break;
    case "clap":
      color=new vec4(1,0.65,0.08,1);
      palm(shape,-11,1);palm(detail,11,-1);
      stroke(shape,[[-6,15],[-2,19]],2);stroke(detail,[[6,15],[2,19]],2);
      stroke(shape,[[-19,-12],[-12,-15],[-5,-13]],1.8);
      stroke(detail,[[19,-12],[12,-15],[5,-13]],1.8);break;
    case "raise":
      color=c.side==="left"?new vec4(1,0.25,0.57,1):new vec4(0.30,1,0.60,1);
      palm(shape,0,c.side==="left"?1:-1);
      stroke(detail,[[-9,17],[0,25],[9,17]],3);
      stroke(detail,[[-7,23],[0,29],[7,23]],1.7);break;
    case "jump":
      color=new vec4(1,0.56,0.10,1);
      stroke(shape,[[-88,1],[-88,28],[88,28],[88,1]],5.5);
      for(let x=-68;x<75;x+=20)stroke(detail,[[x-4,25],[x+4,31]],3.4);
      for(const x of [-38,0,38])stroke(shape,[[x-8,37],[x,46],[x+8,37]],3);
      // The low rail leaves the near field first. Its floating jump sign stays in the forward view.
      for(let y=51;y<122;y+=16)stroke(detail,[[0,y],[0,y+5]],1.8);
      stroke(shape,[[-15,140],[0,155],[15,140],[0,125],[-15,140]],2.7);
      stroke(detail,[[-6,139],[0,146],[6,139]],2.3);
      stroke(detail,[[0,134],[0,145]],2.3);
      break;
    case "duck":
      color=new vec4(1,0.16,0.35,1);
      stroke(shape,[[-95,0],[95,0],[95,14],[-95,14],[-95,0]],3.2);
      for(let x=-88;x<=83;x+=18)stroke(detail,[[x,2],[x+8,12]],3.6,2.8);
      for(const x of [-47,0,47])stroke(shape,[[x-7,-9],[x,-17],[x+7,-9]],3.3);
      break;
    case "steady":{
      color=new vec4(0.12,0.42,0.54,1);ink=new vec4(0.53,1,0.28,1);
      // Open goalpost silhouette and sparse edge rails leave the real scene visible.
      const edge=[[30,0],[27,62],[21,92],[26,125],[44,120],[51,129],[49,171],
        [42,177],[34,172],[34,146],[22,148],[13,151],[16,164],[14,178],[8,186],[0,188]];
      for(const sign of [-1,1]){
        stroke(shape,[[sign*94,0],[sign*94,201],[0,201]],3.5);
        stroke(detail,edge.map(p=>[sign*p[0],p[1]]),3.3,2);
        stroke(detail,[[sign*91,9],[sign*91,66]],2.3,2);
        stroke(detail,[[sign*91,144],[sign*91,194],[sign*73,194]],2.3,2);
      }
      // A small matching goalpost-figure badge stays visible inside the panel.
      ring(detail,68,154,4.5,2);
      stroke(detail,[[68,148],[68,136],[63,129]],2);
      stroke(detail,[[68,136],[73,129]],2);
      stroke(detail,[[58,153],[58,144],[65,146],[71,146],[78,144],[78,153]],2);
      break;
    }
  }
  return {shape,detail,color,ink};
}

@component
export class ParkCircuitCourse extends BaseScriptComponent {
  @input markers:SceneObject;
  @input material:Material;
  @input @widget(new ColorWidget()) activeColor:vec4=new vec4(0.65,1,0.15,1);
  @input @widget(new ColorWidget()) idleColor:vec4=new vec4(0.1,0.65,0.7,1);
  private pads:RenderMeshVisual[]=[];
  private notes:SceneObject[]=[];
  private eye=170;
  private gradeBadge:SceneObject;
  private check:SceneObject;
  private cross:SceneObject;
  private pickShapes:Shapes[][]=[];
  private mouseBadges:(SceneObject|null)[]=[];
  private lastLit=-1;

  private child(parent:SceneObject,name:string):SceneObject {
    const obj=global.scene.createSceneObject(name);
    obj.setParent(parent);
    return obj;
  }
  private draw(parent:SceneObject,name:string,mesh:RenderMesh,color:vec4):RenderMeshVisual {
    const visual=this.child(parent,name).createComponent("Component.RenderMeshVisual") as RenderMeshVisual;
    visual.mesh=mesh; visual.mainMaterial=this.material.clone(); visual.mainPass.baseColor=color;
    return visual;
  }
  initialize() {
    this.makePads();
    this.makeRunway();
    this.makeGradeBadge();
    const deck=new Shapes();
    deck.floor(keyOutline(0,0,PAD_WIDTH,PAD_DEPTH),1);
    const footSurface=deck.mesh();
    const cache:{[id:string]:{face:RenderMesh; detail:RenderMesh; color:vec4; ink:vec4; shapes:Shapes[]}}={};
    CHART.forEach((c,i)=>{
      const name=cueName(c);
      if(!cache[name]){
        const g=icon(c);
        cache[name]={face:g.shape.mesh(),detail:g.detail.mesh(),color:g.color,ink:g.ink,shapes:[g.shape,g.detail]};
      }
      const g=cache[name],obj=this.child(this.markers,"Cue "+(i+1)+" • "+name);
      if(c.kind==="step"){
        const tint=LANE_COLORS[c.lane];
        this.draw(obj,"Tile inlay",footSurface,new vec4(tint.x*0.38,tint.y*0.38,tint.z*0.38,1));
      }
      this.draw(obj,"Silhouette",g.face,g.color);
      this.draw(obj,"Symbol",g.detail,g.ink);
      this.pickShapes.push(c.kind==="step"?[deck,...g.shapes]:[...g.shapes]);
      this.mouseBadges.push(null);
      if(global.deviceInfoSystem.isEditor()){
        if(c.kind==="steady"){
          const badge=this.child(obj,"Mouse pose badge"),surface=new Shapes(),edge=new Shapes();
          const outline=[[57,125],[79,125],[84,130],[84,162],[79,167],[57,167],[52,162],[52,130]];
          front(surface,outline,-1);
          stroke(edge,[...outline,outline[0]],1.4,0);
          this.draw(badge,"Pose click surface",surface.mesh(),new vec4(0.035,0.10,0.12,1));
          this.draw(badge,"Pose click outline",edge.mesh(),new vec4(0.53,1,0.28,1));
          this.pickShapes[i].push(surface,edge);this.mouseBadges[i]=badge;badge.enabled=false;
        }
        // A solid point on each icon, useful to align a desktop pointer with its visible geometry.
        const points={
          step:new vec3(0,1,0),punch:new vec3(0,3,2),clap:new vec3(-11,0,0),
          raise:new vec3(0,0,0),jump:new vec3(0,140,1),duck:new vec3(0,0,1),steady:new vec3(68,142,1)
        };
        this.child(obj,"Mouse target "+(i+1)).getTransform().setLocalPosition(points[c.kind]);
      }
      obj.enabled=false;this.notes.push(obj);
    });
  }
  private makeGradeBadge(){
    this.gradeBadge=this.child(this.markers,"Landing feedback");
    this.gradeBadge.getTransform().setLocalPosition(new vec3(-FAR_PITCH*2-25,42,HIT_Z+12));
    const back=new Shapes(),surround=new Shapes(),hit=new Shapes(),miss=new Shapes();
    const octagon:number[][]=[];
    for(let i=0;i<8;i++){const a=(i+0.5)*Math.PI/4;octagon.push([19*Math.cos(a),19*Math.sin(a)]);}
    front(back,octagon);
    ring(surround,0,0,17.2,1.4);
    stroke(hit,[[-11,0],[-4,-7],[11,9]],4.8,3);
    stroke(miss,[[-8,-8],[8,8]],4.5,3);stroke(miss,[[-8,8],[8,-8]],4.5,3);
    this.draw(this.gradeBadge,"Badge backing",back.mesh(),INK);
    this.draw(this.gradeBadge,"Badge rim",surround.mesh(),ICE);
    this.check=this.draw(this.gradeBadge,"Hit check",hit.mesh(),new vec4(0.52,1,0.17,1)).sceneObject;
    this.cross=this.draw(this.gradeBadge,"Miss cross",miss.mesh(),new vec4(1,0.29,0.33,1)).sceneObject;
    this.gradeBadge.enabled=false;
  }
  showGrade(points:number,age:number,visible:boolean){
    this.gradeBadge.enabled=visible && age>=0 && age<0.45;
    if(!this.gradeBadge.enabled)return;
    this.check.enabled=points>0;this.cross.enabled=points===0;
    const size=1+0.12*Math.max(0,1-age/0.16);
    this.gradeBadge.getTransform().setLocalScale(new vec3(size,size,size));
  }
  private makePads() {
    const markings=new Shapes(), socketMarks=new Shapes(), plates=new Shapes();
    for(let lane=0;lane<4;lane++) {
      const pad=new Shapes();
      const x=laneX(lane,FAR_PITCH), near=laneX(lane,NEAR_PITCH), footSide=lane<2?-1:1;
      const cap=footprint(pad,socketMarks,x,HIT_Z,lane);
      plates.floor(cap,1);
      for(const side of [-1,1]) {
        const a=near+side*NEAR_PITCH*0.46, b=x+side*FAR_PITCH*0.46;
        pad.stripe(a,-4,a,-85,1.2);
        pad.stripe(a,-85,b,CAP_NEAR,1.5);
      }
      pad.stripe(near-17,-4,near+17,-4,2);
      sole(markings,near,STEP_Z,15,footSide,1.7);
      this.pads.push(this.draw(this.markers,"Landing box "+(lane+1),pad.mesh(),socketColor(LANE_COLORS[lane])));
    }
    this.draw(this.markers,"Landing surfaces",plates.mesh(),INK);
    this.draw(this.markers,"Near stance marks",markings.mesh(),ICE);
    this.draw(this.markers,"Receiving sole and pips",socketMarks.mesh(),new vec4(0.21,0.30,0.34,1));
  }
  private makeRunway() {
    const guides=new Shapes();
    const spacing=139,start=CAP_FAR-23;
    for(let i=0;i<13;i++){
      const z=start-spacing*i,x=routeX(z),nextZ=z-spacing,nextX=routeX(nextZ);
      for(let lane=0;lane<5;lane++){
        const offset=(lane-2)*FAR_PITCH;
        guides.stripe(x+offset,z,nextX+offset,nextZ,2.4);
      }
      for(let lane=0;lane<4;lane++){
        const mid=x+laneX(lane,FAR_PITCH);
        guides.stripe(mid-7,z-26,mid,z-20,2);guides.stripe(mid,z-20,mid+7,z-26,2);
      }
    }
    this.draw(this.markers,"Runway floor lines",guides.mesh(),new vec4(0.28,0.55,0.62,1));
  }
  hitCue(index:number,worldOrigin:vec3,worldTarget:vec3):boolean {
    const obj=this.notes[index];
    if(!obj || !obj.enabled)return false;
    const inverse=obj.getTransform().getInvertedWorldTransform();
    const origin=inverse.multiplyPoint(worldOrigin),direction=inverse.multiplyPoint(worldTarget).sub(origin);
    return this.pickShapes[index].some(shape=>Number.isFinite(shape.hit(origin,direction)));
  }
  setFootprint(scale:number,angle:number,eyeHeight:number) {
    this.eye=eyeHeight;
    const transform=this.markers.getTransform();
    transform.setLocalScale(new vec3(scale,1,eyeHeight/170));
    transform.setLocalRotation(quat.angleAxis(angle*Math.PI/180,vec3.up()));
  }
  zonePosition(world:vec3):Point {
    const p=this.markers.getTransform().getInvertedWorldTransform().multiplyPoint(world);
    return {x:p.x,z:p.z};
  }
  show(clock:number,firstBeat:number,interval:number,flight:number,visible:boolean,simulation:boolean,resolvedBefore=0) {
    let lit=-1;
    CHART.forEach((c,i)=>{
      const remaining=firstBeat+i*interval-clock;
      const foot=c.kind==="step",tail=simulation?0.45:foot?LAND_HOLD:0.20;
      const obj=this.notes[i];
      if(this.mouseBadges[i])this.mouseBadges[i].enabled=simulation;
      obj.enabled=visible && (!simulation || i>=resolvedBefore) && remaining<=flight && remaining>=-tail;
      if(!obj.enabled)return;
      const u=remaining/flight,travel=Math.max(0,u);
      const strike=foot?HIT_Z:c.kind==="punch" || c.kind==="clap" || c.kind==="raise"?-75:0;
      const projectedZ=strike+(SPAWN_Z-strike)*u;
      const z=simulation && !foot?Math.min(projectedZ,strike===0?-210:-130):projectedZ;
      const scale=foot?1:1+travel*(strike===0?0.2:2.4);
      const tr=obj.getTransform();
      if(foot){
        const floorZ=Math.min(HIT_Z,z);
        tr.setLocalPosition(new vec3(laneX(c.lane,FAR_PITCH)+routeX(floorZ),PRINT_LAYER,floorZ));
        if(remaining<=0.16)lit=c.lane;
      }else{
        const side=c.side==="left"?-1:c.side==="right"?1:0;
        const x=side*(27+travel*44)+routeX(z);
        let y=c.kind==="punch"?this.eye-18:c.kind==="raise"?this.eye-3:c.kind==="clap"?this.eye-23:0;
        if(c.kind==="duck")y=this.eye-15;
        tr.setLocalPosition(new vec3(x,y,z));
      }
      tr.setLocalScale(new vec3(scale,(c.kind==="steady" || c.kind==="jump")?scale*this.eye/170:scale,scale));
    });
    if(lit!==this.lastLit) {
      if(this.lastLit>=0)this.pads[this.lastLit].mainPass.baseColor=socketColor(LANE_COLORS[this.lastLit]);
      if(lit>=0)this.pads[lit].mainPass.baseColor=new vec4(1,1,1,1);
      this.lastLit=lit;
    }
  }
}
