import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useConfigurator } from '../../contexts/Configurator';
import * as Three from 'three'
import { useFrame } from '@react-three/fiber'

export function Mesa2(props) {
    const { nodes, materials } = useGLTF('./models/Mesa2.glb')

    const { legs, legsColor, tableWidth, tableHeight, tableDepth } = useConfigurator();

    useEffect(() => {
        materials.Metal.color = new Three.Color(legsColor);
    }, [legsColor]);

    useFrame((state, delta) => {
        const tableWidthScale = tableWidth / 100;
        const tableHeightScale = tableHeight / 100;
        const tableDepthScale = tableDepth / 100;

        if (tableGroup.current) {
            tableGroup.current.scale.lerp(
                new Three.Vector3(tableWidthScale, tableHeightScale, tableDepthScale),
                delta * 12
            );

            if (rightBackLeg.current && rightFrontLeg.current && leftBackLeg.current && leftFrontLeg.current) {
                leftFrontLeg.current.scale.lerp(new Three.Vector3(1 / tableWidthScale, 1, 1 / tableDepthScale), delta * 12);
                rightFrontLeg.current.scale.lerp(new Three.Vector3(1 / tableWidthScale, 1, 1 / tableDepthScale), delta * 12);
                leftBackLeg.current.scale.lerp(new Three.Vector3(1 / tableWidthScale, 1, 1 / tableDepthScale), delta * 12);
                rightBackLeg.current.scale.lerp(new Three.Vector3(1 / tableWidthScale, 1, 1 / tableDepthScale), delta * 12);
            }

            if (cornersBarsBack.current && cornersBarsFront.current) {
                cornersBarsBack.current.scale.lerp(new Three.Vector3(tableWidthScale, 1, 1), delta * 12);
                cornersBarsFront.current.scale.lerp(new Three.Vector3(tableWidthScale, 1, 1), delta * 12);
            }

        }

    });

    const plate = useRef();
    const cornersBarsBack = useRef();
    const cornersBarsFront = useRef();
    const tableGroup = useRef();
    const leftFrontLeg = useRef();
    const rightFrontLeg = useRef();
    const leftBackLeg = useRef();
    const rightBackLeg = useRef();

    return (
        <group {...props} dispose={null}>
            <group ref={tableGroup}>
                <mesh castShadow geometry={nodes.pCube1.geometry} material={materials.Madera} position={[0, 1.475, -0.629]} ref={plate} />

                {legs === 0 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface1.geometry} material={materials.Metal} position={[1.327, 0.602, -1.515]} ref={leftBackLeg} />
                        <mesh castShadow geometry={nodes.polySurface2.geometry} material={materials.Metal} position={[-1.327, 0.602, -1.515]} ref={rightBackLeg} />
                        <mesh castShadow geometry={nodes.polySurface3.geometry} material={materials.Metal} position={[1.327, 0.602, 0.253]} ref={leftFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface4.geometry} material={materials.Metal} position={[-1.327, 0.602, 0.253]} ref={rightFrontLeg} />
                    </>
                )}
                {legs === 1 && (
                    <>
                        <group>
                            <group>
                                <mesh castShadow geometry={nodes.Pata2IntermedioBack.geometry} material={materials.Metal} position={[1.326, 1.304, -0.634]} />
                                <mesh castShadow geometry={nodes.Pata2IzqConexionBack.geometry} material={materials.Metal} position={[1.326, 1.285, -1.345]} />
                                <mesh castShadow geometry={nodes.Pata2DerConexionBack.geometry} material={materials.Metal} position={[1.327, 1.285, 0.077]} />
                            </group>
                            <mesh castShadow geometry={nodes.Pata2DerBack001.geometry} material={materials.Metal} position={[1.326, 0.624, 0.246]} />
                            <mesh castShadow geometry={nodes.Pata2IzqBack001.geometry} material={materials.Metal} position={[1.326, 0.624, -1.514]} />
                        </group>
                        <group>
                            <mesh castShadow geometry={nodes.Pata2IntermedioFront.geometry} material={materials.Metal} position={[-1.326, 1.304, -0.634]} />
                            <mesh castShadow geometry={nodes.Pata2DerConexionFront.geometry} material={materials.Metal} position={[-1.327, 1.285, 0.077]} />
                            <mesh castShadow geometry={nodes.Pata2DerFront001.geometry} material={materials.Metal} position={[-1.326, 0.624, 0.246]} />
                            <mesh castShadow geometry={nodes.Pata2IzqConexionFront.geometry} material={materials.Metal} position={[-1.326, 1.285, -1.345]} />
                            <mesh castShadow geometry={nodes.Pata2IzqFront.geometry} material={materials.Metal} position={[-1.326, 0.625, -1.514]} />
                        </group>
                    </>
                )}
                {legs === 2 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface27001.geometry} material={materials.Metal} position={[1.326, -0.114, -0.636]} />
                        <mesh castShadow geometry={nodes.polySurface28001.geometry} material={materials.Metal} position={[1.326, 1.332, -0.636]} />
                        <mesh castShadow geometry={nodes.polySurface30001.geometry} material={materials.Metal} position={[1.326, 0.611, -1.518]} />
                        <mesh castShadow geometry={nodes.polySurface31001.geometry} material={materials.Metal} position={[1.326, 0.611, 0.246]} />
                        <mesh castShadow geometry={nodes.polySurface27.geometry} material={materials.Metal} position={[-1.326, -0.114, -0.636]} />
                        <mesh castShadow geometry={nodes.polySurface28.geometry} material={materials.Metal} position={[-1.326, 1.332, -0.636]} />
                        <mesh castShadow geometry={nodes.polySurface30.geometry} material={materials.Metal} position={[-1.326, 0.611, -1.518]} />
                        <mesh castShadow geometry={nodes.polySurface31.geometry} material={materials.Metal} position={[-1.326, 0.611, 0.246]} />
                    </>
                )}
                {legs === 3 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface10.geometry} material={materials.Metal} position={[-1.336, 0.677, -1.632]} ref={leftBackLeg} />
                        <mesh castShadow geometry={nodes.polySurface9.geometry} material={materials.Metal} position={[-1.336, 0.676, 0.286]} ref={leftFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface12.geometry} material={materials.Metal} position={[1.336, 0.676, 0.286]} ref={rightFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface13.geometry} material={materials.Metal} position={[1.336, 0.677, -1.632]} ref={rightBackLeg} />
                    </>
                )}
                {legs === 4 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface14.geometry} material={materials.Metal} position={[1.131, 0.655, 0.082]} ref={rightFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface15.geometry} material={materials.Metal} position={[-1.131, 0.655, 0.082]} ref={leftFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface16.geometry} material={materials.Metal} position={[1.131, 0.655, -1.487]} ref={rightBackLeg} />
                        <mesh castShadow geometry={nodes.polySurface17.geometry} material={materials.Metal} position={[-1.131, 0.655, -1.487]} ref={leftBackLeg} />
                    </>
                )}
            </group>
        </group>
    )
}

useGLTF.preload('./models/Mesa2.glb')
