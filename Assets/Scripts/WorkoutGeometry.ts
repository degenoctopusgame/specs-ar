import {rayMeshDistance} from "./ParkCircuitTargets";

// Geometry is batched by colour; mouse picks use the same triangle data as rendering.
export class Shapes {
  private vertices:number[]=[];
  private indices:number[]=[];
  face(points:vec3[], normal:vec3) {
    const base=this.vertices.length/3;
    const reverse=points[1].sub(points[0]).cross(points[2].sub(points[0])).dot(normal)<0;
    points.forEach(p=>this.vertices.push(p.x,p.y,p.z));
    for(let i=1;i<points.length-1;i++)
      this.indices.push(base,base+(reverse?i+1:i),base+(reverse?i:i+1));
  }
  floor(coords:number[][], y:number) { this.face(coords.map(p=>new vec3(p[0],y,p[1])),vec3.up()); }
  line(a:vec3,b:vec3,width:number) {
    const axis=b.sub(a).normalize();
    const ref=Math.abs(axis.y)>0.9?vec3.right():vec3.up();
    const u=axis.cross(ref).normalize().uniformScale(width/2);
    const v=axis.cross(u).normalize().uniformScale(width/2);
    const corners=[u.add(v),v.sub(u),u.add(v).uniformScale(-1),u.sub(v)];
    for(let i=0;i<4;i++) {
      const j=(i+1)%4;
      this.face([a.add(corners[i]),b.add(corners[i]),b.add(corners[j]),a.add(corners[j])],corners[i].add(corners[j]));
    }
    this.face(corners.map(c=>a.add(c)),axis.uniformScale(-1));
    this.face(corners.map(c=>b.add(c)),axis);
  }
  stripe(x1:number,z1:number,x2:number,z2:number,width:number,y=1) {
    const dx=x2-x1,dz=z2-z1;
    const length=Math.hypot(dx,dz);
    const x=-dz/length*width/2,z=dx/length*width/2;
    this.floor([[x1+x,z1+z],[x2+x,z2+z],[x2-x,z2-z],[x1-x,z1-z]],y);
  }
  hit(origin:vec3,direction:vec3):number {return rayMeshDistance(origin,direction,this.vertices,this.indices);}
  mesh():RenderMesh {
    const builder=new MeshBuilder([{name:"position",components:3}]);
    builder.topology=MeshTopology.Triangles;
    builder.indexType=MeshIndexType.UInt16;
    builder.appendVerticesInterleaved(this.vertices);
    builder.appendIndices(this.indices);
    builder.updateMesh();
    return builder.getMesh();
  }
}

export function sole(shape:Shapes,x:number,z:number,size:number,side:number,y:number) {
  const oval=(cx:number,cz:number,rx:number,rz:number)=>{
    const p:number[][]=[];
    for(let i=0;i<18;i++){
      const a=i*Math.PI/9;
      p.push([x+side*size*(cx+rx*Math.cos(a)),z+size*(cz+rz*Math.sin(a))]);
    }
    shape.floor(p,y);
  };
  oval(-0.04,0.46,0.21,0.26);
  oval(-0.13,0.13,0.15,0.33);
  oval(0,-0.14,0.35,0.25);
  oval(0.26,-0.52,0.115,0.16);
  oval(0.045,-0.57,0.078,0.115);
  oval(-0.12,-0.52,0.066,0.097);
  oval(-0.25,-0.43,0.055,0.084);
  oval(-0.34,-0.32,0.045,0.071);
}

