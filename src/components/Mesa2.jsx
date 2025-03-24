import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useConfigurator } from '../contexts/Configurator';
import * as Three from 'three'
import { useFrame } from '@react-three/fiber'

export function Mesa(props) {
  const { nodes, materials } = useGLTF('./models/Mesa.glb')

  const { legs, legsColor, tableWidth, tableHeight, tableDepth } = useConfigurator();

  useEffect(() => {
    materials.LightMetal.color = new Three.Color(legsColor);
  }, [legsColor]);

  useFrame((state, delta) => {
    const tableWidthScale = tableWidth / 100;
    const tableHeightScale = tableHeight / 100;
    const tableDepthScale = tableDepth / 100;

    const targetScale = new Three.Vector3(tableWidthScale, tableHeightScale, tableDepthScale);

        const targetLeftFrontPosition = new Three.Vector3(-1.327*tableWidthScale, 0.596, 0.253*tableDepthScale);
        leftFrontLeg.current.position.lerp(targetLeftFrontPosition, delta*12);


        const targetLeftBackPosition = new Three.Vector3(-1.327*tableWidthScale, 0.596, -1.515*tableDepthScale);
        leftBackLeg.current.position.lerp(targetLeftBackPosition, delta*12);

    
        const targetRightFrontPosition = new Three.Vector3(1.327*tableWidthScale, 0.596, 0.253*tableDepthScale);
        rightFrontLeg.current.position.lerp(targetRightFrontPosition, delta*12);

        const targetRightBackPosition = new Three.Vector3(1.327*tableWidthScale, 0.596, -1.515*tableDepthScale);
        rightBackLeg.current.position.lerp(targetRightBackPosition, delta*12);


    plate.current.scale.lerp(targetScale, delta * 12);

  });

  const plate = useRef();
  const leftFrontLeg = useRef();
  const rightFrontLeg = useRef();
  const leftBackLeg = useRef();
  const rightBackLeg = useRef();

  return (
    <group {...props} dispose={null}>
      <mesh castShadow geometry={nodes.pCube1.geometry} material={materials.Madera} position={[0, 1.475, -0.629]} ref={plate} />

      {legs === 0 && (
        <>
          <mesh castShadow geometry={nodes.polySurface1.geometry} material={materials.LightMetal} position={[1.327, 0.596, -1.515]} ref={leftBackLeg} />
          <mesh castShadow geometry={nodes.polySurface2.geometry} material={materials.LightMetal} position={[-1.327, 0.596, -1.515]} ref={rightBackLeg} />
          <mesh castShadow geometry={nodes.polySurface3.geometry} material={materials.LightMetal} position={[1.327, 0.596, 0.253]} ref={rightFrontLeg}/>
          <mesh castShadow geometry={nodes.polySurface4.geometry} material={materials.LightMetal} position={[-1.327, 0.596, 0.253]} ref={leftFrontLeg}/>
        </>
      )}
      {legs === 1 && (
        <>
          <mesh castShadow geometry={nodes.polySurface18.geometry} material={materials.LightMetal} position={[-1.326, 1.318, -0.634]} />
          <mesh castShadow geometry={nodes.polySurface20.geometry} material={materials.LightMetal} position={[-1.326, 0.617, 0.246]} />
          <mesh castShadow geometry={nodes.polySurface21.geometry} material={materials.LightMetal} position={[-1.326, 0.618, -1.514]} />
          <mesh castShadow geometry={nodes.polySurface22.geometry} material={materials.LightMetal} position={[1.326, 1.318, -0.634]} />
          <mesh castShadow geometry={nodes.polySurface24.geometry} material={materials.LightMetal} position={[1.326, 0.617, 0.246]} />
          <mesh castShadow geometry={nodes.polySurface25.geometry} material={materials.LightMetal} position={[1.326, 0.618, -1.514]} />
        </>
      )}
      {legs === 2 && (
        <>
          <mesh castShadow geometry={nodes.polySurface27001.geometry} material={materials.LightMetal} position={[1.326, -0.121, -0.636]} />
          <mesh castShadow geometry={nodes.polySurface28001.geometry} material={materials.LightMetal} position={[1.326, 1.332, -0.636]} />
          <mesh castShadow geometry={nodes.polySurface30001.geometry} material={materials.LightMetal} position={[1.326, 0.606, -1.518]} />
          <mesh castShadow geometry={nodes.polySurface31001.geometry} material={materials.LightMetal} position={[1.326, 0.606, 0.246]} />
          <mesh castShadow geometry={nodes.polySurface27.geometry} material={materials.LightMetal} position={[-1.326, -0.121, -0.636]} />
          <mesh castShadow geometry={nodes.polySurface28.geometry} material={materials.LightMetal} position={[-1.326, 1.332, -0.636]} />
          <mesh castShadow geometry={nodes.polySurface30.geometry} material={materials.LightMetal} position={[-1.326, 0.606, -1.518]} />
          <mesh castShadow geometry={nodes.polySurface31.geometry} material={materials.LightMetal} position={[-1.326, 0.606, 0.246]} />
        </>
      )}
      {legs === 3 && (
        <>
          <mesh castShadow geometry={nodes.polySurface10.geometry} material={materials.LightMetal} position={[-1.334, 0.686, -1.63]} ref={leftBackLeg}/>
          <mesh castShadow geometry={nodes.polySurface9.geometry} material={materials.LightMetal} position={[-1.334, 0.686, 0.285]} ref={leftFrontLeg}/>
          <mesh castShadow geometry={nodes.polySurface12.geometry} material={materials.LightMetal} position={[1.334, 0.686, 0.285]} ref={rightFrontLeg}/>
          <mesh castShadow geometry={nodes.polySurface13.geometry} material={materials.LightMetal} position={[1.334, 0.686, -1.63]} ref={rightBackLeg}/>
        </>
      )}
      {legs === 4 && (
        <>
          <mesh castShadow geometry={nodes.polySurface14.geometry} material={materials.LightMetal} position={[1.131, 0.66, 0.081]} ref={rightFrontLeg}/>
          <mesh castShadow geometry={nodes.polySurface15.geometry} material={materials.LightMetal} position={[-1.131, 0.66, 0.081]} ref={leftFrontLeg}/>
          <mesh castShadow geometry={nodes.polySurface16.geometry} material={materials.LightMetal} position={[1.131, 0.66, -1.486]} ref={rightBackLeg}/>
          <mesh castShadow geometry={nodes.polySurface17.geometry} material={materials.LightMetal} position={[-1.131, 0.66, -1.486]} ref={leftBackLeg}/>
        </>
      )}
    </group>
  )
}

useGLTF.preload('./models/Mesa.glb')