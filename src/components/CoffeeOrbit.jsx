import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'

/**
 * A coffee bean, built rather than modelled.
 *
 * A sphere squashed on two axes gives the body; the crease is a second,
 * near-flat ellipsoid pushed just proud of the surface so it reads as a groove
 * cut into the bean instead of a stripe painted on it.
 */
function Bean({ position, scale = 1, speed = 1, phase = 0 }) {
  const group = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase
    group.current.rotation.y = t * 0.5
    group.current.rotation.z = Math.sin(t * 0.7) * 0.2
    group.current.position.y = position[1] + Math.sin(t * 0.9) * 0.13
  })

  return (
    <group ref={group} position={position} scale={scale} rotation={[0.5, 0, -0.35]}>
      {/* Longer than it is tall, and flattened front-to-back — without the
          squash on both axes a sphere just reads as a ball. */}
      <mesh scale={[1, 0.72, 0.58]}>
        <sphereGeometry args={[0.64, 64, 48]} />
        {/* Roasted beans are oily, not glossy: a broad clearcoat over a fairly
            rough base is what sells "just out of the drum". */}
        <meshPhysicalMaterial
          color="#40190d"
          roughness={0.42}
          metalness={0}
          clearcoat={0.85}
          clearcoatRoughness={0.35}
          sheen={0.4}
          sheenColor="#c1743a"
        />
      </mesh>

      {/* Sized to sit just inside the body vertically but a hair proud of it
          front-to-back, so the crease shows only across the flat face. */}
      <mesh scale={[0.075, 0.7, 0.62]}>
        <sphereGeometry args={[0.655, 32, 32]} />
        <meshPhysicalMaterial color="#1a0805" roughness={0.85} clearcoat={0.2} />
      </mesh>
    </group>
  )
}

/**
 * The floating cluster in the hero. It sits over the dark bokeh at the top of
 * the bar photograph, so the beans read as if they were in the room.
 */
function CoffeeOrbit() {
  // Built once — remounting a Vector2 every frame is the classic R3F leak.
  const beans = useMemo(
    () => [
      { position: [0, 0, 0], scale: 1.5, speed: 1, phase: 0 },
      { position: [-1.45, 1.0, -1.2], scale: 0.36, speed: 0.65, phase: 1.7 },
      { position: [1.2, -1.1, -1.0], scale: 0.29, speed: 0.75, phase: 3.1 },
      { position: [1.35, 1.25, -1.8], scale: 0.22, speed: 0.55, phase: 4.4 },
    ],
    [],
  )

  return (
    <div className="coffee-orbit" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearAlpha(0)}
      >
        {/* Warm key from the bar lamps, cold rim from the window, both as
            panels so the clearcoat has something with shape to reflect. */}
        <Environment resolution={64} frames={1}>
          <Lightformer intensity={2.4} color="#ffd9a0" position={[3, 3, 3]} scale={[6, 6, 1]} />
          <Lightformer intensity={1.1} color="#7f9dc4" position={[-4, 0, 2]} scale={[3, 6, 1]} rotation={[0, 1, 0]} />
        </Environment>

        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 3]} intensity={3.2} color="#ffca86" />
        <pointLight position={[-3.5, -1, 2]} intensity={16} color="#c9622c" />
        {/* Rim from behind — this is the light that separates the bean from a
            near-black background. Without it the whole cluster disappears. */}
        <pointLight position={[-1, 2, -4]} intensity={22} color="#ffb066" />

        {beans.map((bean, i) => (
          <Bean key={i} {...bean} />
        ))}
      </Canvas>
    </div>
  )
}

// Default export so App can React.lazy() this file: three.js and drei are ~900kB
// of the bundle, and none of it is needed to render the page.
export default CoffeeOrbit
