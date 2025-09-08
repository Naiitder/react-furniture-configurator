// InterseccionRaycaster.tsx
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import InterseccionMueble from "../components/Interseccion";

const InterseccionRaycaster = ({ x, y, interseccion}: { x: number; y: number; interseccion: InterseccionMueble }) => {
    const { scene } = useThree();

    useEffect(() => {
        const geometry = new THREE.BoxGeometry(.1, .1, .1   );
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData.ignoreRaycast = true;
        mesh.position.set(x, y, 0.1);
        scene.add(mesh);

        const raycaster = new THREE.Raycaster();
        const origin = mesh.getWorldPosition(new THREE.Vector3());
        const epsilon = 0.001; // separa el origen para no tocarse a sí mismo

        const directions = [
            { key: 'up',    dir: new THREE.Vector3(0, 1, 0) },
            { key: 'down',  dir: new THREE.Vector3(0, -1, 0) },
            { key: 'right', dir: new THREE.Vector3(1, 0, 0) },
            { key: 'left',  dir: new THREE.Vector3(-1, 0, 0) },
        ];


        const targets: THREE.Object3D[] = [];
        scene.traverse((o) => {
            const isMesh = (o as any).isMesh === true;
            if (isMesh && o !== mesh && !(o as any).userData?.ignoreRaycast) {
                targets.push(o);
            }
        });

        const hits: Record<string, { distance: number; point: number[]; uuid: string; name?: string } | null> = {};
        directions.forEach(({ key, dir }) => {
            const from = origin.clone().addScaledVector(dir, epsilon);
            raycaster.set(from, dir.clone().normalize());
            const res = raycaster.intersectObjects(targets, true);
            if (res.length) {
                const h = res[0];
                hits[key] = {
                    distance: h.distance,
                    point: h.point.toArray(),
                    uuid: h.object.uuid,
                    name: h.object.name,
                };
            } else {
                hits[key] = null;
            }
        });

        (interseccion as any).raycastHits2D = { origin: origin.toArray(), hits };
         console.log('Raycasts 2D:', hits);


        return () => {
            scene.remove(mesh);
            geometry.dispose();
            material.dispose();
        };

    }, [x, y, scene]);

    return null;
};

export default InterseccionRaycaster;
