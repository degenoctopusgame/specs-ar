// Park Circuit Pulse. The drum grid is also the lens's movement chart clock.
const path = require('path');
const music = require(path.join(process.env.HOME,'.codex/plugins/cache/ls-extensions/ls-clad/local/skills/build-music/tools'));
const bars = 24, bpm = 120;
const genre = 'edm-uplift';
const {chords,meta} = music.composeChords({genre,voice:'electricPiano'});
const drums = music.composeDrums({genre:'house',bars,energy:.84,embellish:.38});
const selectBars = (events, enabled) => music.mask(events,
    Array.from({length:bars}, (_, i)=>enabled(i)?'x':'~').join(' '), bars, 4);
// A plain count-in grows into a backbeat, then a bass groove and a bright answering hook.
const kick = drums.find(t=>t.voice==='kick');
kick.events = Array.from({length:bars*4}, (_, i)=>({time:i,beats:.24,value:36,velocity:i%4===0?116:100}));
kick.opts.quantize = 'strict';
for (const drum of drums.filter(t=>t!==kick)) drum.events = selectBars(drum.events, b=>b>=1 && b!==14 && b<23);
const chordsAtBars = Array.from({length:bars}, (_, i)=>chords[i%chords.length]);
const stabs = music.chordEvents(chords,{voice:'electricPiano',bars,gateOverride:.19,velocity:75})
    .map(e=>({...e,time:e.time+.5}));
const bass = music.composeBass({chords,genre,bars,energy:.82});
const arp = music.composeArpeggio({chords:chordsAtBars,style:'up-down',density:8,velocity:69});
const tonic = meta.key.match(/^([A-Ga-g][#b]?)(-?\d+)$/);
const melody = music.composeMelody({chords,bars:4,notesPerBar:3,contour:'arch',scale:meta.scale,
    scaleRoot:tonic[1]+(Number(tonic[2])+1),octaveShift:1,restProbability:.24});
const hook = music.repeat(melody,6,16);
const tracks = [...drums,
    music.track('bass','synthBass',selectBars(bass,b=>b>=2 && b!==14),{fx:{hpf:44,lpf:850,gain:.56}}),
    music.track('offbeat keys','electricPiano',selectBars(stabs,b=>b>=1),{fx:{hpf:210,lpf:4200,gain:.41,pan:-.15}}),
    music.track('lane lights','pluckSynth',selectBars(arp,b=>b>=6 && b<10 || b>=15 && b<22),
        {fx:{hpf:530,lpf:3600,gain:.19,pan:.21}}),
    music.track('call and answer','marimba',selectBars(hook,b=>b>=2 && b<6 || b>=10 && b<14 || b>=17 && b<23),
        {fx:{hpf:350,lpf:5800,gain:.55,reverb:'smallRoom'}})];
console.log(JSON.stringify({bpm,bars,harmony:meta,drums:drums.meta,notes:tracks.map(t=>[t.name,t.events.length])}));
const out = music.render(tracks,{bpm,duration:48,master:{normalize:'peak',glue:true,width:1.07}});
// Taper the last cymbal tail. The intro starts on sample zero.
for (const channel of [out.left,out.right]) {
    const end = Math.floor(channel.length/48*.24);
    for(let i=0;i<end;i++)channel[channel.length-end+i]*=(1-i/end);
}
music.WavBuilder.write(out,path.resolve(__dirname,'../Assets/GeneratedSFX/ParkCircuitPulse.wav'));
