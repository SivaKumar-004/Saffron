import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

/* ── Twinkling starfield ── */
const Stars = ({ count = 500 }) => {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return arr;
  }, [count]);

  const sizes = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = Math.random();
    return arr;
  }, [count]);

  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.015;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = 0.4 + Math.sin(clock.elapsedTime * 0.5) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.035} sizeAttenuation transparent opacity={0.5} />
    </points>
  );
};

/* ── Pulsing atmosphere layers ── */
const Atmosphere = () => {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (innerRef.current) {
      innerRef.current.scale.setScalar(1 + Math.sin(t * 1.2) * 0.015);
      (innerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.07 + Math.sin(t * 0.8) * 0.03;
    }
    if (outerRef.current) {
      outerRef.current.scale.setScalar(1 + Math.sin(t * 0.6 + 1) * 0.02);
      (outerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + Math.sin(t * 1.5) * 0.02;
    }
  });

  return (
    <>
      <mesh ref={innerRef}>
        <sphereGeometry args={[1.08, 64, 64]} />
        <meshBasicMaterial color="#2ECC71" transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshBasicMaterial color="#3498DB" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </>
  );
};

/* ── Orbiting rings with animated dash ── */
const OrbitRing = ({ radius, speed, color, tilt, thickness = 0.003 }: {
  radius: number; speed: number; color: string; tilt: number; thickness?: number;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.elapsedTime * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, thickness, 16, 120]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
};

/* ── Orbiting satellite dot ── */
const OrbitDot = ({ radius, speed, tilt, color }: {
  radius: number; speed: number; tilt: number; color: string;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    const x = Math.cos(t) * radius;
    const z = Math.sin(t) * radius;
    const y = z * Math.sin(tilt);
    ref.current.position.set(x, y, z * Math.cos(tilt));
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.02, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

/* ── Energy pulse rings ── */
const EnergyPulse = () => {
  const rings = useRef<THREE.Mesh[]>([]);
  const count = 3;

  useFrame(({ clock }) => {
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const t = (clock.elapsedTime * 0.4 + i * 0.8) % 2.4;
      const scale = 1 + t * 0.4;
      const opacity = Math.max(0, 0.3 - t * 0.125);
      ring.scale.setScalar(scale);
      (ring.material as THREE.MeshBasicMaterial).opacity = opacity;
    });
  });

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) rings.current[i] = el; }}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[1.0, 1.015, 64]} />
          <meshBasicMaterial color="#2ECC71" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
};

/* ── Animated arc particles flowing along curves ── */
const ArcParticle = ({ curve, speed, delay, color }: {
  curve: THREE.CatmullRomCurve3; speed: number; delay: number; color: string;
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = ((clock.elapsedTime * speed + delay) % 3) / 3;
    const pos = curve.getPoint(t);
    ref.current.position.copy(pos);
    const scale = Math.sin(t * Math.PI) * 0.8 + 0.2;
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.015, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </mesh>
  );
};

/* ── Globe surface dots + arcs ── */
const GlobePoints = () => {
  const ruralRef = useRef<THREE.Points>(null);
  const urbanRef = useRef<THREE.Points>(null);

  const ruralPositions = useMemo(() => {
    const coords = [
      [0.8, 0.3, 0.5], [-0.6, 0.5, 0.6], [0.3, -0.7, 0.6],
      [-0.4, 0.2, 0.9], [0.7, -0.3, 0.6], [-0.8, -0.1, 0.5],
      [0.1, 0.8, 0.5], [-0.3, -0.6, 0.7], [0.5, 0.5, 0.7],
      [-0.2, 0.9, 0.3], [0.6, -0.6, 0.5], [-0.7, 0.4, 0.5],
      [0.4, 0.1, 0.9], [-0.1, -0.8, 0.5], [0.9, 0.2, 0.3],
    ];
    const arr = new Float32Array(coords.length * 3);
    coords.forEach((c, i) => {
      const len = Math.sqrt(c[0] ** 2 + c[1] ** 2 + c[2] ** 2);
      arr[i * 3] = (c[0] / len) * 1.03;
      arr[i * 3 + 1] = (c[1] / len) * 1.03;
      arr[i * 3 + 2] = (c[2] / len) * 1.03;
    });
    return arr;
  }, []);

  const urbanPositions = useMemo(() => {
    const coords = [
      [0.5, 0.7, 0.5], [-0.3, 0.8, 0.5], [0.9, 0.1, 0.4],
      [-0.5, -0.5, 0.7], [0.2, -0.9, 0.3], [-0.9, 0.2, 0.3],
      [0.3, 0.6, 0.7], [-0.7, -0.3, 0.6],
    ];
    const arr = new Float32Array(coords.length * 3);
    coords.forEach((c, i) => {
      const len = Math.sqrt(c[0] ** 2 + c[1] ** 2 + c[2] ** 2);
      arr[i * 3] = (c[0] / len) * 1.03;
      arr[i * 3 + 1] = (c[1] / len) * 1.03;
      arr[i * 3 + 2] = (c[2] / len) * 1.03;
    });
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (ruralRef.current) {
      (ruralRef.current.material as THREE.PointsMaterial).size =
        0.055 + Math.sin(clock.elapsedTime * 2) * 0.02;
    }
    if (urbanRef.current) {
      (urbanRef.current.material as THREE.PointsMaterial).size =
        0.045 + Math.sin(clock.elapsedTime * 2.5 + 1) * 0.015;
    }
  });

  const arcs = useMemo(() => {
    const curves: THREE.CatmullRomCurve3[] = [];
    const count = Math.min(ruralPositions.length / 3, urbanPositions.length / 3);
    for (let i = 0; i < count; i++) {
      const start = new THREE.Vector3(ruralPositions[i * 3], ruralPositions[i * 3 + 1], ruralPositions[i * 3 + 2]);
      const end = new THREE.Vector3(urbanPositions[i * 3], urbanPositions[i * 3 + 1], urbanPositions[i * 3 + 2]);
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.45);
      curves.push(new THREE.CatmullRomCurve3([start, mid, end]));
    }
    return curves;
  }, [ruralPositions, urbanPositions]);

  return (
    <>
      <points ref={ruralRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={ruralPositions.length / 3} array={ruralPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#2ECC71" size={0.055} sizeAttenuation transparent opacity={1} />
      </points>
      <points ref={urbanRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={urbanPositions.length / 3} array={urbanPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#3498DB" size={0.045} sizeAttenuation transparent opacity={1} />
      </points>

      {/* Arc lines */}
      {arcs.map((curve, i) => {
        const pts = curve.getPoints(50);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <line key={`arc-${i}`}>
            <primitive object={geo} attach="geometry" />
            <lineBasicMaterial color={i % 2 === 0 ? "#2ECC71" : "#3498DB"} transparent opacity={0.15} />
          </line>
        );
      })}

      {/* Flowing particles along arcs */}
      {arcs.map((curve, i) => (
        <ArcParticle
          key={`particle-${i}`}
          curve={curve}
          speed={0.3 + (i % 3) * 0.1}
          delay={i * 0.4}
          color={i % 2 === 0 ? "#2ECC71" : "#3498DB"}
        />
      ))}
    </>
  );
};

/* ── Hex grid overlay on sphere ── */
const HexGrid = () => {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pts: number[] = [];
    const N = 800;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < N; i++) {
      const theta = Math.acos(1 - (2 * (i + 0.5)) / N);
      const phi = (2 * Math.PI * i) / goldenRatio;
      const r = 1.01;
      pts.push(r * Math.sin(theta) * Math.cos(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.sin(phi));
    }
    return new Float32Array(pts);
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.PointsMaterial).opacity =
        0.06 + Math.sin(clock.elapsedTime * 0.5) * 0.03;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#2ECC71" size={0.008} sizeAttenuation transparent opacity={0.08} />
    </points>
  );
};

/* ── Camera drift ── */
const CameraDrift = () => {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    camera.position.x = Math.sin(t * 0.15) * 0.3;
    camera.position.y = Math.cos(t * 0.1) * 0.2;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

/* ── Globe assembly ── */
const RotatingGlobe = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[0.97, 64, 64]}>
        <meshStandardMaterial color="#061220" transparent opacity={0.98} />
      </Sphere>
      <Sphere args={[1, 48, 48]}>
        <meshBasicMaterial color="#2ECC71" wireframe transparent opacity={0.06} />
      </Sphere>
      <HexGrid />
      <GlobePoints />
      <Atmosphere />
      <EnergyPulse />
      <OrbitRing radius={1.3} speed={0.2} color="#3498DB" tilt={1.1} />
      <OrbitRing radius={1.45} speed={-0.12} color="#2ECC71" tilt={0.7} thickness={0.002} />
      <OrbitRing radius={1.6} speed={0.08} color="#3498DB" tilt={2.0} thickness={0.002} />
      <OrbitDot radius={1.3} speed={0.5} tilt={1.1} color="#3498DB" />
      <OrbitDot radius={1.45} speed={-0.35} tilt={0.7} color="#2ECC71" />
    </group>
  );
};

/* ── Progress bar ── */
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="relative w-56 h-[2px] rounded-full overflow-hidden" style={{ background: "hsl(210 30% 12%)" }}>
    <motion.div
      className="h-full rounded-full"
      style={{
        background: "linear-gradient(90deg, #2ECC71, #3498DB, #2ECC71)",
        backgroundSize: "200% 100%",
      }}
      initial={{ width: "0%" }}
      animate={{
        width: `${progress}%`,
        backgroundPosition: ["0% 0%", "200% 0%"],
      }}
      transition={{
        width: { duration: 0.3, ease: "easeOut" },
        backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
      }}
    />
    {/* Glow at the tip */}
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
      style={{
        background: "radial-gradient(circle, hsl(145 63% 49% / 0.6), transparent 70%)",
        left: `${Math.min(progress, 100)}%`,
        transform: "translate(-50%, -50%)",
      }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  </div>
);

/* ── Status text with typing effect ── */
const statusMessages = [
  "Connecting sensors...",
  "Analyzing climate data...",
  "Mapping agricultural zones...",
  "Processing satellite imagery...",
  "Calibrating AI models...",
  "Launching ecosystem...",
];

const getStatus = (progress: number) => {
  const idx = Math.min(Math.floor(progress / 18), statusMessages.length - 1);
  return statusMessages[idx];
};

/* ── Main component ── */
const LoadingAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const completeCalled = useRef(false);

  const stableOnComplete = useCallback(onComplete, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(p + Math.random() * 6 + 1.5, 100);
      });
    }, 180);

    const timeout = setTimeout(() => {
      if (!completeCalled.current) {
        completeCalled.current = true;
        stableOnComplete();
      }
    }, 4200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [stableOnComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, hsl(210 50% 8%) 0%, hsl(210 60% 2%) 100%)",
      }}
    >
      {/* Dual ambient glows */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(145 63% 49% / 0.05) 0%, transparent 60%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, hsl(207 70% 53% / 0.04) 0%, transparent 60%)",
          top: "45%",
          left: "45%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Globe */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotateX: 15 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[450px] md:h-[450px]"
      >
        <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }} dpr={[1, 2]}>
          <ambientLight intensity={0.15} />
          <pointLight position={[3, 3, 5]} intensity={0.7} color="#3498DB" />
          <pointLight position={[-3, -2, 4]} intensity={0.5} color="#2ECC71" />
          <pointLight position={[0, 5, 2]} intensity={0.2} color="#ffffff" />
          <directionalLight position={[1, 2, 3]} intensity={0.1} color="#2ECC71" />
          <Stars />
          <RotatingGlobe />
          <CameraDrift />
        </Canvas>
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 text-center flex flex-col items-center gap-2"
      >
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-gradient-hero"
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          AgriSphere
        </motion.h2>

        <p
          className="text-[10px] sm:text-xs tracking-[0.25em] uppercase font-light"
          style={{ color: "hsl(210 15% 50%)" }}
        >
          Smart Agricultural Intelligence System
        </p>

        <div className="mt-5">
          <ProgressBar progress={Math.min(progress, 100)} />
        </div>

        <motion.p
          key={getStatus(progress)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-[10px] sm:text-[11px] mt-2 tracking-wider font-light"
          style={{ color: "hsl(145 50% 45% / 0.7)" }}
        >
          {getStatus(progress)}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingAnimation;
