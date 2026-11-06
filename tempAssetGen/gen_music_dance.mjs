// Run with Node 24: node --experimental-transform-types tempAssetGen/gen_music_dance.mjs
import {createRequire} from "node:module";
import {homedir} from "node:os";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {COUNT_IN, DANCE_LEVELS, PHRASE} from "../Assets/Scripts/WorkoutLessons.ts";

const toolsDir = process.env.DANCE_MUSIC_TOOLS || resolve(homedir(), ".codex/plugins/cache/ls-extensions/ls-clad/local/skills/build-music/tools");
const music = createRequire(import.meta.url)(toolsDir);
const count = COUNT_IN + PHRASE.length;
const degrees = [0,2,4,2,5,4,2,0];
const melody = music.scale(degrees.map((value,i)=>({time:COUNT_IN+i,beats:.42,value,velocity:83})), "pentatonicMajor", "D4");
const onCounts = (value,velocity,beats) => Array.from({length:count},(_,i)=>({
  time:i, beats, value, velocity:velocity+(i%4===0?8:0)
}));
const tracks = [
  music.track("Count pulse","kick",onCounts(36,105,.22),{quantize:"strict"}),
  music.track("Count accent","marimba",onCounts(81,82,.12),{quantize:"strict",gain:.40}),
  music.track("Step melody","vibraphone",melody,{quantize:"strict",gain:.46}),
  music.track("Phrase bass","synthBass",melody.map(e=>({...e,value:e.value-24,beats:.52})),{quantize:"strict",gain:.30})
];
for(const {bpm} of DANCE_LEVELS) {
  const audio = music.render(tracks,{bpm,duration:(count+.5)*60/bpm,master:{normalize:"peak",glue:true}});
  const file=fileURLToPath(new URL("../Assets/GeneratedSFX/Dance"+bpm+".wav",import.meta.url));
  music.WavBuilder.write(audio,file);
  console.log(bpm+" counts/min: "+file);
}
