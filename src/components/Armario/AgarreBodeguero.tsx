import {useGLTF} from "@react-three/drei";
import React from "react";


export function AgarreBodeguero(props) {
    const { nodes, materials } = useGLTF('./models/PomoGuzman.glb')
    console.log(materials)
    return (
        <group {...props} dispose={null} scale={[0.01, 0.01, 0.01]}>
            <mesh geometry={nodes.Box001.geometry} material={materials["Material #0"]} position={[0, 0, 0.07]} />
        </group>
    )
}