import logo from "./logo.svg";
import "./App.css";
import { createRoot } from "react-dom/client";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as Tone from "tone";

function Box(props) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef();
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  // Return view, these are regular three.js elements expressed in JSX
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function App() {
  // create two monophonic synths

  async function startTune() {
    Tone.getContext()
      .resume()
      .then(() => {
        const clickLPFilter = new Tone.Filter(1000, "lowpass");
        const clickPanner = new Tone.Panner(0).toDestination();
        const clickSynth = new Tone.Synth({
          oscillator: {
            type: "sine",
            modulationFrequency: 0.2,
          },
          envelope: {
            attack: 0,
            decay: 0.001,
            sustain: 0,
            release: 0.1,
          },
        }).connect(clickLPFilter);
        clickLPFilter.connect(clickPanner);

        const clickLoop = new Tone.Loop((time) => {
          console.log(clickLPFilter.frequency.get());
          clickLPFilter.set({
            frequency: Math.random() * 12000 + 5000,
          });
          clickPanner.set({
            pan: Math.random() * 2 - 1,
          });
          clickSynth.triggerAttackRelease("5000", "0.0001", time);
        }, "32n").start(0);

        const beep = new Tone.Synth({
          oscillator: {
            type: "sine",
          },
        }).toDestination();
        const beepFreq = 10000;
        const beepPattern = [
          "10000",
          "10000",
          "10000",
          null,
          "10000",
          "10000",
          null,
          null,
          "10000",
          "10000",
          "10000",
          null,
          null,
          "10000",
          "10000",
          null,
        ];
        beepPattern.push(...beepPattern);
        console.log(beepPattern.length);
        const beepSeq = new Tone.Sequence(
          (time, note) => {
            beep.triggerAttackRelease(note, 0.0001, time);
          },
          beepPattern,
          "32n"
        ).start(0);

        const bassNotes = ["49", "98", "196"];
        const bassPattern = [
          bassNotes,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          bassNotes,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ];

        const bassLPFilter = new Tone.Filter(50, "lowpass");
        const bassHPFilter = new Tone.Filter(20, "highpass");
        const bassDistortion = new Tone.Distortion(0.4);
        const bassSynth = new Tone.PolySynth().connect(bassLPFilter);
        bassSynth.set({
          envelope: {
            release: 0.9,
          },
        });
        bassLPFilter.connect(bassHPFilter);
        bassHPFilter.connect(bassDistortion);
        bassDistortion.toDestination();
        const bassSeq = new Tone.Sequence(
          (time, note) => {
            bassSynth.triggerAttackRelease(note, "3n", time);
          },
          bassPattern,
          "16n"
        ).start(0);

        const ringPattern = [
          null,
          null,
          null,
          null,
          null,
          null,
          "1174",
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
        ];
        const ringSynth = new Tone.Synth();
        const ringReverb = new Tone.FeedbackDelay("8n", 0.35);
        ringSynth.connect(ringReverb);
        ringReverb.toDestination();
        const ringSeq = new Tone.Sequence(
          (time, note) => {
            ringSynth.triggerAttackRelease(note, "8n", time);
          },
          ringPattern,
          "16n"
        ).start(0);

        console.log("Audio Play");
        Tone.Transport.bpm.value = 88;
        Tone.Transport.start();
      });
  }

  useEffect(() => {
    //attach a click listener to a play button
    // console.log("useeffect");
    document.addEventListener("click", startTune);
    return () => {
      document.removeEventListener("click", startTune);
    };
  }, []);

  return (
    <div id="canvas-container">
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
      </Canvas>
    </div>
  );
}

export default App;
