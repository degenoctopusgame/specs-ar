import {WINDOW} from "./ParkCircuitState";

export type XYZ={x:number;y:number;z:number};
export function canClickCue(remaining:number,attempted:boolean):boolean {
  return !attempted && remaining<=WINDOW && remaining>=-WINDOW;
}

// Double-sided Möller–Trumbore intersection, in the rendered mesh's local space.
// The smallest positive ray parameter wins; open space between triangles stays open.
export function rayMeshDistance(o:XYZ,d:XYZ,vertices:number[],indices:number[]):number {
  let nearest=Infinity;
  for(let i=0;i<indices.length;i+=3){
    const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;
    const e1x=vertices[b]-vertices[a],e1y=vertices[b+1]-vertices[a+1],e1z=vertices[b+2]-vertices[a+2];
    const e2x=vertices[c]-vertices[a],e2y=vertices[c+1]-vertices[a+1],e2z=vertices[c+2]-vertices[a+2];
    const px=d.y*e2z-d.z*e2y,py=d.z*e2x-d.x*e2z,pz=d.x*e2y-d.y*e2x;
    const det=e1x*px+e1y*py+e1z*pz;
    if(Math.abs(det)<0.000001)continue;
    const tx=o.x-vertices[a],ty=o.y-vertices[a+1],tz=o.z-vertices[a+2];
    const u=(tx*px+ty*py+tz*pz)/det;
    if(u<0 || u>1)continue;
    const qx=ty*e1z-tz*e1y,qy=tz*e1x-tx*e1z,qz=tx*e1y-ty*e1x;
    const v=(d.x*qx+d.y*qy+d.z*qz)/det;
    if(v<0 || u+v>1)continue;
    const t=(e2x*qx+e2y*qy+e2z*qz)/det;
    if(t>0 && t<nearest)nearest=t;
  }
  return nearest;
}
