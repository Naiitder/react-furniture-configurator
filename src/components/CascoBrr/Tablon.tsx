import * as React from "react";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

type TablonProps = {
    width: number;
    height: number;
    depth: number;
    position?: [number, number, number];
    color?: string;
    rotation?: [number, number, number];
    nombre?: string;
};

export default function Tablon({
                                   width,
                                   height,
                                   depth,
                                   position = [0, 0, 0],
                                   color = "#8B4513",
                                   rotation = [0, 0, 0],
                                   nombre,
                               }: TablonProps) {
    const meshRef = useRef<THREE.Mesh>(null);


    /*
    // Rotación de prueba para visualizar si es el suelo
    useFrame(() => {
        if (meshRef.current && nombre === "suelo") {
            meshRef.current.rotation.y += 0.001;
        }
    });

     */
    return (
        <mesh ref={meshRef} position={position} rotation={rotation}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}
