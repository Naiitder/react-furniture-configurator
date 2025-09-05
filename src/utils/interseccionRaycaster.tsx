// InterseccionRaycaster.tsx
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import InterseccionMueble from "../components/Interseccion";

const InterseccionRaycaster = ({ x, y, interseccion}: { x: number; y: number; interseccion: InterseccionMueble }) => {
    const { scene } = useThree();

    useEffect(() => {
        console.log("empezar");

        const geometry = new THREE.BoxGeometry(.1, .1, .1);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0.1);

        scene.add(mesh);

        console.log("llegar");

        return () => {
            scene.remove(mesh); // Limpieza
        };
    }, [x, y, scene]);

    return null;
};

export default InterseccionRaycaster;
