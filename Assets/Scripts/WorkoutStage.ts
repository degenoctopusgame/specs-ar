import {Shapes, sole} from "./WorkoutGeometry";
import {courtFlightProgress, COURT_STANCE_RADIUS, COURT_ZONES, DANCE_STANCE_RADIUS, DANCE_ZONES, POSITIONS, Zone} from "./WorkoutLessons";

const COURT_INK = new vec4(0.24, 0.87, 0.79, 1);
const DANCE_INK = new vec4(0.98, 0.44, 0.78, 1);
const ACTIVE = new vec4(1, 0.88, 0.25, 1);
const IVORY = new vec4(0.95, 1, 0.94, 1);
// A forward diagram mirrors the reachable pad layout beside the player.
const DIAGRAM: Record<Zone, [number, number]> = {
  base: [0, -635], left: [-115, -685], right: [115, -685],
  frontLeft: [-86, -858], frontRight: [86, -858],
  shortLeft: [-55, -754], shortRight: [55, -754], front: [0, -900]
};
function ellipse(s: Shapes, x: number, y: number, rx: number, ry: number, z: number, width: number) {
  let a = new vec3(x + rx, y, z);
  for (let i = 1; i <= 24; i++) {
    const angle = i * 2 * Math.PI / 24;
    const b = new vec3(x + rx * Math.cos(angle), y + ry * Math.sin(angle), z);
    s.line(a, b, width); a = b;
  }
}
function floorRing(s: Shapes, x: number, z: number, r: number, width: number, depth = r) {
  let px = x + r, pz = z;
  for (let i = 1; i <= 32; i++) {
    const a = i * Math.PI / 16, nx = x + r * Math.cos(a), nz = z + depth * Math.sin(a);
    s.stripe(px, pz, nx, nz, width, 0.6); px = nx; pz = nz;
  }
}
function front(s: Shapes, points: number[][]) {
  s.face(points.map(([x,y]) => new vec3(x,y,0)), new vec3(0,0,1));
}
function strokes(s: Shapes, points: number[][], width: number) {
  for (let i = 1; i < points.length; i++) {
    s.line(new vec3(points[i-1][0], points[i-1][1], 0), new vec3(points[i][0], points[i][1], 0), width);
  }
}
export class WorkoutStage {
  private readonly zones: Zone[];
  private readonly ringWidthRadius: number;
  private readonly ringDepthRadius: number;
  private markers = new Map<Zone, RenderMeshVisual>();
  private pads = new Map<Zone, RenderMeshVisual>();
  private rival: SceneObject;
  private racket: SceneObject;
  private shuttle: SceneObject;
  private guide: SceneObject;
  private dancerBody: SceneObject;
  private dancerLegs: SceneObject[][] = [];
  private highlighted: Zone | null = null;
  readonly ink: vec4;
  constructor(readonly root: SceneObject, private material: Material, readonly court: boolean) {
    this.ink = court ? COURT_INK : DANCE_INK;
    this.zones = court ? COURT_ZONES : DANCE_ZONES;
    this.ringWidthRadius = court ? 26 : 35;
    this.ringDepthRadius = court ? 36 : 48;
    this.makeFloor();
    if (court) this.makeOpponent(); else this.makeDanceGuide();
  }
  private node(name: string, parent = this.root) {
    const obj = global.scene.createSceneObject(name); obj.setParent(parent); return obj;
  }
  private draw(name: string, shape: Shapes, color: vec4, parent = this.root) {
    const obj = this.node(name, parent);
    const mesh = obj.createComponent("Component.RenderMeshVisual") as RenderMeshVisual;
    mesh.mesh = shape.mesh(); mesh.mainMaterial = this.material.clone(); mesh.mainPass.baseColor = color;
    return mesh;
  }
  private makeFloor() {
    const lines = new Shapes();
    if (this.court) {
      const left = -195, right = 195, near = -585, far = -1160;
      lines.stripe(left, near, right, near, 3); lines.stripe(left, far, right, far, 3);
      lines.stripe(left, near, left, far, 3); lines.stripe(right, near, right, far, 3);
      lines.stripe(left, -940, right, -940, 2); lines.stripe(0, -940, 0, far, 2);
      this.draw("Badminton court lines", lines, COURT_INK);
    } else {
      for (const zone of DANCE_ZONES.slice(1)) {
        const [x,z] = DIAGRAM[zone];
        lines.stripe(0, DIAGRAM.base[1], x, z, 2.5);
      }
      this.draw("Eight count floor trail", lines, DANCE_INK);
    }
    for (const zone of this.zones) {
      const [x,z] = DIAGRAM[zone];
      const ring = new Shapes(), mark = new Shapes(), real = new Shapes();
      floorRing(ring, 0, 0, this.ringWidthRadius, this.court ? 4 : 5, this.ringDepthRadius);
      const tile = this.draw((this.court ? "Court tile " : "Dance tile ") + zone, ring, this.ink);
      tile.sceneObject.getTransform().setLocalPosition(new vec3(x, 0, z));
      this.markers.set(zone, tile);
      if (zone === "base") floorRing(mark, 0, 0, 14, 6, 19);
      else if (!this.court) sole(mark, 0, 0, 30, x < 0 ? -1 : 1, 1.5);
      else {
        const [dx,dz] = POSITIONS[zone], len = Math.hypot(dx,dz), ux = dx/len, uz = dz/len;
        mark.stripe(-ux*17,-uz*17,ux*17,uz*17,5);
        for (const sign of [-1,1]) mark.stripe(ux*17,uz*17,-uz*11*sign,ux*11*sign,5);
      }
      this.draw("Zone symbol", mark, IVORY, tile.sceneObject);
      floorRing(real, POSITIONS[zone][0], POSITIONS[zone][1], this.court ? COURT_STANCE_RADIUS : DANCE_STANCE_RADIUS, 1.5);
      this.pads.set(zone, this.draw("Stance " + zone, real, this.ink));
    }
  }
  private makeOpponent() {
    this.rival = this.node("Badminton opponent");
    this.rival.getTransform().setLocalPosition(new vec3(0,0,-1050));
    const jersey = new Shapes(), body = new Shapes();
    front(jersey,[[-23,147],[22,147],[18,96],[-7,90],[-19,99]]);
    strokes(body,[[-12,96],[-29,57],[-44,15],[-54,12]],8);
    strokes(body,[[13,96],[40,60],[48,17],[61,15]],8);
    strokes(body,[[-19,139],[-45,119],[-55,134]],6);
    strokes(body,[[0,149],[1,157]],6); ellipse(body,0,170,12,14,0,5);
    strokes(body,[[-8,134],[8,134]],3);
    this.draw("Opponent jersey", jersey, COURT_INK, this.rival);
    this.draw("Opponent stance", body, IVORY, this.rival);
    this.racket = this.node("Opponent racket arm",this.rival);
    this.racket.getTransform().setLocalPosition(new vec3(19,141,3));
    const arm = new Shapes(), head = new Shapes();
    strokes(arm,[[0,0],[17,-8],[31,9],[45,29]],5);
    ellipse(head,52,42,10,16,0,3);
    for (const dx of [-5,0,5]) strokes(head,[[52+dx,31],[52+dx,53]],1.2);
    for (const dy of [-5,0,5]) strokes(head,[[45,42+dy],[59,42+dy]],1.2);
    this.draw("Racket handle",arm,IVORY,this.racket); this.draw("Racket strings",head,ACTIVE,this.racket);
    const bird = new Shapes();
    front(bird,[[-7,10],[7,10],[3,-4],[-3,-4]]);
    ellipse(bird,0,-5,3,3,0,2); strokes(bird,[[0,9],[0,-3]],1);
    this.shuttle = this.draw("Opponent shuttle",bird,ACTIVE).sceneObject;
    this.shuttle.enabled = false;
  }
  private makeDanceGuide() {
    this.guide = this.node("Dance step demonstrator");
    this.guide.getTransform().setLocalPosition(new vec3(0,0,-1000));
    this.dancerBody=this.node("Dance coach torso",this.guide);
    const upper=new Shapes(), shirt=new Shapes();
    front(shirt,[[-20,145],[20,145],[15,99],[-13,94],[-18,106]]);
    ellipse(upper,0,164,11,14,0,4);
    strokes(upper,[[0,145],[0,151]],5);
    strokes(upper,[[-17,138],[-36,120],[-52,135]],5);
    strokes(upper,[[18,138],[34,116],[45,127]],5);
    this.draw("Coach jersey",shirt,DANCE_INK,this.dancerBody);
    this.draw("Coach head and arms",upper,IVORY,this.dancerBody);
    for(const side of [-1,1]) {
      const bone=new Shapes(),shoe=new Shapes();
      bone.line(new vec3(0,0,0),new vec3(0,1,0),6);
      front(shoe,[[-10,1],[13,1],[14,5],[6,9],[-8,10],[-11,6]]);
      const thigh=this.draw("Coach thigh "+side,bone,DANCE_INK,this.guide).sceneObject;
      const shin=this.draw("Coach shin "+side,bone,IVORY,this.guide).sceneObject;
      const foot=this.draw("Coach shoe "+side,shoe,ACTIVE,this.guide).sceneObject;
      this.dancerLegs.push([thigh,shin,foot]);
    }
  }
  highlight(zone: Zone | null) {
    if (zone === this.highlighted) return;
    for (const key of this.zones) {
      const color = key === zone ? ACTIVE : this.ink;
      this.markers.get(key).mainPass.baseColor = color;
      this.pads.get(key).mainPass.baseColor = color;
    }
    this.highlighted = zone;
  }
  courtShot(zone: Zone | null, time: number, duration: number) {
    const flying = zone !== null && zone !== "base";
    this.shuttle.enabled = flying;
    const sign = flying && POSITIONS[zone][0] < 0 ? -1 : 1;
    this.rival.getTransform().setLocalScale(new vec3(sign,1,1));
    const u = courtFlightProgress(time, duration);
    this.racket.getTransform().setLocalRotation(quat.angleAxis(flying ? 0.8 * Math.cos(u*Math.PI) : 0, new vec3(0,0,1)));
    if (!flying) return;
    const [x,z] = DIAGRAM[zone];
    this.shuttle.getTransform().setLocalPosition(new vec3((70*sign)*(1-u)+x*u, (1-u)*175+Math.sin(u*Math.PI)*60+5, -1050*(1-u)+z*u));
  }
  danceStep(zone: Zone | null, beat: number, previous: Zone = "base") {
    this.guide.enabled = zone !== null;
    if (!zone) return;
    const [tx,tz]=POSITIONS[zone], [px,pz]=POSITIONS[previous];
    const u=Math.min(1,beat*2), blend=u*u*(3-2*u);
    const dx=px+(tx-px)*blend, dz=pz+(tz-pz)*blend;
    const bob=Math.sin(Math.PI*u)*3;
    this.dancerBody.getTransform().setLocalPosition(new vec3(dx*.46,bob,dz*.42));
    for(let i=0;i<2;i++) {
      const side=i===0?-1:1, moving=side*(tx || px)>0;
      const foot=new vec3(side*17+(moving?dx:0),moving?bob*2:0,moving?dz:0);
      const hip=new vec3(side*12+dx*.46,96+bob,dz*.42);
      const knee=hip.add(foot).uniformScale(.5).add(new vec3(side*6,0,10));
      const [thigh,shin,shoe]=this.dancerLegs[i];
      this.placeBone(thigh,hip,knee);this.placeBone(shin,knee,foot.add(new vec3(0,8,0)));
      shoe.getTransform().setLocalPosition(foot);
    }
  }
  private placeBone(obj:SceneObject, from:vec3, to:vec3) {
    const axis=to.sub(from), tr=obj.getTransform();
    tr.setLocalPosition(from);tr.setLocalScale(new vec3(1,axis.length,1));
    tr.setLocalRotation(quat.rotationFromTo(vec3.up(),axis.normalize()));
  }
  pick(origin: vec3, target: vec3): Zone | null {
    const inverse = this.root.getTransform().getInvertedWorldTransform();
    const a = inverse.multiplyPoint(origin), b = inverse.multiplyPoint(target);
    const dy = b.y - a.y;
    if (Math.abs(dy) < 0.0001) return null;
    const t = (0.8 - a.y) / dy;
    if (t <= 0) return null;
    const x = a.x+(b.x-a.x)*t, z = a.z+(b.z-a.z)*t;
    return this.zones.find(zone => {
      const [cx,cz] = DIAGRAM[zone];
      return Math.pow((x-cx)/this.ringWidthRadius,2) + Math.pow((z-cz)/this.ringDepthRadius,2) <= 1;
    }) || null;
  }
}
