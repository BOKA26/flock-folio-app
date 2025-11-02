import { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import egliconnectLogo from '@/assets/egliconnect-logo-clean.png';

function RotatingLogo() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, egliconnectLogo);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      // Gentle float animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.5, 2.5]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
        emissive="#d4af37"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

export default function Logo3DAuth() {
  return (
    <div className="w-32 h-32 relative">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.9} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#d4af37" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#1e90ff" />
        <spotLight position={[0, 5, 5]} intensity={1.5} angle={0.4} penumbra={1} color="#ffffff" />
        <RotatingLogo />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
