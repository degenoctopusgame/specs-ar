const fs=require('fs');const path=require('path');
const audio=require('/Users/elainehu/.codex/plugins/cache/ls-extensions/ls-clad/local/skills/build-sfx/tools');
const PROJECT_ASSETS_SFX='/Users/elainehu/Dropbox/MyProjects/income-lab/competitions/learn-ar-with-specs/park-circuit-lens/Assets/GeneratedSFX';
fs.mkdirSync(PROJECT_ASSETS_SFX,{recursive:true});
for(const [name,buffer] of [['ParkClick',audio.sfx_presets.uiClick({character:'soft'})],['ParkArrival',audio.sfx_presets.uiPop({pitch:0})]]){
  const final=audio.mix_bus.applyFx(buffer,{hpf:100,gain:0.65});
  audio.WavBuilder.write(final,path.join(PROJECT_ASSETS_SFX,name+'.wav'));
}
