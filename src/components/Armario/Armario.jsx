import React, { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import * as Three from 'three';

export function Armario(props) {
    const { nodes, materials } = useGLTF('./models/Armario.glb');
    const [selected, setSelected] = useState(false);

    useEffect(() => {
        if (materials.WoodArmario) {
            materials.WoodArmario.color = new Three.Color('gray');
        }
    }, [materials]);


    return (
        <group {...props} dispose={null}>
            <group>
                <mesh
                    geometry={nodes.pCube1.geometry}
                    material={materials.WoodArmario}
                />
                {!selected ? (<>
                    <group position={[-2.069, 4.12, 0.118]} onClick={() => { setSelected(!selected) }}>
                        <mesh geometry={nodes.Mesh002.geometry} material={materials.MaderaArmario} />
                        <mesh geometry={nodes.Mesh002_1.geometry} material={materials.aiStandardSurface2} />
                    </group>
                </>) : (
                    <group rotation={[0, -Math.PI / 2, 0]} position={[-2.069, 4.12, 0.118]} onClick={() => { setSelected(!selected) }}>
                        <mesh geometry={nodes.Mesh002.geometry} material={materials.MaderaArmario} />
                        <mesh geometry={nodes.Mesh002_1.geometry} material={materials.aiStandardSurface2} />
                    </group>
                )}
                <group position={[2.086, 4.167, 0.101]}>
                    <mesh geometry={nodes.Mesh003.geometry} material={materials.MaderaArmario} />
                    <mesh geometry={nodes.Mesh003_1.geometry} material={materials.aiStandardSurface2} />
                </group>
                <mesh geometry={nodes.Mesh005.geometry} material={materials.MaderaArmario} />
                <mesh geometry={nodes.Mesh005_1.geometry} material={materials.aiStandardSurface2} />
                <mesh geometry={nodes.Mesh006.geometry} material={materials.MaderaArmario} />
                <mesh geometry={nodes.Mesh006_1.geometry} material={materials.aiStandardSurface2} />
                <mesh geometry={nodes.Mesh001.geometry} material={materials.MaderaArmario} />
                <mesh geometry={nodes.Mesh001_1.geometry} material={materials.aiStandardSurface2} />
                <mesh geometry={nodes.Mesh004.geometry} material={materials.MaderaArmario} />
                <mesh geometry={nodes.Mesh004_1.geometry} material={materials.aiStandardSurface2} />
            </group>
        </group>
    );
}

useGLTF.preload('./models/Armario.glb');
