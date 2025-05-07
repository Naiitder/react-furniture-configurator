// MuebleGLB.tsx
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';


interface MuebleGLBProps {
    url: string;
    scale?: number;
    position?: [number, number, number];
}

export default function MuebleGLB({ url, scale = 1, position = [0, 0, 0] }: MuebleGLBProps) {
    const { scene } = useGLTF(url);

    const mainElement = scene.children[0];

    mainElement.scale.set(scale, scale, scale);
    mainElement.position.set(...position);
    scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    console.log(mainElement);
    return <primitive object={mainElement} />;
}