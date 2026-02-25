import * as Tone from 'tone';

let synth: Tone.PolySynth;
let noise: Tone.NoiseSynth;
let membrane: Tone.MembraneSynth;
let drone: Tone.Oscillator;
let filter: Tone.Filter;
let lfo: Tone.LFO;
let isInitialized = false;

export const initAudio = async () => {
  if (isInitialized) {
      // Just ensure drone is running
      if (drone && drone.state !== 'started') {
          drone.start();
      }
      return;
  }

  await Tone.start();
  console.log('Audio Context Started');

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fmsquare', modulationType: 'sawtooth', modulationIndex: 3, harmonicity: 3.4 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 },
    volume: -12
  }).toDestination();

  noise = new Tone.NoiseSynth({
    noise: { type: 'pink', playbackRate: 0.5 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0 },
    volume: -20
  }).toDestination();

  membrane = new Tone.MembraneSynth({
      volume: -15
  }).toDestination();

  // Background Drone (Dark Cyberpunk Ambience)
  filter = new Tone.Filter(200, "lowpass").toDestination();
  drone = new Tone.Oscillator(55, "sawtooth").connect(filter);
  drone.volume.value = -30;

  // Add some movement to the drone
  lfo = new Tone.LFO(0.1, 100, 300).start();
  lfo.connect(filter.frequency);

  drone.start();

  isInitialized = true;
};

export const stopAudio = () => {
    if (drone) drone.stop();
};

export const playSfx = (type: 'hover' | 'select' | 'cut' | 'error' | 'hack' | 'game_over' | 'victory' | 'click') => {
  if (!isInitialized) return;

  switch (type) {
    case 'hover':
      // Very subtle blip
      break;
    case 'click':
      synth.triggerAttackRelease("G5", "32n", undefined, 0.1);
      break;
    case 'select':
      synth.triggerAttackRelease("C5", "16n", undefined, 0.2);
      break;
    case 'cut':
      // Digital crunch
      noise.triggerAttackRelease("16n");
      membrane.triggerAttackRelease("C2", "8n");
      synth.triggerAttackRelease(["C3", "G3"], "16n", undefined, 0.5);
      break;
    case 'error':
      // Low buzz
      synth.triggerAttackRelease(["C3", "F#3"], "8n", undefined, 0.5);
      break;
    case 'hack':
      // Positive chime
      synth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "16n", undefined, 0.4);
      break;
    case 'game_over':
      // Descending
      synth.triggerAttackRelease(["C4", "B3", "Bb3", "A3"], "0.5", undefined, 0.5);
      if (drone) drone.stop();
      break;
    case 'victory':
      // Ascending
      synth.triggerAttackRelease(["C4", "E4", "G4", "C5", "E5", "G5", "C6"], "16n", undefined, 0.3);
      break;
  }
};
