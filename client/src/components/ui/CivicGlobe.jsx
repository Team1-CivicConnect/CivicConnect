import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function PointsSphere() {
    const ref = useRef();

    // Generate 2500 coordinates distributed spherically
    const [positions, validColors] = useMemo(() => {
        const pointsCount = 2500;
        const points = new Float32Array(pointsCount * 3);
        const colors = new Float32Array(pointsCount * 3);

        // Ubayog Palette
        const colorPrimary = new THREE.Color('#4ADE80'); // Green
        const colorSecondary = new THREE.Color('#3B82F6'); // Blue
        const colorAlert = new THREE.Color('#EF4444'); // Red

        for (let i = 0; i < pointsCount; i++) {
            // Fibonacci sphere generation
            const phi = Math.acos(-1 + (2 * i) / pointsCount);
            const theta = Math.sqrt(pointsCount * Math.PI) * phi;

            // Radius math
            const x = 3.5 * Math.cos(theta) * Math.sin(phi);
            const y = 3.5 * Math.sin(theta) * Math.sin(phi);
            const z = 3.5 * Math.cos(phi);

            points[i * 3] = x;
            points[i * 3 + 1] = y;
            points[i * 3 + 2] = z;

            // Color distribution (Mostly Green/Blue, 2% Critical Red Nodes)
            const rand = Math.random();
            let color = colorPrimary;
            if (rand > 0.98) color = colorAlert;
            else if (rand > 0.6) color = colorSecondary;

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return [points, colors];
    }, []);

    useFrame((state) => {
        if (!ref.current) return;
        // Slow cinematic rotation and subtle floating mathematical orbit
        ref.current.rotation.y = state.clock.getElapsedTime() * 0.08;
        ref.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.1;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={validColors.length / 3} array={validColors} itemSize={3} />
            </bufferGeometry>
            {/* Ensure particles look like glowing rounded orbs */}
            <pointsMaterial size={0.06} vertexColors transparent opacity={1} sizeAttenuation={true} blending={THREE.AdditiveBlending} />
        </points>
    );
}

export default function CivicGlobe() {
    return (
        <div className="absolute top-0 right-0 w-full lg:w-[60vw] h-full pointer-events-none z-0 mix-blend-screen opacity-100">
            <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
                <fog attach="fog" args={['#0A0F1C', 6, 20]} />
                <PointsSphere />
            </Canvas>
        </div>
    );
}
