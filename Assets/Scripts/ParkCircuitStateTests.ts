import {canClickCue, rayMeshDistance} from "./ParkCircuitTargets";
import {BodyFrame, CHART, Cue, FAR_PITCH, FIRST_BEAT, RELAXED_INTERVAL, STEADY_INTERVAL, HIT_Z, NEAR_PITCH, ParkCircuitState, STEP_Z, WINDOW, laneX, padLane, simulatedBody} from "./ParkCircuitState";

export function runParkCircuitTests():number {
  let passed=0;
  const ok=(value:boolean,label:string)=>{if(!value)throw new Error("Park Circuit test: "+label);passed++;};
  const fresh=(index=0,interval=2)=>{const s=new ParkCircuitState(8,interval);s.start();s.index=index;return s;};
  const still=()=>simulatedBody(null,-1);
  const lead=(c:Cue)=>c.kind==="steady"?0.60:c.kind==="duck"?0.35:0.13;
  type Sample=(time:number)=>BodyFrame;
  const run=(s:ParkCircuitState,start:number,end:number,sample:Sample)=>{
    for(let t=start;t<=end+0.000001;t+=0.02)s.update(t,0.02,sample(t));
  };
  const shot=(index:number,action:Cue|null,early=0,filter?:(f:BodyFrame,offset:number)=>void)=>{
    const s=fresh(index),due=s.beat(index);
    run(s,due-1.6,due+WINDOW+0.10,t=>{
      const f=simulatedBody(action,action?t-due+lead(action)+early:0);
      if(filter)filter(f,t-due);return f;
    });
    return s;
  };
  for(let i=0;i<4;i++){
    ok(padLane({x:laneX(i,NEAR_PITCH),z:STEP_Z})===i && padLane({x:laneX(i,FAR_PITCH),z:HIT_Z})===i,"ends of lane "+i);
  }
  CHART.forEach((c,i)=>{
    const s=shot(i,c);
    ok(s.successes===1 && s.score===100 && s.combo===1,"timed "+i+" "+c.kind);
  });
  ok(shot(0,{kind:"step",lane:3}).missed===1,"wrong lane misses");
  ok(shot(0,CHART[0],1).missed===1,"early foot misses");
  ok(shot(0,CHART[0],-0.28).score===70,"late hit gets lower grade");
  ok(shot(1,{kind:"punch",side:"right"}).missed===1,"opposite punch misses");
  ok(shot(1,{kind:"raise",side:"left"}).missed===1,"raise cannot score punch");
  ok(shot(1,CHART[1],0,(f,t)=>{if(t<0)f.left=null;}).missed===1,"reacquiring extended wrist cannot punch");
  ok(shot(4,null,0,f=>{f.left.x=-2;f.right.x=2;}).missed===1,"held clap cannot score");
  ok(shot(4,CHART[4],0,f=>{f.left=null;}).missed===1,"clap requires both tracked hands");
  ok(shot(5,null,0,f=>{f.height=12;}).missed===1,"already elevated head cannot jump");
  ok(shot(7,{kind:"raise",side:"right"}).missed===1,"opposite raise misses");
  ok(shot(8,CHART[8],0,(f,t)=>{if(t>=-0.06 && t<=-0.02)f.height=0;}).missed===1,"duck must span crossing");
  ok(shot(10,null).missed===1,"standing still without goalpost wrists misses wall");
  ok(shot(10,CHART[10],0,(f,t)=>{if(t>=-0.12 && t<=-0.07)f.right=null;}).missed===1,"brief wrist loss breaks hold");
  ok(shot(10,CHART[10],0,(f,t)=>{if(t>0.01)f.point.x=9;}).missed===1,"motion through wall breaks hold");
  ok(shot(10,CHART[10],0,(f,t)=>{if(t>-0.06)f.right.y+=10;}).missed===1,"moving wrist breaks wall hold");
  let s=fresh();
  s.update(1,0.05,still());s.pause();s.update(3,0.05,still());
  ok(s.elapsed===1 && s.index===0,"pause freezes music-based clock");
  ok(!s.resume({x:37,z:0}) && s.resume({x:0,z:0}),"resume at centre");
  s.update(1,0.10,still());ok(s.elapsed===1,"stationary audio clock cannot advance the chart");
  s.update(1.1,0.1,still(),false);ok(s.phase==="paused","head tracking loss pauses music");
  s=fresh();s.update(1,0.03,still());s.update(1.8,0.8,still(),true,false);
  ok(s.phase==="play" && s.elapsed===1.8,"editor screenshot gap keeps song clock running");
  s=fresh();s.update(1,0.03,still());s.update(1.8,0.8,still(),true,true);
  ok(s.phase==="paused" && s.elapsed===1,"tracked frame gap freezes last sampled song position");
  s=fresh();s.update(0,0.02,still());const warped=still();warped.point.x=95;s.update(0.02,0.02,warped);
  ok(s.phase==="paused","position discontinuity pauses");
  s=fresh();run(s,0,0.5,t=>{const f=still();f.point.x=120;return f;});
  ok(s.phase==="paused","boundary pauses");
  for(const interval of [2,1.5]){
    s=fresh(0,interval);
    for(let t=0;t<47 && s.phase==="play";t+=0.02){
      const c=s.cue;
      s.update(t,0.02,simulatedBody(c,t-s.beat(s.index)+lead(c)));
    }
    ok(s.phase==="results" && s.successes===20 && s.score===2000 && s.bestCombo===20 && s.elapsed<47,"entire chart "+interval);
  }
  s=fresh();run(s,0,44,still);ok(s.phase==="results" && s.missed===20 && s.score===0,"inactive player misses full chart");
  s=shot(0,CHART[0]);
  const firstGrade=s.grade;
  ok(firstGrade.index===0 && firstGrade.points===100 && firstGrade.label==="Perfect","hit grade belongs to the completed move");
  run(s,s.elapsed+0.02,s.beat(1)-0.12,still);
  ok(s.grade===firstGrade && s.index===1,"feedback persists while the next move approaches");
  run(s,s.elapsed+0.02,s.beat(1)+0.55,still);
  ok(s.grade.index===1 && s.grade.points===0 && s.grade.label==="Miss" && s.score===100 && s.combo===0,"miss resets streak but keeps points");
  s=shot(0,CHART[0],-0.28);
  ok(s.grade.points===70 && s.score===70,"late grade shows actual 70 earned");
  s=shot(CHART.length-1,CHART[CHART.length-1]);
  ok(s.phase==="results" && s.grade.index===19 && s.grade.points===100,"final action grade stays on results");

  for(const interval of [RELAXED_INTERVAL,STEADY_INTERVAL]){
    s=fresh(0,interval);
    const expectedLast=interval===RELAXED_INTERVAL?42:32.5;
    ok(s.beat(0)===4 && s.beat(19)===expectedLast,"first and final prompts in the "+interval+" second master");
    ok(CHART.every((_,i)=>s.beat(i)===FIRST_BEAT+i*interval),"every cue lies on its authored audio grid");
    for(let t=0;t<45 && s.phase==="play";t+=0.12)s.update(t,0.12,still(),true,false);
    ok(s.phase==="results" && s.missed===20 && s.score===0 && s.grade.index===19,
      "unanswered chart still reaches its final prompt at low frame rate");
  }
  const vertices=[-2,-2,0, 2,-2,0, 2,2,0, -2,2,0, -1,-1,0, 1,-1,0, 1,1,0, -1,1,0];
  const border=[0,1,5,0,5,4, 1,2,6,1,6,5, 2,3,7,2,7,6, 3,0,4,3,4,7];
  const forward={x:0,y:0,z:-1};
  ok(rayMeshDistance({x:1.5,y:0,z:10},forward,vertices,border)===10,"visible border is clickable");
  ok(rayMeshDistance({x:0,y:0,z:10},forward,vertices,border)===Infinity,"wall opening is not a mouse target");
  ok(rayMeshDistance({x:8,y:0,z:10},forward,vertices,border)===Infinity,"empty space outside the mesh is ignored");
  ok(rayMeshDistance({x:1.5,y:0,z:-10},forward,vertices,border)===Infinity,"geometry behind the click ray is ignored");
  ok(rayMeshDistance({x:1.5,y:0,z:10},{x:1,y:0,z:0},vertices,border)===Infinity,"parallel ray cannot hit the cue");
  ok(canClickCue(0.3,false) && !canClickCue(0.3,true),"one accepted attempt per cue");
  ok(!canClickCue(0.46,false) && canClickCue(0.45,false),"mouse window starts on the approach to its beat");
  ok(canClickCue(-0.4,false) && !canClickCue(-0.46,false),"expired target cannot accept a tap");
  ok(shot(1,CHART[1],0.9).missed===1,"early incoming punch is an honest miss");
  CHART.forEach((c,i)=>{
    const mouse=fresh(i),due=mouse.beat(i);
    ok(mouse.previewClick(i,due)==="hit" && mouse.score===100 && mouse.successes===1 && mouse.grade.index===i,
      "direct mouse click immediately scores "+i+" "+c.kind);
    ok(mouse.previewClick(i,due+0.01)==="ignored" && mouse.score===100,"duplicate mouse click cannot score twice "+i);
  });
  s=fresh();
  ok(s.previewClick(0,3)==="early" && s.index===0 && s.score===0,"early mouse click leaves cue available");
  ok(s.previewClick(0,4)==="hit" && s.score===100,"early mouse click can retry on beat");
  for(const offset of [-WINDOW,WINDOW]){
    const mouse=fresh();
    ok(mouse.previewClick(0,mouse.beat(0)+offset)==="hit" && mouse.score===70,"mouse timing boundary earns 70 at "+offset);
  }
  s=fresh();
  ok(s.previewClick(0,4.46)==="late" && s.score===0 && s.index===0,"late mouse click does not award points");
  run(s,4.46,4.5,still);ok(s.missed===1 && s.index===1,"unaccepted late click becomes a normal miss");
  s=fresh();
  ok(s.previewClick(1,6)==="ignored" && s.previewClick(0,NaN)==="ignored" && s.previewClick(0,Infinity)==="ignored",
    "future cue and invalid mouse clocks cannot score");
  s.pause();ok(s.previewClick(0,4)==="ignored" && s.score===0,"mouse clicks cannot score while paused");
  for(const interval of [RELAXED_INTERVAL,STEADY_INTERVAL]){
    s=fresh(0,interval);
    CHART.forEach((_,i)=>s.previewClick(i,s.beat(i)));
    ok(s.phase==="results" && s.score===2000 && s.successes===20 && s.bestCombo===20,
      "direct mouse full chart reaches results at pace "+interval);
  }
  return passed;
}
