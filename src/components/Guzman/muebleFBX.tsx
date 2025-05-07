// MuebleFBX.tsx
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { useEffect } from 'react';
import * as THREE from 'three';

interface MuebleFBXProps {
    url: string;
    scale?: number;
    position?: [number, number, number];
}

export default function MuebleFBX({ url, scale = 0.01, position = [0, 0, 0] }: MuebleFBXProps) {
    const fbx = useLoader(FBXLoader, url);

    useEffect(() => {
        fbx.scale.set(scale, scale, scale);
        fbx.position.set(...position);
        fbx.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        console.log(fbx);
    }, [fbx, scale, position]);

    return <primitive object={fbx} />;
}