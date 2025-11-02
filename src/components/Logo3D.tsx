import { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import egliconnectLogo from '@/assets/egliconnect-logo.png';

function RotatingLogo() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, egliconnectLogo);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      // Gentle float animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3, 3]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
        emissive="#d4af37"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function Logo3D() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#d4af37" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#1e88e5" />
        <spotLight position={[0, 5, 5]} intensity={1} angle={0.3} penumbra={1} color="#ffffff" />
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
