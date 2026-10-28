import { useEffect, useRef, useState } from 'react';
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

function Ivan({ inputRef, stage, attempts }) {
  const rootRef = useRef();
  const torsoRef = useRef();
  const headRef = useRef();
  const beltRef = useRef();
  const wakeProgress = useRef(0);
  const beltProgress = useRef(0);

  useFrame((state, delta) => {
    if (!rootRef.current) return;

    const awake = stage === 'acordando' || stage === 'cinto' || stage === 'livre';
    wakeProgress.current += ((awake ? 1 : 0) - wakeProgress.current) * (1 - Math.exp(-delta * 0.55));

    if (torsoRef.current) {
      torsoRef.current.rotation.x = 0.38 - wakeProgress.current * 0.35;
      torsoRef.current.position.y = 1.12 + Math.sin(state.clock.elapsedTime * 1.1) * 0.018 * wakeProgress.current;
    }
    if (headRef.current) {
      headRef.current.rotation.x = 0.55 - wakeProgress.current * 0.52;
      headRef.current.rotation.y = awake ? Math.sin(state.clock.elapsedTime * 0.65) * 0.42 : 0;
    }

    const input = inputRef.current;
    const walking = stage === 'livre';
    const restrained = stage === 'cinto';
    if (walking || restrained) {
      const speed = walking ? 2.5 : 0.34;
      const horizontal = Number(input.right) - Number(input.left);
      const depth = Number(input.forward) - Number(input.backward);
      const length = Math.hypot(horizontal, depth) || 1;
      rootRef.current.position.x += (horizontal / length) * speed * delta;
      rootRef.current.position.z += (depth / length) * speed * delta;
      const limit = walking ? 8 : 0.25;
      rootRef.current.position.x = Math.max(-limit, Math.min(limit, rootRef.current.position.x));
      rootRef.current.position.z = Math.max(-limit, Math.min(limit, rootRef.current.position.z));
    }

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
      <CadeiraAviao />
      <group ref={torsoRef} position={[0, 1.12, 0]}>
        <mesh position={[0, 0.05, 0]} scale={[0.4, 0.53, 0.3]} castShadow>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial color="#a43e32" roughness={0.95} />
        </mesh>
        <mesh position={[0, -0.53, 0.38]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.67, 0.27]} />
          <meshStandardMaterial color="#4e503a" roughness={1} />
        </mesh>
        <mesh position={[-0.27, -0.3, 0.03]} rotation={[0.1, 0, -0.24]} castShadow>
          <capsuleGeometry args={[0.12, 0.48, 5, 10]} />
          <meshStandardMaterial color="#a94c3e" roughness={0.95} />
        </mesh>
        <mesh position={[0.27, -0.3, 0.03]} rotation={[0.1, 0, 0.24]} castShadow>
          <capsuleGeometry args={[0.12, 0.48, 5, 10]} />
          <meshStandardMaterial color="#a94c3e" roughness={0.95} />
        </mesh>
        <mesh position={[0, -0.12, 0.31]} ref={beltRef}>
          <boxGeometry args={[0.075, 0.82, 0.055]} />
          <meshStandardMaterial color="#b9a875" metalness={0.12} roughness={0.72} />
        </mesh>
        <group ref={headRef} position={[0, 0.73, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.27, 24, 18]} />
            <meshStandardMaterial color="#a96e4f" roughness={0.87} />
          </mesh>
          <mesh position={[0, -0.12, 0.18]} castShadow>
            <sphereGeometry args={[0.19, 16, 12]} />
            <meshStandardMaterial color="#33251f" roughness={1} />
          </mesh>
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

function CenarioJungle({ inputRef, stage, attempts }) {
  const trees = [
    [-8, 0, -7, 1.2], [-5, 0, -10, 0.9], [-1, 0, -11, 1.1], [4, 0, -10, 1.1],
    [8, 0, -7, 1.2], [-9, 0, -1, 0.9], [9, 0, 1, 0.95], [-8, 0, 7, 1.1],
    [-4, 0, 9, 0.9], [2, 0, 10, 1.1], [7, 0, 8, 1.2], [11, 0, 5, 0.9],
  ];

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
      {trees.map(([x, y, z, scale], index) => (
        <Arvore key={index} position={[x, y, z]} scale={scale} />
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
      <Ivan inputRef={inputRef} stage={stage} attempts={attempts} />
    </>
  );
}

function Partida({ onVoltar }) {
  const [stage, setStage] = useState('queda');
  const [frame, setFrame] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef({ forward: false, backward: false, left: false, right: false });

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
    const setMovementKey = (event, pressed) => {
      const key = event.key.toLowerCase();
      if (key === 'w') inputRef.current.forward = pressed;
      if (key === 's') inputRef.current.backward = pressed;
      if (key === 'a') inputRef.current.left = pressed;
      if (key === 'd') inputRef.current.right = pressed;
    };

    const onKeyDown = (event) => {
      setMovementKey(event, true);
      if (event.code === 'Space') event.preventDefault();
      if (event.key === 'Escape') onVoltar();
      if ((event.key.toLowerCase() === 'e' || event.code === 'Space') && !event.repeat) {
        if (stage === 'queda' || stage === 'acordando') setStage('cinto');
        else if (stage === 'cinto') {
          setAttempts((current) => {
            const next = current + 1;
            if (next >= 3) setStage('livre');
            return Math.min(next, 3);
          });
        }
      }
    };
    const onKeyUp = (event) => setMovementKey(event, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onVoltar, stage]);

  return (
    <main className="game-screen">
      <Canvas shadows camera={{ position: [3.7, 8.2, -7.2], fov: 48 }}>
        <CenarioJungle inputRef={inputRef} stage={stage} attempts={attempts} />
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

          {stage === 'acordando' && (
            <aside className="ivan-identification" aria-label="Ivan">
              <img src={ivanPortrait} alt="Ivan, personagem principal" />
              <div><span>Sobrevivente</span><strong>Ivan</strong></div>
            </aside>
          )}

          <div className="movement-hint" aria-label="Controles de movimento">
            <kbd>W</kbd><span>frente</span><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><span>mover</span>
          </div>
        </>
      )}

      <button className="menu-return" type="button" onClick={onVoltar}>Voltar ao menu</button>
    </main>
  );
}

export default function App() {
  const [jogoIniciado, setJogoIniciado] = useState(false);

  if (jogoIniciado) return <Partida onVoltar={() => setJogoIniciado(false)} />;

  return (
    <main className="main-menu" style={{ '--jungle-image': `url(${jungleBackground})` }}>
      <div className="menu-shade" aria-hidden="true" />
      <header className="game-title">
        <p className="title-eyebrow">Uma jornada de sobrevivência</p>
        <h1>Amazônia</h1>
        <p className="title-subtitle">Sobrevivência real</p>
      </header>
      <nav className="menu-options" aria-label="Menu principal">
        <button className="menu-button menu-button-primary" type="button" onClick={() => setJogoIniciado(true)}>
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
