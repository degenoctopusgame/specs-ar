// Run with: node --experimental-transform-types tempAssetGen/mix_movement_tracks.mjs
import {readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {CHART, ParkCircuitState, RELAXED_INTERVAL, STEADY_INTERVAL} from "../Assets/Scripts/ParkCircuitState.ts";
const assets=new URL("../Assets/GeneratedSFX/",import.meta.url);
const rate=44100;
const cueFiles={step:"Step",punch:"Punch",clap:"Clap",raise:"Raise",jump:"Jump",duck:"Duck",steady:"Hold"};
const levels={step:.86,punch:.93,clap:1.12,raise:.72,jump:.77,duck:.70,steady:.69};
// These sources are the 44-byte-header PCM masters emitted by WavBuilder in this project.
function readPCM(name,channels){
  const b=readFileSync(new URL(name+".wav",assets));
  if(b.toString("ascii",36,40)!=="data" || b.readUInt16LE(20)!==1 || b.readUInt16LE(22)!==channels ||
     b.readUInt32LE(24)!==rate || b.readUInt16LE(34)!==16)throw Error("Unexpected PCM format: "+name);
  return b;
}
function samples(b){
  const result=new Float32Array((b.length-44)/2);
  for(let i=0;i<result.length;i++)result[i]=b.readInt16LE(44+2*i)/32768;
  return result;
}
const music=readPCM("ParkCircuitPulse",2),base=samples(music);
const cues=Object.fromEntries(Object.entries(cueFiles).map(([kind,name])=>[kind,samples(readPCM(name+"Beat",1))]));
for(const [pace,interval] of [["Relaxed",RELAXED_INTERVAL],["Steady",STEADY_INTERVAL]]){
  const chart=new ParkCircuitState(8,interval);
  const mix=base.map(sample=>.80*sample);
  CHART.forEach((cue,i)=>{
    const start=Math.round(chart.beat(i)*rate);
    const sound=cues[cue.kind];
    for(let k=0;k<sound.length;k++){
      const t=k/rate, left=2*(start+k);
      const dip=1-.23*Math.min(t/.007,1,(sound.length-k)/(.055*rate));
      const fx=sound[k]*levels[cue.kind];
      mix[left]=mix[left]*dip+fx;
      mix[left+1]=mix[left+1]*dip+fx;
    }
  });
  let peak=0;
  for(const sample of mix)peak=Math.max(peak,Math.abs(sample));
  const gain=Math.min(1,.94/peak);
  const file=Buffer.from(music);
  for(let i=0;i<mix.length;i++)file.writeInt16LE(Math.round(mix[i]*gain*32767),44+2*i);
  const dest=new URL("ParkCircuit"+pace+".wav",assets);
  writeFileSync(dest,file);console.log(fileURLToPath(dest),CHART.length+" sample-aligned prompts; master gain "+gain.toFixed(3));
}
