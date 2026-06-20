"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const modelUrl = process.env.NEXT_PUBLIC_CNC_MODEL_URL ?? "/models/cnc-machine.glb";

const focusPoints = [
  {
    label: "Tool Changer",
    description: "Review tool exchange path, clearance, and repeatability.",
    rotation: [0.15, -0.68, 0],
    zoom: 8.4,
    hotspot: { left: "68%", top: "34%" },
  },
  {
    label: "Motion Systems",
    description: "Inspect axis motion, guided travel, and machine envelope.",
    rotation: [0.2, 0.4, 0],
    zoom: 8.8,
    hotspot: { left: "39%", top: "62%" },
  },
  {
    label: "Spindle",
    description: "Move into the cutting center where torque becomes geometry.",
    rotation: [0.1, 0.95, 0],
    zoom: 7.6,
    hotspot: { left: "57%", top: "48%" },
  },
  {
    label: "Panel Access",
    description: "Open-view state for enclosure, service, and internal systems.",
    rotation: [0.28, -1.15, 0],
    zoom: 9.2,
    hotspot: { left: "76%", top: "58%" },
  },
];

type FocusIndex = number;

function CncModel({
  focusIndex,
  dragRotation,
}: {
  focusIndex: FocusIndex;
  dragRotation: { x: number; y: number };
}) {
  const groupRef = useRef<Group | null>(null);
  const gltf = useLoader(GLTFLoader, modelUrl);
  const { camera } = useThree();

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);

    cloned.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material instanceof MeshStandardMaterial) {
          // Boost metallic reflectiveness to catch the cyber lights beautifully
          object.material.metalness = 0.85;
          object.material.roughness = 0.28;
        }
      }
    });

    return cloned;
  }, [gltf.scene]);

  useFrame((state) => {
    const focus = focusPoints[focusIndex];

    if (groupRef.current) {
      groupRef.current.rotation.x +=
        (focus.rotation[0] + dragRotation.x - groupRef.current.rotation.x) * 0.07;
      groupRef.current.rotation.y +=
        (focus.rotation[1] + dragRotation.y - groupRef.current.rotation.y) * 0.07;
      groupRef.current.rotation.z +=
        (focus.rotation[2] - groupRef.current.rotation.z) * 0.07;
    }

    camera.position.z += (focus.zoom - camera.position.z) * 0.06;
    camera.lookAt(0, 0.1, 0);
    
    // Slow cinematic hover oscillation
    state.scene.rotation.y = Math.sin(state.clock.elapsedTime * 0.24) * 0.04;
  });

  return (
    <group ref={groupRef} scale={0.82} position={[0, -0.7, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function TelemetryOverlay() {
  const [coords, setCoords] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords({
        x: Number((Math.random() * 100 - 50).toFixed(3)),
        y: Number((Math.random() * 80 - 40).toFixed(3)),
        z: Number((Math.random() * 30 - 15).toFixed(3)),
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-6 left-6 z-10 pointer-events-none font-mono text-[10px] text-[var(--theme-primary)] flex flex-col gap-1 tracking-wider bg-black/60 p-3 rounded border border-[var(--line)] backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
        <span className="font-bold text-[11px] text-white">SYSTEM TELEMETRY</span>
      </div>
      <div>AXIS_X: {coords.x} mm</div>
      <div>AXIS_Y: {coords.y} mm</div>
      <div>AXIS_Z: {coords.z} mm</div>
      <div>SPINDLE: 18,200 RPM</div>
      <div>FEEDRATE: 4,500 MM/MIN</div>
    </div>
  );
}

function MachineCanvas({
  focusIndex,
  onFocusChange,
}: {
  focusIndex: FocusIndex;
  onFocusChange: (index: FocusIndex) => void;
}) {
  const [dragRotation, setDragRotation] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  return (
    <div
      className="machine-explorer__canvas relative"
      onPointerDown={(event) => {
        draggingRef.current = true;
        lastPointRef.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return;

        const deltaX = event.clientX - lastPointRef.current.x;
        const deltaY = event.clientY - lastPointRef.current.y;

        lastPointRef.current = { x: event.clientX, y: event.clientY };
        setDragRotation((current) => ({
          x: Math.max(-0.45, Math.min(0.45, current.x + deltaY * 0.0025)),
          y: current.y + deltaX * 0.0035,
        }));
      }}
      onPointerUp={(event) => {
        draggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
    >
      <div className="machine-explorer__viewport-label">
        <span>live inspection bay</span>
        <strong>{focusPoints[focusIndex].label}</strong>
      </div>
      <TelemetryOverlay />
      
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.35, 8.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#040508"]} />
        
        {/* Colorful Neon 3-Point Light Rig */}
        <ambientLight intensity={0.65} />
        <directionalLight
          castShadow
          position={[5, 8, 5]}
          intensity={2.8}
          color="#ffffff"
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-4, 3, 4]} intensity={2.2} color="#00f0ff" /> {/* Cyan */}
        <pointLight position={[4, -3, 3]} intensity={2.0} color="#ff7300" /> {/* Orange */}
        <pointLight position={[0, 5, -3]} intensity={1.8} color="#b800ff" /> {/* Purple */}
        
        {/* Blueprint Holographic Helper Grid */}
        <gridHelper args={[12, 12, "#00f0ff", "#1f2937"]} position={[0, -0.63, 0]} material-opacity={0.25} material-transparent={true} />
        
        <Suspense fallback={null}>
          <CncModel focusIndex={focusIndex} dragRotation={dragRotation} />
        </Suspense>
      </Canvas>
      <div className="machine-explorer__hotspots" aria-label="Machine model focus points">
        {focusPoints.map((point, index) => (
          <button
            key={point.label}
            type="button"
            className={index === focusIndex ? "is-active" : ""}
            style={point.hotspot}
            onClick={() => onFocusChange(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </div>
      <div className="machine-explorer__scanline" aria-hidden="true" />
    </div>
  );
}

export function CncMachineExplorer() {
  const [focusIndex, setFocusIndex] = useState(0);

  return (
    <section className="machine-explorer" id="technology">
      <div className="machine-explorer__copy">
        <span className="section-kicker">Interactive CNC Experience</span>
        <h2>Explore The Machine</h2>
        <p>
          Rotate, drag, and tap the focal triggers to explore critical tooling pathways, multi-axis guide configurations, and the high-torque cutting spindle envelope.
        </p>
        <div className="machine-explorer__specs">
          <span>4 inspection zones</span>
          <span>drag enabled</span>
          <span>live telemetry</span>
        </div>
      </div>

      {modelUrl ? (
        <MachineCanvas focusIndex={focusIndex} onFocusChange={setFocusIndex} />
      ) : (
        <div className="machine-explorer__model-slot">
          <span className="section-kicker">Model Required</span>
          <h3>Connect a real CNC machine model.</h3>
          <p>
            Add a compressed `.glb` or `.gltf` URL to
            `NEXT_PUBLIC_CNC_MODEL_URL`. The viewer is ready for rotation,
            focus states, and system inspection.
          </p>
        </div>
      )}

      <div className="machine-explorer__controls" aria-label="Machine focus controls">
        {focusPoints.map((point, index) => (
          <button
            key={point.label}
            type="button"
            className={index === focusIndex ? "is-active" : ""}
            onClick={() => setFocusIndex(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {point.label}
            <small>{point.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
