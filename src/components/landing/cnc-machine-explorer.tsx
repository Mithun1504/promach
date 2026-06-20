"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const modelUrl = process.env.NEXT_PUBLIC_CNC_MODEL_URL;

const focusPoints = [
  {
    label: "Tool Changer",
    description: "Review tool exchange path, clearance, and repeatability.",
    rotation: [0.08, -0.55, 0],
    zoom: 8.4,
  },
  {
    label: "Motion Systems",
    description: "Inspect axis motion, guided travel, and machine envelope.",
    rotation: [0.1, 0.28, 0],
    zoom: 8.8,
  },
  {
    label: "Spindle",
    description: "Move into the cutting center where torque becomes geometry.",
    rotation: [0.08, 0.72, 0],
    zoom: 7.6,
  },
  {
    label: "Panel Access",
    description: "Open-view state for enclosure, service, and internal systems.",
    rotation: [0.12, -0.9, 0],
    zoom: 9.2,
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
  const gltf = useLoader(GLTFLoader, modelUrl ?? "");
  const { camera } = useThree();

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);

    cloned.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material instanceof MeshStandardMaterial) {
          object.material.metalness = Math.max(object.material.metalness, 0.55);
          object.material.roughness = Math.min(object.material.roughness, 0.42);
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
    camera.position.y += (1.35 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.1, 0);
    state.scene.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.025;
  });

  return (
    <group ref={groupRef} scale={0.82} position={[0, -0.7, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function MachineCanvas({ focusIndex }: { focusIndex: FocusIndex }) {
  const [dragRotation, setDragRotation] = useState({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  return (
    <div
      className="machine-explorer__canvas"
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
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.35, 8.8], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#080b0f"]} />
        <ambientLight intensity={0.9} />
        <directionalLight
          castShadow
          position={[4, 6, 4]}
          intensity={2.6}
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-3, 2, 3]} intensity={1.1} color="#4f8cff" />
        <Suspense fallback={null}>
          <CncModel focusIndex={focusIndex} dragRotation={dragRotation} />
        </Suspense>
      </Canvas>
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
          Engineering designed for precision manufacturing. Rotate, zoom, and
          inspect critical systems when the production CNC model is connected.
        </p>
      </div>

      {modelUrl ? (
        <MachineCanvas focusIndex={focusIndex} />
      ) : (
        <div className="machine-explorer__model-slot">
          <span className="section-kicker">Model Required</span>
          <h3>Connect a real CNC machine model.</h3>
          <p>
            Add a compressed `.glb` or `.gltf` URL to
            `NEXT_PUBLIC_CNC_MODEL_URL`. The viewer is ready for rotation,
            focus states, and system inspection without using fake placeholder
            machinery.
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
