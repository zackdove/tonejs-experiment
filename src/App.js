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
        const clickLPFilter = new Tone.Filter(1000, "lowpass").toDestination();
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

        const clickLoop = new Tone.Loop((time) => {
          console.log(clickLPFilter.frequency.get());
          clickLPFilter.set({
            frequency: Math.random() * 4000 + 5000,
          });

          clickSynth.triggerAttackRelease("5000", "0.0001", time);
        }, "32n").start(0);

        console.log("Audio Play");
        Tone.Transport.bpm.value = 80;
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
