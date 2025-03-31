import React, { useRef, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useArmarioConfigurator } from '../../contexts/ArmarioConfigurator';
import { useFrame } from '@react-three/fiber';

export function ArmarioStep(props) {
    const { nodes, materials } = useGLTF('./models/ArmarioStep.glb');

    const {closetWidth, closetHeight, closetDepth, texture} = useArmarioConfigurator();

    const [secciones, setSecciones] = useState(2);

    useFrame((state, delta) => {
      const closetWidthScale = closetWidth / 100; 
      const closetHeightScale = closetHeight / 100; 
      const closetDepthScale = closetDepth / 100; 
    })

    const leftWall = useRef();
    const rightWall = useRef();
    const backWall = useRef();
    const connectorWall = useRef();

     return (
       <group {...props} dispose={null}>
         <group position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]}>
           <mesh geometry={nodes.nodes0.geometry} material={materials.Exterior} ref={leftWall}/>
           <mesh geometry={nodes.nodes1.geometry} material={materials.Exterior} ref={rightWall}/>
           <mesh geometry={nodes.nodes27.geometry} material={materials.Madera}  ref={backWall}/>
           <mesh geometry={nodes.nodes3.geometry} material={materials.Exterior} ref={connectorWall}/>
           <mesh geometry={nodes.nodes5.geometry} material={materials.Exterior} ref={connectorWall}/>
           <mesh geometry={nodes.nodes6.geometry} material={materials.Exterior} ref={connectorWall}/>
           <mesh geometry={nodes.nodes7.geometry} material={materials.Exterior} ref={connectorWall}/>
           <mesh geometry={nodes.nodes8.geometry} material={materials.Madera} ref={backWall}/>
           <mesh geometry={nodes.nodes2.geometry} material={materials.Exterior} ref={connectorWall}/>
         </group>
         <group position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]}>
           <mesh geometry={nodes.nodes107.geometry} material={materials.Puertas} />
           <mesh geometry={nodes.nodes108.geometry} material={materials.Puertas} />
           <mesh geometry={nodes.nodes115.geometry} material={materials.Puertas} />
           <mesh geometry={nodes.nodes116.geometry} material={materials.Puertas} />
         </group>
         <mesh geometry={nodes.nodes109.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes110.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes111.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes112.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes113.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes114.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes125.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes126.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes127.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes128.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes132.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes134.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes152.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes153.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes156.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes157.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes160.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes161.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes162.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes163.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes23.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes24.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes25.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes42.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes43.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes44.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes45.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes46.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes47.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes48.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes49.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes4.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes50.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes52.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes53.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes54.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes55.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes56.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes57.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes58.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes59.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes60.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes61.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes62.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes63.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes64.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes65.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes66.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes67.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes68.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes69.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes70.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes71.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes72.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes73.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes74.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes75.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes76.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes77.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes78.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes79.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes80.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes81.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes82.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes83.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes84.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes85.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes86.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes91.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes92.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes93.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes96.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes97.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
      <mesh geometry={nodes.nodes98.geometry} material={materials.Interior} position={[0, 5.699, 0]} rotation={[Math.PI, 1.571, 0]} />
       </group>
     )
}

useGLTF.preload('./models/ArmarioStep.glb')
