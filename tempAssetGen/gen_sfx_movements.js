// Original, sample-free movement cues. First transients coincide with the authored action beats.
const path = require('path');
const audio = require(path.join(process.env.HOME, '.codex/plugins/cache/ls-extensions/ls-clad/local/skills/build-sfx/tools'));
const out = path.resolve(__dirname, '../Assets/GeneratedSFX');
const rate = audio.SAMPLE_RATE;
const p = audio.sfx_presets;
const mono = a => a.left ? audio.monoFromStereo(a) : a;
const tone = (start, end, seconds, wave = 'sine') =>
    audio.adsrExp(audio.sweep(start, end, seconds, wave), .003, seconds*.28, .45, seconds*.45, 2);
function write(name, material, seconds, peak = .86) {
    const samples = mono(material).slice(0, Math.floor(seconds*rate));
    audio.fadeOut(samples,.022);
    audio.normalizePeak(samples,peak);
    audio.WavBuilder.write(samples,path.join(out,name+'.wav'));
}
write('StepBeat',p.footstep({surface:'wood'}),.245);
const glove = mono(p.impact({material:'soft',size:1.1}));
write('PunchBeat',audio.mix([glove.subarray(Math.floor(.049*rate)),tone(210,83,.11)], [.9,.25]),.26);
write('ClapBeat',audio.synth_voices.clap(39,.25,122,120),.16);
write('RaiseBeat',audio.mix([mono(p.swish({direction:'up',size:.8,duration:.24})),tone(494,740,.18)], [.85,.26]),.24);
write('JumpBeat',audio.mix([mono(p.jump({pitch:-7})),mono(p.footstep({surface:'grass'}))],[.46,.70]),.255);
write('DuckBeat',audio.mix([mono(p.whoosh({direction:'down',size:1.35,duration:.33})),tone(420,148,.23)],[.93,.34]),.33);
// A steady, level tone for the wall crossing, with a muted rim attack to mark its beat.
write('HoldBeat',audio.mix([tone(330,330,.38),tone(494,494,.37),mono(p.uiClick({character:'soft'}))],[.4,.17,.34]),.38);
const confirm=new Float32Array(Math.floor(.19*rate));
audio.addInto(confirm,tone(659,659,.105),0,.75);
audio.addInto(confirm,tone(988,988,.13),Math.floor(.045*rate),.68);
write('MoveHit',confirm,.185,.76);
write('MoveMiss',p.uiError({pitch:-1}),.41,.67);
