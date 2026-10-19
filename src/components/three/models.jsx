import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

// Soft-clay palette, matched to the app's tokens
const C = {
  canopy: "#14806c",
  canopyLight: "#33c29f",
  leaf: "#3fae6e",
  leafDark: "#23774f",
  grass: "#8fd19e",
  signal: "#f2b705",
  hydrant: "#e0533f",
  sky: "#7cc1d9",
  stone: "#eef2ee",
  paper: "#fbfbf7",
  asphalt: "#34474d",
  wood: "#c98a55",
  woodDark: "#8f5a33",
  soil: "#7a5236",
  metal: "#b9c4c8",
  ink: "#1f2b30",
  cone: "#f26b3a",
};

const Clay = ({ color, rough = 0.55, metal = 0, ...rest }) => (
  <meshStandardMaterial color={color} roughness={rough} metalness={metal} {...rest} />
);

/* ── Issues: traffic cone, warning sign and a pothole on a road slab ───── */
export function IssuesModel({ animate }) {
  const sign = useRef();
  useFrame(({ clock }) => {
    if (animate && sign.current) sign.current.rotation.z = Math.sin(clock.elapsedTime * 1.6) * 0.06;
  });
  // radius of the cone at height h (0 = base, 1.3 = tip)
  const r = (h) => 0.44 - (0.36 * h) / 1.3;
  return (
    <group rotation={[0.08, -0.45, 0]}>
      <RoundedBox args={[3.6, 0.28, 2.3]} radius={0.1} position={[0, -1.05, 0]}>
        <Clay color={C.asphalt} />
      </RoundedBox>
      {[-1.2, 0, 1.2].map((x) => (
        <mesh key={x} position={[x, -0.9, 0.85]}>
          <boxGeometry args={[0.6, 0.02, 0.1]} />
          <Clay color={C.signal} />
        </mesh>
      ))}
      <mesh position={[0.7, -0.905, -0.25]}>
        <cylinderGeometry args={[0.42, 0.42, 0.02, 40]} />
        <Clay color="#1c272b" />
      </mesh>

      {/* cone */}
      <group position={[-0.7, -0.9, 0.1]}>
        <RoundedBox args={[1.05, 0.12, 1.05]} radius={0.04} position={[0, 0.06, 0]}>
          <Clay color={C.cone} />
        </RoundedBox>
        <mesh position={[0, 0.77, 0]}>
          <cylinderGeometry args={[r(1.3), r(0), 1.3, 40]} />
          <Clay color={C.cone} />
        </mesh>
        {[0.35, 0.75].map((h) => (
          <mesh key={h} position={[0, 0.12 + h, 0]}>
            <cylinderGeometry args={[r(h + 0.09) + 0.006, r(h - 0.09) + 0.006, 0.18, 40]} />
            <Clay color={C.paper} />
          </mesh>
        ))}
      </group>

      {/* warning sign */}
      <group position={[1.15, -0.9, 0.2]}>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 1.7, 16]} />
          <Clay color={C.metal} rough={0.35} metal={0.4} />
        </mesh>
        <group ref={sign} position={[0, 1.75, 0.06]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.07, 3]} />
            <Clay color={C.signal} />
          </mesh>
          <mesh position={[0, 0.04, 0.045]}>
            <boxGeometry args={[0.08, 0.32, 0.02]} />
            <Clay color={C.ink} />
          </mesh>
          <mesh position={[0, -0.2, 0.045]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <Clay color={C.ink} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ── Cleanups: grass island, recycling bin, tree, trash bag ──────────── */
export function CleanupModel({ animate }) {
  const lid = useRef();
  useFrame(({ clock }) => {
    if (!animate || !lid.current) return;
    const t = (clock.elapsedTime % 3.2) / 3.2;
    const hop = t < 0.18 ? Math.sin((t / 0.18) * Math.PI) : 0;
    lid.current.position.y = 0.58 + hop * 0.22;
    lid.current.rotation.z = hop * 0.25;
  });
  return (
    <group rotation={[0.12, -0.5, 0]}>
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[1.85, 1.95, 0.32, 56]} />
        <Clay color={C.grass} />
      </mesh>
      <mesh position={[0, -1.25, 0]}>
        <cylinderGeometry args={[1.95, 1.75, 0.18, 56]} />
        <Clay color={C.soil} />
      </mesh>

      {/* bin */}
      <group position={[-0.55, -0.4, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.48, 0.4, 1.05, 36]} />
          <Clay color={C.canopy} />
        </mesh>
        <group ref={lid} position={[0, 0.58, 0]}>
          <mesh>
            <cylinderGeometry args={[0.53, 0.53, 0.1, 36]} />
            <Clay color={C.canopyLight} />
          </mesh>
          <mesh position={[0, 0.09, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.12, 0.03, 10, 24, Math.PI]} />
            <Clay color={C.canopyLight} />
          </mesh>
        </group>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[Math.cos((i * 2 * Math.PI) / 3 + Math.PI / 2) * 0.13, 0.05 + Math.sin((i * 2 * Math.PI) / 3 + Math.PI / 2) * 0.13, 0.45]} rotation={[0, 0, (i * 2 * Math.PI) / 3]}>
            <boxGeometry args={[0.2, 0.05, 0.02]} />
            <Clay color={C.paper} />
          </mesh>
        ))}
      </group>

      {/* tree */}
      <group position={[0.85, -0.9, -0.45]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.09, 0.12, 0.7, 12]} />
          <Clay color={C.woodDark} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.95 + i * 0.42, 0]}>
            <coneGeometry args={[0.7 - i * 0.17, 0.75, 20]} />
            <Clay color={i % 2 ? C.leaf : C.leafDark} />
          </mesh>
        ))}
      </group>

      {/* trash bag */}
      <group position={[0.55, -0.68, 0.75]}>
        <mesh scale={[1, 0.85, 1]}>
          <sphereGeometry args={[0.32, 24, 24]} />
          <Clay color="#2d3a40" rough={0.35} />
        </mesh>
        <mesh position={[0, 0.32, 0]}>
          <coneGeometry args={[0.08, 0.16, 12]} />
          <Clay color="#2d3a40" rough={0.35} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Polls: ballot box with a ticked ballot sliding in ───────────────── */
export function PollsModel({ animate }) {
  const ballot = useRef();
  useFrame(({ clock }) => {
    if (!ballot.current) return;
    const t = animate ? (clock.elapsedTime % 3) / 3 : 0.2;
    const down = Math.min(1, Math.max(0, (t - 0.25) / 0.45));
    ballot.current.position.y = 1.35 - down * 0.85;
    ballot.current.visible = t < 0.72;
  });
  return (
    <group rotation={[0.18, -0.55, 0]}>
      <RoundedBox args={[1.9, 1.35, 1.4]} radius={0.12} position={[0, -0.45, 0]}>
        <Clay color={C.stone} />
      </RoundedBox>
      <RoundedBox args={[1.94, 0.3, 1.44]} radius={0.06} position={[0, -0.75, 0]}>
        <Clay color={C.canopy} />
      </RoundedBox>
      <mesh position={[0, 0.235, 0]}>
        <boxGeometry args={[1.0, 0.03, 0.12]} />
        <Clay color={C.ink} />
      </mesh>
      {/* tick on the front */}
      <group position={[0, -0.25, 0.71]}>
        <mesh position={[-0.11, -0.05, 0]} rotation={[0, 0, -0.8]}>
          <boxGeometry args={[0.24, 0.08, 0.04]} />
          <Clay color={C.signal} />
        </mesh>
        <mesh position={[0.1, 0.07, 0]} rotation={[0, 0, 0.9]}>
          <boxGeometry args={[0.46, 0.08, 0.04]} />
          <Clay color={C.signal} />
        </mesh>
      </group>
      {/* ballot paper */}
      <group ref={ballot} position={[0, 1.35, 0]}>
        <mesh>
          <boxGeometry args={[0.9, 0.62, 0.02]} />
          <Clay color={C.paper} />
        </mesh>
        {[0.14, -0.04, -0.2].map((y, i) => (
          <mesh key={y} position={[-0.25, y, 0.012]}>
            <boxGeometry args={[0.1, 0.1, 0.01]} />
            <Clay color={i === 0 ? C.canopy : "#d5ddd8"} />
          </mesh>
        ))}
        {[0.14, -0.04, -0.2].map((y) => (
          <mesh key={`l${y}`} position={[0.1, y, 0.012]}>
            <boxGeometry args={[0.45, 0.04, 0.01]} />
            <Clay color="#d5ddd8" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── Animals: doghouse, bowl and a bone ──────────────────────────────── */
export function AnimalsModel({ animate }) {
  const bone = useRef();
  useFrame((_, dt) => {
    if (animate && bone.current) bone.current.rotation.y += dt * 0.9;
  });
  return (
    <group rotation={[0.12, -0.5, 0]}>
      <mesh position={[0, -1.12, 0]}>
        <cylinderGeometry args={[1.9, 2, 0.22, 48]} />
        <Clay color={C.grass} />
      </mesh>
      <group position={[-0.25, -0.4, -0.15]}>
        <RoundedBox args={[1.55, 1.15, 1.35]} radius={0.06}>
          <Clay color={C.wood} />
        </RoundedBox>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.42, 0.86, 0]} rotation={[0, 0, -s * 0.62]}>
            <boxGeometry args={[1.08, 0.12, 1.55]} />
            <Clay color={C.hydrant} />
          </mesh>
        ))}
        <mesh position={[0, -0.18, 0.68]}>
          <cylinderGeometry args={[0.3, 0.3, 0.02, 32, 1, false, -Math.PI / 2, Math.PI]} />
          <Clay color="#3a2a1f" />
        </mesh>
        <mesh position={[0, -0.36, 0.68]}>
          <boxGeometry args={[0.6, 0.36, 0.02]} />
          <Clay color="#3a2a1f" />
        </mesh>
        <mesh position={[0, 0.6, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.03, 24]} />
          <Clay color={C.signal} />
        </mesh>
      </group>
      {/* bowl */}
      <group position={[0.95, -0.92, 0.65]}>
        <mesh>
          <cylinderGeometry args={[0.36, 0.26, 0.2, 28]} />
          <Clay color={C.canopy} />
        </mesh>
        {[[-0.1, 0], [0.1, 0.06], [0, -0.1]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.11, z]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <Clay color={C.woodDark} />
          </mesh>
        ))}
      </group>
      {/* bone */}
      <group ref={bone} position={[0.95, 0.15, 0.6]} rotation={[0.3, 0, 0.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.6, 16]} />
          <Clay color={C.paper} />
        </mesh>
        {[[-0.3, 0.07], [-0.3, -0.07], [0.3, 0.07], [0.3, -0.07]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <Clay color={C.paper} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── Lost & found: a magnifying glass circling a key and a wallet ────── */
export function LostFoundModel({ animate }) {
  const glass = useRef();
  useFrame(({ clock }) => {
    if (!glass.current) return;
    const t = animate ? clock.elapsedTime * 0.7 : 0.6;
    glass.current.position.x = Math.cos(t) * 0.55;
    glass.current.position.z = 0.4 + Math.sin(t) * 0.35;
  });
  return (
    <group rotation={[0.25, -0.35, 0]}>
      <RoundedBox args={[3.2, 0.2, 2.2]} radius={0.08} position={[0, -1.1, 0]}>
        <Clay color="#e3eae5" />
      </RoundedBox>
      {/* wallet */}
      <group position={[-0.65, -0.88, -0.1]} rotation={[0, 0.4, 0]}>
        <RoundedBox args={[1.05, 0.22, 0.75]} radius={0.06}>
          <Clay color={C.woodDark} />
        </RoundedBox>
        <mesh position={[0.36, 0.05, 0]}>
          <boxGeometry args={[0.35, 0.16, 0.6]} />
          <Clay color={C.wood} />
        </mesh>
        <mesh position={[0.52, 0.05, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <Clay color={C.signal} metal={0.5} rough={0.3} />
        </mesh>
      </group>
      {/* key */}
      <group position={[0.75, -0.97, 0.25]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <mesh>
          <torusGeometry args={[0.2, 0.06, 12, 28]} />
          <Clay color={C.signal} metal={0.5} rough={0.3} />
        </mesh>
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 0.62, 12]} />
          <Clay color={C.signal} metal={0.5} rough={0.3} />
        </mesh>
        {[0.6, 0.72].map((x) => (
          <mesh key={x} position={[x, -0.08, 0]}>
            <boxGeometry args={[0.06, 0.12, 0.06]} />
            <Clay color={C.signal} metal={0.5} rough={0.3} />
          </mesh>
        ))}
      </group>
      {/* magnifying glass */}
      <group ref={glass} position={[0, 0.25, 0.4]} rotation={[-0.35, 0, 0.35]}>
        <mesh>
          <torusGeometry args={[0.62, 0.09, 18, 56]} />
          <Clay color={C.canopy} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.04, 48]} />
          <meshStandardMaterial color={C.sky} transparent opacity={0.35} roughness={0.05} />
        </mesh>
        <mesh position={[0.72, -0.72, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.09, 0.11, 0.85, 16]} />
          <Clay color={C.ink} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Notices: corkboard with pinned notes and a megaphone ────────────── */
export function NoticesModel({ animate }) {
  const rings = useRef([]);
  useFrame(({ clock }) => {
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const t = animate ? ((clock.elapsedTime * 0.8 + i / 3) % 1) : 0.4 + i * 0.2;
      ring.scale.setScalar(0.6 + t * 1.2);
      ring.material.opacity = 0.75 * (1 - t);
    });
  });
  const notes = [
    { p: [-0.62, 0.32], s: [0.7, 0.55], c: C.paper, r: -0.06, pin: C.hydrant },
    { p: [0.25, 0.36], s: [0.6, 0.5], c: "#fff1b8", r: 0.05, pin: C.canopy },
    { p: [-0.25, -0.28], s: [0.75, 0.45], c: "#d9f0f7", r: 0.04, pin: C.signal },
    { p: [0.62, -0.25], s: [0.45, 0.5], c: C.paper, r: -0.08, pin: C.hydrant },
  ];
  return (
    <group rotation={[0.05, -0.35, 0]}>
      <group position={[0.35, 0.05, -0.3]}>
        <RoundedBox args={[2.5, 1.75, 0.14]} radius={0.06}>
          <Clay color={C.woodDark} />
        </RoundedBox>
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[2.25, 1.5, 0.02]} />
          <Clay color="#d9a86c" rough={0.9} />
        </mesh>
        {notes.map((n, i) => (
          <group key={i} position={[n.p[0], n.p[1], 0.095]} rotation={[0, 0, n.r]}>
            <mesh>
              <boxGeometry args={[n.s[0], n.s[1], 0.012]} />
              <Clay color={n.c} />
            </mesh>
            {[0.1, -0.02, -0.12].map((y) => (
              <mesh key={y} position={[0, y, 0.008]}>
                <boxGeometry args={[n.s[0] * 0.7, 0.03, 0.004]} />
                <Clay color="#c9d2cd" />
              </mesh>
            ))}
            <mesh position={[0, n.s[1] / 2 - 0.06, 0.03]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <Clay color={n.pin} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -1.25, -0.05]}>
          <boxGeometry args={[0.12, 0.8, 0.12]} />
          <Clay color={C.woodDark} />
        </mesh>
      </group>
      {/* megaphone */}
      <group position={[-1.15, -0.55, 0.55]} rotation={[0, 0.5, 0.25]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.16, 0.42, 0.8, 32, 1, true]} />
          <meshStandardMaterial color={C.signal} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[-0.44, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.17, 0.17, 0.14, 24]} />
          <Clay color={C.ink} />
        </mesh>
        <mesh position={[-0.25, -0.25, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.1, 0.32, 0.1]} />
          <Clay color={C.ink} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} ref={(el) => (rings.current[i] = el)} position={[0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.45, 0.025, 8, 40]} />
            <meshBasicMaterial color={C.signal} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── NGOs: a community hall under a beating heart ────────────────────── */
function useHeartGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.55);
    s.bezierCurveTo(-0.15, -0.38, -0.7, -0.15, -0.7, 0.2);
    s.bezierCurveTo(-0.7, 0.55, -0.25, 0.65, 0, 0.35);
    s.bezierCurveTo(0.25, 0.65, 0.7, 0.55, 0.7, 0.2);
    s.bezierCurveTo(0.7, -0.15, 0.15, -0.38, 0, -0.55);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 6, curveSegments: 24 });
    g.center();
    return g;
  }, []);
}

export function NgoModel({ animate }) {
  const heart = useRef();
  const geometry = useHeartGeometry();
  useFrame(({ clock }) => {
    if (!heart.current) return;
    const t = clock.elapsedTime;
    const beat = animate ? 1 + Math.max(0, Math.sin(t * 5)) ** 8 * 0.12 : 1;
    heart.current.scale.setScalar(beat);
    if (animate) heart.current.rotation.y = Math.sin(t * 0.6) * 0.5;
  });
  return (
    <group rotation={[0.12, -0.4, 0]}>
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[1.7, 1.8, 0.22, 48]} />
        <Clay color={C.grass} />
      </mesh>
      <group position={[0, -0.62, 0]}>
        <RoundedBox args={[1.9, 0.85, 1.2]} radius={0.05}>
          <Clay color={C.stone} />
        </RoundedBox>
        <mesh position={[0, 0.62, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.32, 0.45, 4]} />
          <Clay color={C.canopy} />
        </mesh>
        {[-0.55, 0, 0.55].map((x) => (
          <mesh key={x} position={[x, -0.05, 0.61]}>
            <boxGeometry args={[0.28, x === 0 ? 0.55 : 0.32, 0.02]} />
            <Clay color={x === 0 ? C.woodDark : C.sky} />
          </mesh>
        ))}
      </group>
      <group ref={heart} position={[0, 0.85, 0]}>
        <mesh geometry={geometry} rotation={[0, 0, 0]}>
          <Clay color={C.hydrant} rough={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Volunteers: shovel, sapling and watering can ────────────────────── */
export function VolunteersModel({ animate }) {
  const sapling = useRef();
  useFrame(({ clock }) => {
    if (animate && sapling.current) sapling.current.rotation.z = Math.sin(clock.elapsedTime * 1.4) * 0.08;
  });
  return (
    <group rotation={[0.14, -0.45, 0]}>
      <mesh position={[0, -1.12, 0]}>
        <cylinderGeometry args={[1.85, 1.95, 0.24, 48]} />
        <Clay color={C.grass} />
      </mesh>
      <mesh position={[-0.15, -0.95, 0]} scale={[1.1, 0.42, 0.9]}>
        <sphereGeometry args={[0.75, 32, 24]} />
        <Clay color={C.soil} rough={0.9} />
      </mesh>
      {/* sapling */}
      <group ref={sapling} position={[-0.15, -0.68, 0.1]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.035, 0.05, 0.8, 10]} />
          <Clay color={C.leafDark} />
        </mesh>
        {[[-0.2, 0.62, -0.5], [0.22, 0.8, 0.5], [-0.05, 0.98, -0.1]].map(([x, y, r], i) => (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, r]} scale={[1, 0.5, 0.6]}>
            <sphereGeometry args={[0.26, 18, 14]} />
            <Clay color={i === 1 ? C.leaf : C.canopyLight} />
          </mesh>
        ))}
      </group>
      {/* shovel */}
      <group position={[0.75, -0.35, -0.35]} rotation={[0.1, 0, -0.32]}>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.5, 12]} />
          <Clay color={C.wood} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <torusGeometry args={[0.13, 0.035, 10, 24]} />
          <Clay color={C.ink} />
        </mesh>
        <RoundedBox args={[0.42, 0.55, 0.06]} radius={0.04} position={[0, -0.42, 0]}>
          <Clay color={C.metal} rough={0.3} metal={0.6} />
        </RoundedBox>
      </group>
      {/* watering can */}
      <group position={[-1.15, -0.72, 0.6]} rotation={[0, 0.6, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.32, 0.48, 28]} />
          <Clay color={C.sky} />
        </mesh>
        <mesh position={[0.38, 0.12, 0]} rotation={[0, 0, -0.9]}>
          <cylinderGeometry args={[0.04, 0.06, 0.55, 12]} />
          <Clay color={C.sky} />
        </mesh>
        <mesh position={[-0.05, 0.3, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.2, 0.035, 10, 24, Math.PI]} />
          <Clay color="#4f97b0" />
        </mesh>
      </group>
    </group>
  );
}

/* ── Leaderboard: a trophy ───────────────────────────────────────────── */
export function TrophyModel({ animate }) {
  const cup = useRef();
  const lathe = useMemo(() => {
    const pts = [
      [0, 0], [0.2, 0], [0.2, 0.08], [0.09, 0.14], [0.08, 0.5], [0.16, 0.6],
      [0.45, 0.78], [0.62, 1.12], [0.66, 1.42], [0.6, 1.44], [0.55, 1.15], [0, 1.05],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 48);
  }, []);
  useFrame((_, dt) => {
    if (animate && cup.current) cup.current.rotation.y += dt * 0.5;
  });
  const gold = { color: C.signal, rough: 0.28, metal: 0.55 };
  return (
    <group position={[0, -0.25, 0]}>
      <RoundedBox args={[1.25, 0.36, 1.25]} radius={0.06} position={[0, -0.95, 0]}>
        <Clay color={C.canopy} />
      </RoundedBox>
      <RoundedBox args={[0.9, 0.18, 0.9]} radius={0.04} position={[0, -0.69, 0]}>
        <Clay color={C.canopyLight} />
      </RoundedBox>
      <group ref={cup} position={[0, -0.6, 0]}>
        <mesh geometry={lathe}>
          <meshStandardMaterial color={gold.color} roughness={gold.rough} metalness={gold.metal} side={THREE.DoubleSide} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.68, 1.12, 0]} rotation={[0, 0, s * 0.2]}>
            <torusGeometry args={[0.22, 0.05, 12, 28, Math.PI * 1.3]} />
            <Clay color={gold.color} rough={gold.rough} metal={gold.metal} />
          </mesh>
        ))}
        <mesh position={[0, 0.9, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.03, 5]} />
          <Clay color={C.paper} />
        </mesh>
      </group>
    </group>
  );
}
