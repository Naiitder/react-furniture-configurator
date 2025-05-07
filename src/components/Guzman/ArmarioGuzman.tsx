import React, {useRef, useEffect, JSX} from "react";
import * as THREE from "three";
import { useGLTF } from '@react-three/drei';
import Tabla from "../Casco/Tabla";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider";
import { useMaterial } from "../../assets/materials";

interface ArmarioGuzmanProps {
    url: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    espesor?: number;
}

const ArmarioGuzman = ({
                           url,
                           position = [0, 0, 0],
                           rotation = [0, 0, 0],
                           espesor = 0.1,
                       }: ArmarioGuzmanProps) => {
    const { scene } = useGLTF(url);
    const groupRef = useRef<THREE.Group>(null);
    const detectionBoxRef = useRef<THREE.Group>(null);
    const materiales = useMaterial();
    const { setRefItem } = useSelectedItemProvider();

    const handleClick = (event: React.PointerEvent) => {
        event.stopPropagation();
        if (groupRef.current && detectionBoxRef.current) {
            setRefItem({ groupRef: groupRef.current, detectionRef: detectionBoxRef.current });
        }
    };

    const renderTablasFromModel = () => {
        const tablas: JSX.Element[] = [];
        let overallWidth = 0;
        let overallHeight = 0;
        let overallDepth = 0;

        scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const boundingBox = new THREE.Box3().setFromObject(child);
                const size = new THREE.Vector3();
                boundingBox.getSize(size);

                const width = size.x;
                const height = size.y;
                const depth = size.z;

                const center = new THREE.Vector3();
                boundingBox.getCenter(center);

                overallWidth = Math.max(overallWidth, width);
                overallHeight = Math.max(overallHeight, height);
                overallDepth = Math.max(overallDepth, depth);

                tablas.push(
                    <Tabla
                        key={child.uuid}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        espesorBase={espesor}
                        position={[center.x, center.y, center.z]}
                        width={width}
                        height={height}
                        depth={depth}
                        material={materiales.WoodBatch}
                        shape="box"
                    />
                );
            }
        });

        return { tablas, overallWidth, overallHeight, overallDepth };
    };

    const { tablas, overallWidth, overallHeight, overallDepth } = renderTablasFromModel();

    return (
        <group ref={groupRef} position={position} rotation={rotation}>
            <group onClick={handleClick}>
                {tablas}
            </group>
            <group ref={detectionBoxRef}>
                <mesh position={[0, overallHeight / 2, 0]} material={materiales.Transparent}>
                    <boxGeometry args={[overallWidth - espesor * 2, overallHeight - espesor * 2, overallDepth - espesor / 4]} />
                </mesh>
            </group>
        </group>
    );
};

export default ArmarioGuzman;