import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import jungleBackground from './assets/image.png';
import crashWide from './assets/Destroços1.jpeg';
import crashWideBackdrop from './assets/Destroços1 copy.jpeg';
import crashCabin from './assets/destroços2.png';
import crashTail from './assets/destroços3.png';
import crashCollage from './assets/destroços4.png';
import ivanPortrait from './assets/personagem-ivan.png';
import './App.css';

const crashFrames = [crashWide, crashCabin, crashTail, crashCollage];
const crashCaptions = [
  'O impacto',
  'A cabine se rompe',
  'A floresta engole os destroços',
  'Silêncio depois da queda',
];
const treePlacements = [
  [-8, 0, -7, 1.2], [-5, 0, -10, 0.9], [-1, 0, -11, 1.1], [4, 0, -10, 1.1],
  [8, 0, -7, 1.2], [-9, 0, -1, 0.9], [9, 0, 1, 0.95], [-8, 0, 7, 1.1],
  [-4, 0, 9, 0.9], [2, 0, 10, 1.1], [7, 0, 8, 1.2], [11, 0, 5, 0.9],
];
const snakePlacements = [[4.4, 0, 1.8], [-4.7, 0, -3.4]];
const axePosition = [2.4, 0, 1.9];
const bagPlacements = [[3.5, 0, 2.8], [-1.4, 0, 3.1]];
const bagLoot = [{ tecido: 2, comida: 1 }, { tecido: 1, comida: 2 }];
const collisionZones = [
  ...treePlacements.map(([x, , z, scale], treeIndex) => ({ x, z, radius: 0.38 * scale, treeIndex })),
  { x: -4.5, z: 1.1, halfX: 4, halfZ: 1.25 },
  { x: -1.7, z: -2.4, halfX: 2.1, halfZ: 1.05 },
  { x: 2.8, z: 1.2, halfX: 1.15, halfZ: 0.52 },
  { x: 0, z: 0, radius: 0.62 },
  { x: axePosition[0], z: axePosition[2], radius: 0.28 },
  ...bagPlacements.map(([x, , z]) => ({ x, z, radius: 0.55 })),
];

function resolvePlayerPosition(position, deltaX, deltaZ, choppedTrees = [], snakes = []) {
  let x = Math.max(-13, Math.min(13, position.x + deltaX));
  let z = Math.max(-13, Math.min(13, position.z + deltaZ));
  const activeZones = [
    ...collisionZones.filter((zone) => zone.treeIndex === undefined || !choppedTrees.includes(zone.treeIndex)),
    ...snakes.map(({ x: snakeX, z: snakeZ }) => ({ x: snakeX, z: snakeZ, radius: 0.4 })),
  ];
  const playerRadius = 0.32;

  activeZones.forEach((zone) => {
    if (zone.halfX !== undefined) {
      const halfX = zone.halfX + playerRadius;
      const halfZ = zone.halfZ + playerRadius;
      if (Math.abs(position.z - zone.z) < halfZ && x > zone.x - halfX && x < zone.x + halfX) {
        x = deltaX >= 0 ? Math.max(position.x, zone.x - halfX) : Math.min(position.x, zone.x + halfX);
      }
    } else {
      const offsetZ = position.z - zone.z;
      const radius = zone.radius + playerRadius;
      if (Math.abs(offsetZ) < radius) {
        const halfChord = Math.sqrt(radius * radius - offsetZ * offsetZ);
        const leftEdge = zone.x - halfChord;
        const rightEdge = zone.x + halfChord;
        if (deltaX > 0 && position.x <= rightEdge && x > rightEdge) x = rightEdge;
        if (deltaX < 0 && position.x >= leftEdge && x < leftEdge) x = leftEdge;
      }
    }
  });

  activeZones.forEach((zone) => {
    if (zone.halfZ !== undefined) {
      const halfX = zone.halfX + playerRadius;
      const halfZ = zone.halfZ + playerRadius;
      if (Math.abs(x - zone.x) < halfX && z > zone.z - halfZ && z < zone.z + halfZ) {
        z = deltaZ >= 0 ? Math.max(position.z, zone.z - halfZ) : Math.min(position.z, zone.z + halfZ);
      }
    } else {
      const offsetX = x - zone.x;
      const radius = zone.radius + playerRadius;
      if (Math.abs(offsetX) < radius) {
        const halfChord = Math.sqrt(radius * radius - offsetX * offsetX);
        const nearEdge = zone.z - halfChord;
        const farEdge = zone.z + halfChord;
        if (deltaZ > 0 && position.z <= farEdge && z > farEdge) z = farEdge;
        if (deltaZ < 0 && position.z >= nearEdge && z < nearEdge) z = nearEdge;
      }
    }
  });

  return { x, z };
}

function CadeiraAviao() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.68, 0]} castShadow>
        <boxGeometry args={[0.9, 0.14, 0.85]} />
        <meshStandardMaterial color="#423d32" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.12, -0.35]} rotation={[-0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.9, 1.1, 0.16]} />
        <meshStandardMaterial color="#4c483c" roughness={0.9} />
      </mesh>
      {[-0.34, 0.34].map((x) => (
        <mesh key={x} position={[x, 0.32, 0]} castShadow>
          <boxGeometry args={[0.09, 0.7, 0.1]} />
          <meshStandardMaterial color="#343a35" metalness={0.42} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.9, 0.13]}>
        <boxGeometry args={[1.35, 0.08, 0.08]} />
        <meshStandardMaterial color="#596057" metalness={0.5} roughness={0.55} />
      </mesh>
    </group>
  );
}

function AxeModel({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.34, 0]} castShadow><boxGeometry args={[0.12, 0.86, 0.12]} /><meshStandardMaterial color="#70462d" roughness={0.9} /></mesh>
      <mesh position={[0.2, 0.64, 0]} castShadow><boxGeometry args={[0.44, 0.3, 0.16]} /><meshStandardMaterial color="#aeb5a6" metalness={0.72} roughness={0.32} /></mesh>
      <mesh position={[0.12, 0.64, 0]} castShadow><boxGeometry args={[0.12, 0.34, 0.18]} /><meshStandardMaterial color="#505750" metalness={0.55} roughness={0.4} /></mesh>
    </group>
  );
}

function MalaSuprimentos({ position, aberta, loot }) {
  const lidRef = useRef();

  useFrame((_, delta) => {
    if (lidRef.current) {
      const target = aberta ? -1.15 : 0;
      lidRef.current.rotation.x += (target - lidRef.current.rotation.x) * (1 - Math.exp(-delta * 5));
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]} castShadow><boxGeometry args={[0.95, 0.55, 0.62]} /><meshStandardMaterial color="#5a4930" roughness={0.9} /></mesh>
      <mesh position={[0, 0.32, 0.32]}><boxGeometry args={[0.82, 0.08, 0.035]} /><meshStandardMaterial color="#b69b5a" metalness={0.35} roughness={0.55} /></mesh>
      <group ref={lidRef} position={[0, 0.6, -0.29]}>
        <mesh position={[0, 0.1, 0.29]} castShadow><boxGeometry args={[0.95, 0.2, 0.62]} /><meshStandardMaterial color="#705936" roughness={0.88} /></mesh>
      </group>
      {aberta && (
        <group position={[0, 0.62, 0]}>
          {loot.tecido > 0 && <mesh position={[-0.18, 0.12, 0]} castShadow><boxGeometry args={[0.28, 0.16, 0.25]} /><meshStandardMaterial color="#a94c3e" roughness={1} /></mesh>}
          {loot.comida > 0 && <mesh position={[0.18, 0.13, 0.04]} castShadow><boxGeometry args={[0.2, 0.2, 0.2]} /><meshStandardMaterial color="#c4964e" roughness={0.8} /></mesh>}
        </group>
      )}
    </group>
  );
}

function Cobra({ id, position, playerPositionRef, snakePositionRef, commandRef, health, active, onAttack, onHiss }) {
  const rootRef = useRef();
  const headRef = useRef();
  const bloodRef = useRef();
  const behavior = useRef('idle');
  const timer = useRef(0);
  const bloodTimer = useRef(0);
  const coil = useRef(0);

  useFrame((_, delta) => {
    if (!rootRef.current || health <= 0 || !active) return;
    const player = playerPositionRef.current;
    snakePositionRef.current[id] = { x: rootRef.current.position.x, z: rootRef.current.position.z };
    const dx = player.x - rootRef.current.position.x;
    const dz = player.z - rootRef.current.position.z;
    const distance = Math.hypot(dx, dz);
    timer.current -= delta;
    bloodTimer.current = Math.max(0, bloodTimer.current - delta);
    if (bloodRef.current) bloodRef.current.visible = bloodTimer.current > 0;

    if (commandRef.current[id] === 'hit') {
      delete commandRef.current[id];
      behavior.current = 'flee';
      timer.current = 1.3;
      bloodTimer.current = 0.55;
    }

    if (behavior.current === 'idle' && distance < 4.3) {
      behavior.current = 'warning';
      timer.current = 0.85;
      onHiss(id);
    } else if (behavior.current === 'warning' && distance > 5.2) {
      behavior.current = 'idle';
    } else if (behavior.current === 'warning' && timer.current <= 0) {
      behavior.current = 'strike';
      timer.current = 0.42;
      if (distance < 1.9) onAttack(id);
    } else if (behavior.current === 'strike' && timer.current <= 0) {
      behavior.current = 'flee';
      timer.current = 1.3;
    } else if (behavior.current === 'flee') {
      const safeDistance = distance || 1;
      rootRef.current.position.x = Math.max(-13, Math.min(13, rootRef.current.position.x - (dx / safeDistance) * delta * 1.5));
      rootRef.current.position.z = Math.max(-13, Math.min(13, rootRef.current.position.z - (dz / safeDistance) * delta * 1.5));
      if (timer.current <= 0 || distance > 6) {
        behavior.current = 'recover';
        timer.current = 1.1;
      }
    } else if (behavior.current === 'recover' && timer.current <= 0) {
      behavior.current = 'idle';
    }

    const towardPlayer = Math.atan2(dx, dz);
    rootRef.current.rotation.y += (towardPlayer - rootRef.current.rotation.y) * (1 - Math.exp(-delta * 5));
    const coiling = behavior.current === 'warning' || behavior.current === 'recover';
    coil.current += ((coiling ? 1 : 0) - coil.current) * (1 - Math.exp(-delta * 7));
    if (headRef.current) {
      const striking = behavior.current === 'strike';
      headRef.current.position.y = 0.28 + coil.current * 0.42 + (striking ? 0.12 : 0);
      headRef.current.position.z = 0.48 + (striking ? 0.62 : 0);
      headRef.current.rotation.x = striking ? 0.25 : -coil.current * 0.12;
    }
  });

  return (
    <group ref={rootRef} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} castShadow>
        <torusGeometry args={[0.34, 0.11, 6, 14]} />
        <meshStandardMaterial color="#62783c" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.15, 0.16]} rotation={[0.6, 0, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.42, 4, 8]} />
        <meshStandardMaterial color="#748e43" roughness={0.75} />
      </mesh>
      <group ref={headRef} position={[0, 0.28, 0.48]}>
        <mesh castShadow><boxGeometry args={[0.32, 0.22, 0.3]} /><meshStandardMaterial color="#78944a" roughness={0.75} /></mesh>
        <mesh position={[-0.1, 0.02, 0.15]}><sphereGeometry args={[0.035, 8, 6]} /><meshStandardMaterial color="#e0bb58" emissive="#8c501d" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0.1, 0.02, 0.15]}><sphereGeometry args={[0.035, 8, 6]} /><meshStandardMaterial color="#e0bb58" emissive="#8c501d" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0, -0.1, 0.22]}><coneGeometry args={[0.045, 0.14, 5]} /><meshStandardMaterial color="#e8dfc7" /></mesh>
      </group>
      <group ref={bloodRef} visible={false} position={[0, 0.12, 0.65]}>
        <mesh><sphereGeometry args={[0.18, 8, 6]} /><meshBasicMaterial color="#8f251e" transparent opacity={0.78} /></mesh>
        <mesh position={[0.25, 0, -0.14]} scale={[1.3, 0.7, 0.7]}><sphereGeometry args={[0.12, 8, 6]} /><meshBasicMaterial color="#a63227" transparent opacity={0.7} /></mesh>
      </group>
      <mesh position={[0, 0.19, -0.16]}><sphereGeometry args={[0.055, 8, 6]} /><meshStandardMaterial color="#d5bf71" roughness={1} /></mesh>
    </group>
  );
}

function Ivan({ inputRef, stage, attempts, staminaRef, onStaminaCost, playerPositionRef, snakePositionRef, choppedTrees, hasAxe }) {
  const rootRef = useRef();
  const torsoRef = useRef();
  const headRef = useRef();
  const beltRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const wakeProgress = useRef(0);
  const beltProgress = useRef(0);
  const jumpVelocity = useRef(0);
  const hasReleasedChair = useRef(false);
  const stepClock = useRef(0);
  const attackMotion = useRef(0);

  useFrame((state, delta) => {
    if (!rootRef.current) return;

    const awake = stage !== 'queda';
    wakeProgress.current += ((awake ? 1 : 0) - wakeProgress.current) * (1 - Math.exp(-delta * 0.55));

    if (torsoRef.current) {
      const standing = stage === 'livre';
      torsoRef.current.rotation.x = (0.38 - wakeProgress.current * 0.35) * (standing ? 0 : 1);
      torsoRef.current.position.y = (standing ? 1.38 : 1.12) + Math.sin(state.clock.elapsedTime * 1.1) * 0.018 * wakeProgress.current;
    }
    if (headRef.current) {
      headRef.current.rotation.x = 0.55 - wakeProgress.current * 0.52;
      headRef.current.rotation.y = awake ? Math.sin(state.clock.elapsedTime * 0.65) * 0.42 : 0;
    }

    const input = inputRef.current;
    const walking = stage === 'livre';
    if (walking && !hasReleasedChair.current) {
      rootRef.current.position.x = 0.95;
      rootRef.current.position.z = 0.65;
      hasReleasedChair.current = true;
    } else if (!walking) {
      hasReleasedChair.current = false;
    }

    if (walking) {
      const horizontal = Number(input.right) - Number(input.left);
      const depth = Number(input.forward) - Number(input.backward);
      const length = Math.hypot(horizontal, depth) || 1;
      const moving = Boolean(horizontal || depth);
      const speed = staminaRef.current > 0 ? 2.5 : 0;
      const next = resolvePlayerPosition(
        rootRef.current.position,
        (horizontal / length) * speed * delta,
        (depth / length) * speed * delta,
        choppedTrees,
        snakePositionRef.current,
      );
      rootRef.current.position.x = next.x;
      rootRef.current.position.z = next.z;
      if (moving) {
        rootRef.current.rotation.y = Math.atan2(horizontal, depth);
        stepClock.current += delta * 9;
      } else {
        stepClock.current = 0;
      }
      if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
        const stride = moving ? Math.sin(stepClock.current) * 0.36 : 0;
        leftLegRef.current.rotation.x = stride;
        rightLegRef.current.rotation.x = -stride;
        leftArmRef.current.rotation.x = -stride * 0.7;
        rightArmRef.current.rotation.x = attackMotion.current > 0 ? -1.6 * attackMotion.current : stride * 0.7;
      }

      if (input.attack) {
        input.attack = false;
        attackMotion.current = 1;
      }
      attackMotion.current = Math.max(0, attackMotion.current - delta * 2.6);

      const jump = input.jump;
      input.jump = false;
      if (jump && rootRef.current.position.y <= 0.001 && staminaRef.current >= 18) {
        jumpVelocity.current = 5.2;
        onStaminaCost(18);
      }
      if (rootRef.current.position.y > 0 || jumpVelocity.current > 0) {
        jumpVelocity.current -= 13.5 * delta;
        rootRef.current.position.y = Math.max(0, rootRef.current.position.y + jumpVelocity.current * delta);
        if (rootRef.current.position.y === 0) jumpVelocity.current = 0;
      }
    }

    playerPositionRef.current.x = rootRef.current.position.x;
    playerPositionRef.current.z = rootRef.current.position.z;

    const targetCamera = {
      x: rootRef.current.position.x + 3.7,
      y: 8.2,
      z: rootRef.current.position.z - 7.2,
    };
    state.camera.position.x += (targetCamera.x - state.camera.position.x) * (1 - Math.exp(-delta * 2.6));
    state.camera.position.y += (targetCamera.y - state.camera.position.y) * (1 - Math.exp(-delta * 2.6));
    state.camera.position.z += (targetCamera.z - state.camera.position.z) * (1 - Math.exp(-delta * 2.6));
    state.camera.lookAt(rootRef.current.position.x, 0.85, rootRef.current.position.z);

    if (beltRef.current) {
      const released = stage === 'livre';
      const target = released ? 1 : Math.min(attempts / 3, 0.88);
      beltProgress.current += (target - beltProgress.current) * (1 - Math.exp(-delta * 3));
      beltRef.current.rotation.z = -0.5 - beltProgress.current * 0.9;
      beltRef.current.position.y = 1.2 - beltProgress.current * 0.34;
      beltRef.current.visible = !released;
    }
  });

  return (
    <group ref={rootRef}>
      <group ref={torsoRef} position={[0, 1.12, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.82, 0.82, 0.48]} />
          <meshStandardMaterial color="#a43e32" roughness={0.95} />
        </mesh>
        <group visible={stage !== 'livre'}>
          <mesh position={[-0.2, -0.49, 0.3]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 0.32, 0.82]} />
            <meshStandardMaterial color="#a94c3e" roughness={0.95} />
          </mesh>
          <mesh position={[0.2, -0.49, 0.3]} rotation={[Math.PI / 2.5, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 0.32, 0.82]} />
            <meshStandardMaterial color="#a94c3e" roughness={0.95} />
          </mesh>
        </group>
        <group visible={stage === 'livre'}>
          <group ref={leftLegRef} position={[-0.2, -0.73, 0]}>
            <mesh position={[0, -0.06, 0]} castShadow><boxGeometry args={[0.29, 0.9, 0.34]} /><meshStandardMaterial color="#4e503a" roughness={1} /></mesh>
            <mesh position={[0, -0.5, 0.1]} castShadow><boxGeometry args={[0.31, 0.16, 0.48]} /><meshStandardMaterial color="#292c27" roughness={0.9} /></mesh>
          </group>
          <group ref={rightLegRef} position={[0.2, -0.73, 0]}>
            <mesh position={[0, -0.06, 0]} castShadow><boxGeometry args={[0.29, 0.9, 0.34]} /><meshStandardMaterial color="#4e503a" roughness={1} /></mesh>
            <mesh position={[0, -0.5, 0.1]} castShadow><boxGeometry args={[0.31, 0.16, 0.48]} /><meshStandardMaterial color="#292c27" roughness={0.9} /></mesh>
          </group>
        </group>
        <group ref={leftArmRef} position={[-0.4, 0.02, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow><boxGeometry args={[0.28, 0.7, 0.34]} /><meshStandardMaterial color="#a43e32" roughness={0.95} /></mesh>
          <mesh position={[0, -0.52, 0]} castShadow><boxGeometry args={[0.24, 0.2, 0.28]} /><meshStandardMaterial color="#b98260" roughness={0.9} /></mesh>
        </group>
        <group ref={rightArmRef} position={[0.4, 0.02, 0]}>
          <mesh position={[0, -0.1, 0]} castShadow><boxGeometry args={[0.28, 0.7, 0.34]} /><meshStandardMaterial color="#a43e32" roughness={0.95} /></mesh>
          <mesh position={[0, -0.52, 0]} castShadow><boxGeometry args={[0.24, 0.2, 0.28]} /><meshStandardMaterial color="#b98260" roughness={0.9} /></mesh>
          {hasAxe && <AxeModel position={[0, -0.66, 0.12]} rotation={[0.15, 0, -0.2]} scale={0.52} />}
        </group>
        <mesh position={[0, -0.12, 0.31]} ref={beltRef}>
          <boxGeometry args={[0.075, 0.82, 0.055]} />
          <meshStandardMaterial color="#b9a875" metalness={0.12} roughness={0.72} />
        </mesh>
        <group ref={headRef} position={[0, 0.73, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.56, 0.56, 0.56]} />
            <meshStandardMaterial color="#a96e4f" roughness={0.87} />
          </mesh>
          <mesh position={[-0.12, 0.04, 0.286]}><boxGeometry args={[0.055, 0.065, 0.025]} /><meshStandardMaterial color="#211d18" /></mesh>
          <mesh position={[0.12, 0.04, 0.286]}><boxGeometry args={[0.055, 0.065, 0.025]} /><meshStandardMaterial color="#211d18" /></mesh>
          <mesh position={[0, -0.1, 0.295]}><boxGeometry args={[0.15, 0.025, 0.02]} /><meshStandardMaterial color="#5a3028" /></mesh>
          <mesh position={[0, 0.23, 0]} castShadow>
            <cylinderGeometry args={[0.23, 0.18, 0.3, 20]} />
            <meshStandardMaterial color="#57402d" roughness={1} />
          </mesh>
          <mesh position={[0, 0.39, 0]} rotation={[0.04, 0, 0]} castShadow>
            <cylinderGeometry args={[0.48, 0.48, 0.07, 24]} />
            <meshStandardMaterial color="#755738" roughness={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Arvore({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.38, 3.4, 8]} />
        <meshStandardMaterial color="#302d20" roughness={1} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <sphereGeometry args={[1.25, 10, 8]} />
        <meshStandardMaterial color="#243d28" roughness={1} />
      </mesh>
      <mesh position={[0.55, 3.15, 0.1]} castShadow>
        <sphereGeometry args={[0.75, 10, 8]} />
        <meshStandardMaterial color="#3d5933" roughness={1} />
      </mesh>
    </group>
  );
}

function CenarioJungle({
  inputRef,
  stage,
  attempts,
  staminaRef,
  onStaminaCost,
  playerPositionRef,
  choppedTrees,
  hasAxe,
  openedBags,
  snakeHealth,
  snakeCommandsRef,
  snakePositionRef,
  onSnakeAttack,
  onSnakeHiss,
}) {
  return (
    <>
      <color attach="background" args={['#182019']} />
      <fog attach="fog" args={['#182019', 15, 32]} />
      <ambientLight intensity={0.7} color="#b9c9a0" />
      <directionalLight position={[-4, 11, -4]} intensity={2} color="#f0d7a1" castShadow />
      <hemisphereLight args={['#b7d09c', '#302d20', 0.75]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#344331" roughness={1} />
      </mesh>
      {treePlacements.map(([x, y, z, scale], index) => (
        !choppedTrees.includes(index) && <Arvore key={index} position={[x, y, z]} scale={scale} />
      ))}
      <group position={[-4.5, 0.7, 1.1]} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.32, 8, 12, 1, true]} />
          <meshStandardMaterial color="#59604a" roughness={0.95} side={2} />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <cylinderGeometry args={[0.82, 0.82, 0.08, 12]} />
          <meshStandardMaterial color="#171c17" roughness={1} />
        </mesh>
      </group>
      <mesh position={[-1.7, 0.4, -2.4]} rotation={[0.15, 0.2, -0.22]} castShadow>
        <boxGeometry args={[3.8, 0.2, 1.2]} />
        <meshStandardMaterial color="#747261" roughness={0.92} metalness={0.18} />
      </mesh>
      <mesh position={[2.8, 0.18, 1.2]} rotation={[0.3, 0.1, 0.1]} castShadow>
        <boxGeometry args={[2.1, 0.18, 0.75]} />
        <meshStandardMaterial color="#77715a" roughness={1} />
      </mesh>
      {!hasAxe && <AxeModel position={[axePosition[0], 0.08, axePosition[2]]} rotation={[Math.PI / 2, 0, 0.35]} scale={0.72} />}
      {bagPlacements.map((position, index) => (
        <MalaSuprimentos key={index} position={position} aberta={openedBags.includes(index)} loot={bagLoot[index]} />
      ))}
      {snakePlacements.map((position, index) => (
        snakeHealth[index] > 0 && (
          <Cobra
            key={index}
            id={index}
            position={position}
            playerPositionRef={playerPositionRef}
            snakePositionRef={snakePositionRef}
            commandRef={snakeCommandsRef}
            health={snakeHealth[index]}
            active={stage === 'livre'}
            onAttack={onSnakeAttack}
            onHiss={onSnakeHiss}
          />
        )
      ))}
      {stage !== 'livre' && <CadeiraAviao />}
      <Ivan
        inputRef={inputRef}
        stage={stage}
        attempts={attempts}
        staminaRef={staminaRef}
        onStaminaCost={onStaminaCost}
        playerPositionRef={playerPositionRef}
        snakePositionRef={snakePositionRef}
        choppedTrees={choppedTrees}
        hasAxe={hasAxe}
      />
    </>
  );
}

function Partida({ onVoltar, audioContext }) {
  const [stage, setStage] = useState('queda');
  const [frame, setFrame] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [vitals, setVitals] = useState({ hp: 100, hunger: 84, thirst: 72, stamina: 100 });
  const [hasAxe, setHasAxe] = useState(false);
  const [openedBags, setOpenedBags] = useState([]);
  const [inventory, setInventory] = useState({ tecido: 0, comida: 0 });
  const [choppedTrees, setChoppedTrees] = useState([]);
  const [treeHits, setTreeHits] = useState(treePlacements.map(() => 0));
  const [snakeHealth, setSnakeHealth] = useState([2, 2]);
  const [nearbyPrompt, setNearbyPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [bloodVisible, setBloodVisible] = useState(false);
  const staminaRef = useRef(100);
  const playerPositionRef = useRef({ x: 0.95, z: 0.65 });
  const snakePositionRef = useRef(snakePlacements.map(([x, , z]) => ({ x, z })));
  const snakeCommandsRef = useRef({});
  const inputRef = useRef({ forward: false, backward: false, left: false, right: false, jump: false, attack: false });

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 2200);
  };

  const playSnakeHiss = () => {
    if (!audioContext || audioContext.state === 'closed') return;
    const bufferLength = Math.floor(audioContext.sampleRate * 0.32);
    const buffer = audioContext.createBuffer(1, bufferLength, audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < bufferLength; index += 1) channel[index] = (Math.random() * 2 - 1) * (1 - index / bufferLength);
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 2300;
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.32);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    source.start();
  };

  const handleSnakeAttack = () => {
    setVitals((current) => ({ ...current, hp: Math.max(0, current.hp - 14) }));
    setBloodVisible(true);
    showMessage('A cobra acertou o bote!');
    window.setTimeout(() => setBloodVisible(false), 650);
  };

  const distanceToPlayer = ([x, , z]) => Math.hypot(playerPositionRef.current.x - x, playerPositionRef.current.z - z);

  const attackWithAxe = useEffectEvent(() => {
    if (!hasAxe) {
      showMessage('Encontre o machado na aeronave primeiro.');
      return;
    }
    inputRef.current.attack = true;
    const nearestSnake = snakePositionRef.current
      .map((position, index) => ({ index, distance: Math.hypot(playerPositionRef.current.x - position.x, playerPositionRef.current.z - position.z) }))
      .filter(({ index }) => snakeHealth[index] > 0)
      .sort((left, right) => left.distance - right.distance)[0];

    if (nearestSnake && nearestSnake.distance < 2.8) {
      setSnakeHealth((current) => current.map((health, index) => index === nearestSnake.index ? Math.max(0, health - 1) : health));
      snakeCommandsRef.current[nearestSnake.index] = 'hit';
      setBloodVisible(true);
      window.setTimeout(() => setBloodVisible(false), 450);
      showMessage(snakeHealth[nearestSnake.index] <= 1 ? 'A cobra foi derrotada.' : 'Machadada! A cobra recua ferida.');
      return;
    }

    const nearestTree = treePlacements
      .map(([x, , z], index) => ({ index, distance: Math.hypot(playerPositionRef.current.x - x, playerPositionRef.current.z - z) }))
      .filter(({ index }) => !choppedTrees.includes(index))
      .sort((left, right) => left.distance - right.distance)[0];
    if (nearestTree && nearestTree.distance < 2.7) {
      inputRef.current.attack = true;
      const hits = treeHits[nearestTree.index] + 1;
      setTreeHits((current) => current.map((count, index) => index === nearestTree.index ? hits : count));
      if (hits >= 3) {
        setChoppedTrees((currentTrees) => [...currentTrees, nearestTree.index]);
        showMessage('Árvore derrubada.');
      } else showMessage(`Árvore atingida · ${hits} de 3 golpes.`);
      return;
    }
    showMessage('Nenhuma cobra ou árvore ao alcance.');
  });

  useEffect(() => {
    if (stage === 'queda') {
      const timeout = window.setTimeout(() => {
        if (frame < crashFrames.length - 1) setFrame(frame + 1);
        else setStage('acordando');
      }, 1450);
      return () => window.clearTimeout(timeout);
    }
    if (stage === 'acordando') {
      const timeout = window.setTimeout(() => setStage('cinto'), 4300);
      return () => window.clearTimeout(timeout);
    }
  }, [frame, stage]);

  useEffect(() => {
    if (stage === 'queda') return undefined;
    const interval = window.setInterval(() => {
      const moving = stage === 'livre' && (
        inputRef.current.forward || inputRef.current.backward || inputRef.current.left || inputRef.current.right
      );
      setVitals((current) => {
        const stamina = Math.max(0, Math.min(100, current.stamina + (moving ? -9 : 15) * 0.25));
        staminaRef.current = stamina;
        return {
          hp: Math.max(0, current.hp - (current.hunger === 0 || current.thirst === 0 ? 0.5 : 0)),
          hunger: Math.max(0, current.hunger - 0.025),
          thirst: Math.max(0, current.thirst - 0.045),
          stamina,
        };
      });
    }, 250);
    return () => window.clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (stage !== 'livre') {
        setNearbyPrompt('');
        return;
      }
      if (!hasAxe && distanceToPlayer(axePosition) < 2.8) {
        setNearbyPrompt('F · pegar o machado');
        return;
      }
      const bagIndex = bagPlacements.findIndex((position, index) => !openedBags.includes(index) && distanceToPlayer(position) < 2.4);
      if (bagIndex !== -1) {
        setNearbyPrompt('E · abrir mala de suprimentos');
        return;
      }
      const nearbySnake = snakePositionRef.current.some((position, index) => (
        snakeHealth[index] > 0 && Math.hypot(playerPositionRef.current.x - position.x, playerPositionRef.current.z - position.z) < 4.3
      ));
      if (nearbySnake) {
        setNearbyPrompt(hasAxe ? 'J · atacar a cobra' : 'Cobra por perto · encontre o machado');
        return;
      }
      const nearbyTree = treePlacements.some(([x, , z], index) => (
        !choppedTrees.includes(index) && Math.hypot(playerPositionRef.current.x - x, playerPositionRef.current.z - z) < 2.8
      ));
      setNearbyPrompt(nearbyTree ? (hasAxe ? 'J · cortar árvore' : 'Árvore · machado necessário') : '');
    }, 180);
    return () => window.clearInterval(interval);
  }, [stage, hasAxe, openedBags, snakeHealth, choppedTrees]);

  useEffect(() => {
    const setMovementKey = (event, pressed) => {
      const key = event.key.toLowerCase();
      if (key === 'w') inputRef.current.forward = pressed;
      if (key === 's') inputRef.current.backward = pressed;
      if (key === 'a') inputRef.current.right = pressed;
      if (key === 'd') inputRef.current.left = pressed;
    };

    const onKeyDown = (event) => {
      setMovementKey(event, true);
      if (event.code === 'Space') event.preventDefault();
      if (event.key === 'Escape') onVoltar();
      const key = event.key.toLowerCase();
      if (stage === 'livre' && !event.repeat && key === 'f' && !hasAxe && distanceToPlayer(axePosition) < 2.8) {
        setHasAxe(true);
        showMessage('Machado encontrado na aeronave.');
        return;
      }
      if (stage === 'livre' && !event.repeat && key === 'e') {
        const bagIndex = bagPlacements.findIndex((position, index) => !openedBags.includes(index) && distanceToPlayer(position) < 2.4);
        if (bagIndex !== -1) {
          setOpenedBags((current) => [...current, bagIndex]);
          setInventory((current) => ({
            tecido: current.tecido + bagLoot[bagIndex].tecido,
            comida: current.comida + bagLoot[bagIndex].comida,
          }));
          showMessage(`Mala aberta · ${bagLoot[bagIndex].tecido} tecidos e ${bagLoot[bagIndex].comida} comidas.`);
          return;
        }
      }
      if (stage === 'livre' && !event.repeat && key === 'j') {
        attackWithAxe();
        return;
      }
      if (stage === 'livre' && !event.repeat && key === 'r' && inventory.comida > 0) {
        setInventory((current) => ({ ...current, comida: current.comida - 1 }));
        setVitals((current) => ({ ...current, hunger: Math.min(100, current.hunger + 24) }));
        showMessage('Você comeu uma porção.');
        return;
      }
      if ((event.key.toLowerCase() === 'e' || event.code === 'Space') && !event.repeat) {
        if (stage === 'queda' || stage === 'acordando') setStage('cinto');
        else if (stage === 'cinto') {
          setAttempts((current) => {
            const next = current + 1;
            if (next >= 3) setStage('livre');
            return Math.min(next, 3);
          });
        } else if (stage === 'livre' && event.code === 'Space') inputRef.current.jump = true;
      }
    };
    const onKeyUp = (event) => setMovementKey(event, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      inputRef.current = { forward: false, backward: false, left: false, right: false, jump: false, attack: false };
    };
  }, [onVoltar, stage, hasAxe, openedBags, inventory, snakeHealth, choppedTrees]);

  const onStaminaCost = (cost) => {
    setVitals((current) => {
      const stamina = Math.max(0, current.stamina - cost);
      staminaRef.current = stamina;
      return { ...current, stamina };
    });
  };

  return (
    <main className="game-screen">
      <Canvas shadows camera={{ position: [3.7, 8.2, -7.2], fov: 48 }}>
        <CenarioJungle
          inputRef={inputRef}
          stage={stage}
          attempts={attempts}
          staminaRef={staminaRef}
          onStaminaCost={onStaminaCost}
          playerPositionRef={playerPositionRef}
          choppedTrees={choppedTrees}
          hasAxe={hasAxe}
          openedBags={openedBags}
          snakeHealth={snakeHealth}
          snakeCommandsRef={snakeCommandsRef}
          snakePositionRef={snakePositionRef}
          onSnakeAttack={handleSnakeAttack}
          onSnakeHiss={playSnakeHiss}
        />
      </Canvas>

      {stage === 'queda' ? (
        <section
          className="crash-presentation"
          style={{ '--crash-backdrop': `url("${crashWideBackdrop}")` }}
          aria-label="Sequência da queda do avião"
        >
          <img key={crashFrames[frame]} className="crash-frame" src={crashFrames[frame]} alt={crashCaptions[frame]} />
          <div className="crash-vignette" />
          <div className="crash-copy">
            <p className="hud-kicker">Registro de voo · Amazônia</p>
            <h1>{crashCaptions[frame]}</h1>
            <div className="crash-progress" aria-label={`Cena ${frame + 1} de ${crashFrames.length}`}>
              {crashFrames.map((image, index) => (
                <span key={image} className={index <= frame ? 'is-seen' : ''} />
              ))}
            </div>
          </div>
          <button className="skip-intro" type="button" onClick={() => setStage('acordando')}>
            Pular sequência
          </button>
        </section>
      ) : (
        <>
          <section className="wake-hud" aria-live="polite">
            <p className="hud-kicker">Fase 1 · Depois do impacto</p>
            <h1>{stage === 'acordando' ? 'Consciência retornando' : stage === 'cinto' ? 'Preso à cadeira' : 'Solto. Preciso sair daqui.'}</h1>
            <p>
              {stage === 'acordando'
                ? 'A visão turva aos poucos. Ivan tenta entender onde está.'
                : stage === 'cinto'
                  ? 'Pressione E ou Espaço para tentar soltar o cinto.'
                  : 'Use W, A, S, D para se mover entre os destroços.'}
            </p>
            {stage === 'cinto' && (
              <div className="belt-progress" aria-label={`${attempts} de 3 tentativas para soltar o cinto`}>
                {[0, 1, 2].map((step) => <span key={step} className={step < attempts ? 'is-done' : ''} />)}
                <span className="attempt-label">Tentativa {Math.min(attempts + 1, 3)} de 3</span>
              </div>
            )}
          </section>

          <div className="movement-hint" aria-label="Controles de movimento">
            <div className="key-cluster"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div>
            <div className="control-copy"><span>WASD · mover</span><span>Espaço · pular</span><span>J · machado · R comer</span></div>
          </div>
          <aside className="status-panel" aria-label="Estado de Ivan">
            <div className="status-heading">
              <img src={ivanPortrait} alt="" />
              <div className="status-identity"><span>Sobrevivente</span><strong>Ivan</strong></div>
            </div>
            {[
              ['hp', 'Vida', '#c45345'],
              ['hunger', 'Fome', '#d2a54e'],
              ['thirst', 'Sede', '#5ea7b0'],
              ['stamina', 'Resistência', '#8ca75e'],
            ].map(([key, label, color]) => (
              <div className="status-row" key={key}>
                <span>{label}</span>
                <div className="status-track"><span style={{ width: `${vitals[key]}%`, backgroundColor: color }} /></div>
                <span className="status-value">{Math.round(vitals[key])}</span>
              </div>
            ))}
          </aside>
          {stage === 'livre' && (
            <section className="survival-inventory" aria-label="Inventário e interações">
              <div className="inventory-items">
                <span className={hasAxe ? 'inventory-item is-owned' : 'inventory-item'}>{hasAxe ? 'Machado' : 'Sem machado'}</span>
                <span className="inventory-item">Tecido <strong>{inventory.tecido}</strong></span>
                <span className="inventory-item">Comida <strong>{inventory.comida}</strong></span>
              </div>
              {nearbyPrompt && <p className="nearby-prompt">{nearbyPrompt}</p>}
              {hasAxe && <p className="inventory-help">J · golpear cobra ou árvore</p>}
            </section>
          )}
          {message && <div className="game-message" role="status">{message}</div>}
        </>
      )}

      {bloodVisible && <div className="damage-vignette" aria-hidden="true" />}
      <button className="menu-return" type="button" onClick={onVoltar}>Voltar ao menu</button>
    </main>
  );
}

export default function App() {
  const [jogoIniciado, setJogoIniciado] = useState(false);
  const [audioContext, setAudioContext] = useState(null);
  const audioContextRef = useRef(null);

  const iniciarJogo = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioContextRef.current && AudioContext) {
      audioContextRef.current = new AudioContext();
      setAudioContext(audioContextRef.current);
    }
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    setJogoIniciado(true);
  };

  if (jogoIniciado) return <Partida onVoltar={() => setJogoIniciado(false)} audioContext={audioContext} />;

  return (
    <main className="main-menu" style={{ '--jungle-image': `url(${jungleBackground})` }}>
      <div className="menu-shade" aria-hidden="true" />
      <header className="game-title">
        <p className="title-eyebrow">Uma jornada de sobrevivência</p>
        <h1>Amazônia</h1>
        <p className="title-subtitle">Sobrevivência real</p>
      </header>
      <nav className="menu-options" aria-label="Menu principal">
        <button className="menu-button menu-button-primary" type="button" onClick={iniciarJogo}>
          <span>Novo jogo</span><span className="button-mark" aria-hidden="true">↗</span>
        </button>
        <button className="menu-button menu-button-disabled" type="button" disabled>
          Continuar<span className="locked-label">Indisponível</span>
        </button>
        <p className="mode-label"><span aria-hidden="true" /> Modo único · Sobrevivência extrema</p>
      </nav>
      <footer className="menu-footer">Projeto independente <span>·</span> Amazônia brasileira</footer>
    </main>
  );
}
