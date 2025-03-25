import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useConfigurator } from '../../contexts/Configurator';
import * as Three from 'three'
import { useFrame } from '@react-three/fiber'


export function Mesa2(props) {
    const { nodes, materials } = useGLTF('./models/Mesa.glb')

    const { legs, legsColor, tableWidth, tableHeight, tableDepth } = useConfigurator();

    useEffect(() => {
        materials.LightMetal.color = new Three.Color(legsColor);
    }, [legsColor]);

    useFrame((state, delta) => {
        const tableWidthScale = tableWidth / 100;
        const tableHeightScale = tableHeight / 100;
        const tableDepthScale = tableDepth / 100;

        if (plate.current) {
            plate.current.scale.lerp(
                new Three.Vector3(tableWidthScale, tableHeightScale, tableDepthScale),
                delta * 12
            );
            plate.current.material.map.repeat.set(tableDepthScale, tableWidthScale);
            console.log(plate.current);
        }

        if (rightBackLeg.current && rightFrontLeg.current && leftBackLeg.current && leftFrontLeg.current) {
            leftBackLeg.current.position.lerp(new Three.Vector3(-tableWidthScale, 0.596, -tableDepthScale/1.225), delta * 12);
            rightBackLeg.current.position.lerp(new Three.Vector3(tableWidthScale, 0.596, -tableDepthScale/1.225), delta * 12);
            leftFrontLeg.current.position.lerp(new Three.Vector3(-tableWidthScale, 0.596, tableDepthScale/1.225), delta * 12);
            rightFrontLeg.current.position.lerp(new Three.Vector3(tableWidthScale, 0.596, tableDepthScale/1.225), delta * 12);

            if (connectorBack.current && connectorFront.current){
                connectorBack.current.position.lerp(new Three.Vector3(-tableWidthScale,1.318,0),delta*12);
                connectorFront.current.position.lerp(new Three.Vector3(tableWidthScale,1.318,0),delta*12);

                connectorBack.current.scale.lerp(new Three.Vector3(1,1,tableDepthScale),delta*12);
                connectorFront.current.scale.lerp(new Three.Vector3(1,1,tableDepthScale),delta*12);
            }

            if (connectorBackUp.current && connectorFrontUp.current && connectorBackDown.current && connectorFrontDown.current){
                connectorBackUp.current.position.lerp(new Three.Vector3(-tableWidthScale,1.332,0),delta*12);
                connectorFrontUp.current.position.lerp(new Three.Vector3(tableWidthScale,1.332,0),delta*12);
                connectorBackDown.current.position.lerp(new Three.Vector3(-tableWidthScale,-0.121,0),delta*12);
                connectorFrontDown.current.position.lerp(new Three.Vector3(tableWidthScale,-0.121,0),delta*12);

                connectorBackUp.current.scale.lerp(new Three.Vector3(1,1,tableDepthScale),delta*12);
                connectorFrontUp.current.scale.lerp(new Three.Vector3(1,1,tableDepthScale),delta*12);
                connectorBackDown.current.scale.lerp(new Three.Vector3(1,1,tableDepthScale),delta*12);
                connectorFrontDown.current.scale.lerp(new Three.Vector3(1,1,tableDepthScale),delta*12);
            }
        }

    });

    const plate = useRef();

    const leftFrontLeg = useRef();
    const rightFrontLeg = useRef();
    const leftBackLeg = useRef();
    const rightBackLeg = useRef();

    const connectorBack = useRef();
    const connectorFront = useRef();

    const connectorBackUp = useRef();
    const connectorFrontUp = useRef();
    const connectorBackDown = useRef();
    const connectorFrontDown = useRef();


    return (
        <group {...props} dispose={null}>
            <group>
                <mesh castShadow geometry={nodes.pCube1.geometry} material={materials.Madera} position={[0, 1.475, 0]} ref={plate} />

                {legs === 0 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface1.geometry} material={materials.LightMetal} position={[1.327, 0.596, -1.515]} ref={leftBackLeg} />
                        <mesh castShadow geometry={nodes.polySurface2.geometry} material={materials.LightMetal} position={[-1.327, 0.596, -1.515]} ref={rightBackLeg} />
                        <mesh castShadow geometry={nodes.polySurface3.geometry} material={materials.LightMetal} position={[1.327, 0.596, 0.253]} ref={rightFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface4.geometry} material={materials.LightMetal} position={[-1.327, 0.596, 0.253]} ref={leftFrontLeg} />
                    </>
                )}
                {legs === 1 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface18.geometry} material={materials.LightMetal} position={[-1.326, 1.318, -0.634]} ref={connectorBack}/>    
                        <mesh castShadow geometry={nodes.polySurface20.geometry} material={materials.LightMetal} position={[-1.326, 0.617, 0.246]} ref={leftFrontLeg}/>
                        <mesh castShadow geometry={nodes.polySurface21.geometry} material={materials.LightMetal} position={[-1.326, 0.618, -1.514]} ref={leftBackLeg}/>
                        
                        <mesh castShadow geometry={nodes.polySurface22.geometry} material={materials.LightMetal} position={[1.326, 1.318, -0.634]} ref={connectorFront}/>
                        <mesh castShadow geometry={nodes.polySurface24.geometry} material={materials.LightMetal} position={[1.326, 0.617, 0.246]} ref={rightFrontLeg}/>
                        <mesh castShadow geometry={nodes.polySurface25.geometry} material={materials.LightMetal} position={[1.326, 0.618, -1.514]} ref={rightBackLeg}/>
                    </>
                )}
                {legs === 2 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface27001.geometry} material={materials.LightMetal} position={[1.326, -0.121, -0.636]} ref={connectorFrontDown}/>
                        <mesh castShadow geometry={nodes.polySurface28001.geometry} material={materials.LightMetal} position={[1.326, 1.332, -0.636]} ref={connectorFrontUp}/>
                        <mesh castShadow geometry={nodes.polySurface30001.geometry} material={materials.LightMetal} position={[1.326, 0.606, -1.518]} ref={rightBackLeg}/>
                        <mesh castShadow geometry={nodes.polySurface31001.geometry} material={materials.LightMetal} position={[1.326, 0.606, 0.246]} ref={rightFrontLeg}/>
                        <mesh castShadow geometry={nodes.polySurface27.geometry} material={materials.LightMetal} position={[-1.326, -0.121, -0.636]} ref={connectorBackDown}/>
                        <mesh castShadow geometry={nodes.polySurface28.geometry} material={materials.LightMetal} position={[-1.326, 1.332, -0.636]} ref={connectorBackUp}/>
                        <mesh castShadow geometry={nodes.polySurface30.geometry} material={materials.LightMetal} position={[-1.326, 0.606, -1.518]} ref={leftBackLeg}/>
                        <mesh castShadow geometry={nodes.polySurface31.geometry} material={materials.LightMetal} position={[-1.326, 0.606, 0.246]} ref={leftFrontLeg}/>
                    </>
                )}
                {legs === 3 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface10.geometry} material={materials.LightMetal} position={[-1.334, 0.686, -1.63]} ref={leftBackLeg} />
                        <mesh castShadow geometry={nodes.polySurface9.geometry} material={materials.LightMetal} position={[-1.334, 0.686, 0.285]} ref={leftFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface12.geometry} material={materials.LightMetal} position={[1.334, 0.686, 0.285]} ref={rightFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface13.geometry} material={materials.LightMetal} position={[1.334, 0.686, -1.63]} ref={rightBackLeg} />
                    </>
                )}
                {legs === 4 && (
                    <>
                        <mesh castShadow geometry={nodes.polySurface14.geometry} material={materials.LightMetal} position={[1.131, 0.66, 0.081]} ref={rightFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface15.geometry} material={materials.LightMetal} position={[-1.131, 0.66, 0.081]} ref={leftFrontLeg} />
                        <mesh castShadow geometry={nodes.polySurface16.geometry} material={materials.LightMetal} position={[1.131, 0.66, -1.486]} ref={rightBackLeg} />
                        <mesh castShadow geometry={nodes.polySurface17.geometry} material={materials.LightMetal} position={[-1.131, 0.66, -1.486]} ref={leftBackLeg} />
                    </>
                )}
            </group>
        </group>
    )
}

useGLTF.preload('./models/Mesa.glb')