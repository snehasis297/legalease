import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ShieldMesh = () => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
      <group ref={meshRef}>
        {/* Document Body */}
        <RoundedBox args={[2.2, 3.2, 0.15]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color="#1A1A2E"
            roughness={0.15}
            metalness={0.85}
            emissive="#534AB7"
            emissiveIntensity={0.2}
          />
        </RoundedBox>

        {/* Glowing Shield Emblem in Center */}
        <mesh position={[0, 0, 0.1]}>
          <octahedronGeometry args={[0.7, 0]} />
          <meshStandardMaterial
            color="#00D4FF"
            roughness={0.1}
            metalness={0.9}
            wireframe={true}
            emissive="#00D4FF"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Decorative Document Lines */}
        {[-0.8, -0.4, 0.4, 0.8].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0.09]}>
            <boxGeometry args={[1.5, 0.06, 0.02]} />
            <meshStandardMaterial color="#534AB7" emissive="#00D4FF" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

export const DocumentModel = () => {
  return (
    <div className="w-full h-[450px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00D4FF" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#534AB7" />
        <ShieldMesh />
      </Canvas>
    </div>
  );
};

export default DocumentModel;
