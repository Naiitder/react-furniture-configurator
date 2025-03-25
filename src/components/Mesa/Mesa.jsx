import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useConfigurator } from '../../contexts/Configurator';
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

      if (polySurface18Ref.current && polySurface20Ref.current && polySurface21Ref.current) {
        polySurface20Ref.current.scale.lerp(new Three.Vector3(1/tableWidthScale, 1, 1/tableDepthScale), delta * 5);  // Escalamos con valores normales
        polySurface21Ref.current.scale.lerp(new Three.Vector3(1/tableWidthScale, 1, 1/tableDepthScale), delta * 5);  

        const pos18 = new Three.Vector3().setFromMatrixPosition(polySurface18Ref.current.matrixWorld);
        const pos20 = new Three.Vector3().setFromMatrixPosition(polySurface20Ref.current.matrixWorld);
        const pos21 = new Three.Vector3().setFromMatrixPosition(polySurface21Ref.current.matrixWorld);
    
        // Calcular la distancia entre los puntos
        let distance20 = pos18.distanceTo(pos20);
        let distance21 = pos18.distanceTo(pos21);
    
        // Limitar la distancia (esto evita que la escala se vuelva excesivamente grande o pequeña)
        distance20 = Three.MathUtils.clamp(distance20, 0.5, 2); // Limitar entre 0.5 y 2 unidades
        distance21 = Three.MathUtils.clamp(distance21, 0.5, 2); // Limitar entre 0.5 y 2 unidades
    
        // Escalar progresivamente
        polySurface18Ref.current.scale.lerp(new Three.Vector3(1/tableWidthScale, distance20, distance20), delta * 5);  // Escalamos en la dirección Y según la distancia
// Escalamos con valores normales
      }

      
    }

  });

  const plate = useRef();
  const tableGroup = useRef();
  const leftFrontLeg = useRef();
  const rightFrontLeg = useRef();
  const leftBackLeg = useRef();
  const rightBackLeg = useRef();

  const polySurface18Ref = useRef();
  const polySurface20Ref = useRef();
  const polySurface21Ref = useRef();

  return (
    <group {...props} dispose={null}>
      <group ref={tableGroup}>
        <mesh castShadow geometry={nodes.pCube1.geometry} material={materials.Madera} position={[0, 1.475, -0.629]} ref={plate} />

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
            <group>
              <mesh castShadow geometry={nodes.polySurface18.geometry} material={materials.LightMetal} position={[-1.326, 1.318, -0.634]} ref={polySurface18Ref} />
              <mesh castShadow geometry={nodes.polySurface20.geometry} material={materials.LightMetal} position={[-1.326, 0.617, 0.246]} ref={polySurface20Ref}/>
              <mesh castShadow geometry={nodes.polySurface21.geometry} material={materials.LightMetal} position={[-1.326, 0.618, -1.514]} ref={polySurface21Ref}/>
            </group>
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