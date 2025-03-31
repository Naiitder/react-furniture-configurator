import React, {useEffect, useRef, useState} from 'react'
import {useGLTF} from '@react-three/drei'
import {useArmarioConfigurator} from '../../contexts/ArmarioConfigurator';
import * as Three from 'three'
import {useFrame} from '@react-three/fiber';

export function ArmarioStep(props) {
    const {nodes, materials} = useGLTF('./models/ArmarioStep.glb');

    const {closetWidth, closetHeight, closetDepth, texture} = useArmarioConfigurator();

    const [secciones, setSecciones] = useState(2);

    useFrame((state, delta) => {
            const closetWidthScale = closetWidth / 100;
            const closetHeightScale = closetHeight / 100;
            const closetDepthScale = closetDepth / 100;

            const box = new Three.Box3().setFromObject(connectorWalls.current[4])
            const size = new Three.Vector3()
            box.getSize(size)

            connectorWalls.current.forEach((wall) => {
                if (wall) {
                    wall.scale.set(closetWidthScale, closetHeightScale, closetDepthScale);
                }
            });

            if (backWall.current) {
                backWall.current.scale.set(closetWidthScale * 2, closetHeightScale, closetDepthScale);
                backWall.current.position.set(0, backWall.current.position.y, -closetDepthScale / 1.6);

                // backWall.material.map.repeat.set(closetWidthScale, closetDepthScale);

            }

            if (leftWall.current) {
                leftWall.current.position.set(-size.x / 2, leftWall.current.position.y, leftWall.current.position.z);
                leftWall.current.scale.set(1, 1, closetDepthScale);
            }
            if (rightWall.current) {
                rightWall.current.position.set(size.x / 2, rightWall.current.position.y, rightWall.current.position.z);
                rightWall.current.scale.set(1, 1, closetDepthScale);
            }
            materials.Exterior.map.repeat.set(closetWidthScale, closetDepthScale);

        }
    )

    const leftWall = useRef();
    const rightWall = useRef();
    const backWall = useRef();
    const connectorWalls = useRef([]);


    return (
        <group {...props} dispose={null}>
            <group>
                <mesh geometry={nodes.nodes0.geometry} material={materials.Exterior} position={[-2.463, 2.864, 0.096]}
                      ref={leftWall}/>
                <mesh geometry={nodes.nodes1.geometry} material={materials.Exterior} position={[2.463, 2.864, 0.096]}
                      ref={rightWall}/>
                <mesh geometry={nodes.nodes27.geometry} material={materials.Exterior} position={[0, 2.902, -0.678]}
                      scale={[3, 1, 1]}
                      ref={backWall}/>
                <mesh geometry={nodes.nodes3.geometry} material={materials.Exterior} position={[0, 0.038, 0.075]}
                      ref={(el) => connectorWalls.current[0] = el}/>
                <mesh geometry={nodes.nodes5.geometry} material={materials.Exterior} position={[0, 5.827, 0.833]}
                      ref={(el) => connectorWalls.current[1] = el}/>
                <mesh geometry={nodes.nodes6.geometry} material={materials.Exterior} position={[0, -0.061, 0.851]}
                      ref={(el) => connectorWalls.current[2] = el}/>
                <mesh geometry={nodes.nodes7.geometry} material={materials.Exterior} position={[0, -0.054, -0.538]}
                      ref={(el) => connectorWalls.current[3] = el}/>
                {/*<mesh geometry={nodes.nodes8.geometry} material={materials.Madera} position={[-1.225, 2.902, -0.678]}*/}
                {/*      ref={backWall}/>*/}
                <mesh geometry={nodes.nodes2.geometry} material={materials.Exterior} position={[0, 5.766, 0.07]}
                      ref={(el) => connectorWalls.current[4] = el}/>

            </group>
            <group>
                <mesh geometry={nodes.nodes107.geometry} material={materials.Puertas}
                      position={[-1.188, 2.902, 0.854]}/>
                <mesh geometry={nodes.nodes108.geometry} material={materials.Puertas} position={[1.187, 2.902, 0.759]}/>
                <mesh geometry={nodes.nodes115.geometry} material={materials.Puertas} position={[0, 0.046, 0.854]}/>
                <mesh geometry={nodes.nodes116.geometry} material={materials.Puertas} position={[0, 0.046, 0.759]}/>
            </group>
            <group>
                <mesh geometry={nodes.nodes109.geometry} material={materials.Interior}
                      position={[-2.373, 2.902, 0.84]}/>
                <mesh geometry={nodes.nodes110.geometry} material={materials.Interior}
                      position={[-0.002, 2.902, 0.84]}/>
                <mesh geometry={nodes.nodes111.geometry} material={materials.Interior}
                      position={[0.002, 2.902, 0.745]}/>
                <mesh geometry={nodes.nodes112.geometry} material={materials.Interior}
                      position={[2.373, 2.902, 0.745]}/>
                <mesh geometry={nodes.nodes113.geometry} material={materials.Interior} position={[0, 5.757, 0.854]}/>
                <mesh geometry={nodes.nodes114.geometry} material={materials.Interior} position={[0, 5.757, 0.759]}/>
                <mesh geometry={nodes.nodes125.geometry} material={materials.Interior}
                      position={[2.417, 4.634, 0.009]}/>
                <mesh geometry={nodes.nodes126.geometry} material={materials.Interior}
                      position={[0.032, 4.634, 0.009]}/>
                <mesh geometry={nodes.nodes127.geometry} material={materials.Interior}
                      position={[1.224, 4.638, 0.009]}/>
                <mesh geometry={nodes.nodes128.geometry} material={materials.Interior}
                      position={[2.375, 5.762, 0.671]}/>
                <mesh geometry={nodes.nodes132.geometry} material={materials.Interior}
                      position={[-2.375, 5.762, 0.671]}/>
                <mesh geometry={nodes.nodes134.geometry} material={materials.Interior}
                      position={[-2.375, 5.762, -0.434]}/>
                <mesh geometry={nodes.nodes152.geometry} material={materials.Interior} position={[0, 5.735, 0.526]}/>
                <mesh geometry={nodes.nodes153.geometry} material={materials.Interior} position={[0, 5.735, -0.434]}/>
                <mesh geometry={nodes.nodes156.geometry} material={materials.Interior} position={[0, 5.727, 0.446]}/>
                <mesh geometry={nodes.nodes157.geometry} material={materials.Interior} position={[0, 5.727, -0.354]}/>
                <mesh geometry={nodes.nodes160.geometry} material={materials.Interior}
                      position={[-1.224, 4.738, 0.506]}/>
                <mesh geometry={nodes.nodes161.geometry} material={materials.Interior}
                      position={[-1.224, 4.738, -0.496]}/>
                <mesh geometry={nodes.nodes162.geometry} material={materials.Interior}
                      position={[-1.224, 1.477, 0.506]}/>
                <mesh geometry={nodes.nodes163.geometry} material={materials.Interior}
                      position={[-1.224, 1.477, -0.496]}/>
                <mesh geometry={nodes.nodes23.geometry} material={materials.Interior}
                      position={[-0.06, 1.379, -0.694]}/>
                <mesh geometry={nodes.nodes24.geometry} material={materials.Interior}
                      position={[-2.388, 1.379, -0.694]}/>
                <mesh geometry={nodes.nodes25.geometry} material={materials.Interior}
                      position={[-0.06, 0.317, -0.694]}/>
                <mesh geometry={nodes.nodes42.geometry} material={materials.Interior}
                      position={[-1.224, 1.424, 0.006]}/>
                <mesh geometry={nodes.nodes43.geometry} material={materials.Interior}
                      position={[-2.423, 1.381, 0.469]}/>
                <mesh geometry={nodes.nodes44.geometry} material={materials.Interior}
                      position={[-2.423, 1.381, -0.566]}/>
                <mesh geometry={nodes.nodes45.geometry} material={materials.Interior}
                      position={[-0.029, 1.381, 0.469]}/>
                <mesh geometry={nodes.nodes46.geometry} material={materials.Interior}
                      position={[-0.029, 1.381, -0.566]}/>
                <mesh geometry={nodes.nodes47.geometry} material={materials.Interior} position={[1.224, 1.424, 0.006]}/>
                <mesh geometry={nodes.nodes48.geometry} material={materials.Interior} position={[0.029, 1.381, 0.469]}/>
                <mesh geometry={nodes.nodes49.geometry} material={materials.Interior}
                      position={[0.029, 1.381, -0.566]}/>
                <mesh geometry={nodes.nodes4.geometry} material={materials.Interior} position={[0, 2.902, -0.003]}/>
                <mesh geometry={nodes.nodes50.geometry} material={materials.Interior} position={[2.423, 1.381, 0.469]}/>
                <mesh geometry={nodes.nodes52.geometry} material={materials.Interior}
                      position={[-0.289, 0.141, 0.117]}/>
                <mesh geometry={nodes.nodes53.geometry} material={materials.Interior} position={[-2.16, 0.141, 0.117]}/>
                <mesh geometry={nodes.nodes54.geometry} material={materials.Interior}
                      position={[-2.129, 0.249, 0.066]}/>
                <mesh geometry={nodes.nodes55.geometry} material={materials.Interior} position={[-0.32, 0.247, 0.064]}/>
                <mesh geometry={nodes.nodes56.geometry} material={materials.Interior}
                      position={[-1.224, 0.249, -0.552]}/>
                <mesh geometry={nodes.nodes57.geometry} material={materials.Interior}
                      position={[-1.225, 0.257, 0.708]}/>
                <mesh geometry={nodes.nodes58.geometry} material={materials.Interior}
                      position={[-1.224, 0.148, 0.062]}/>
                <mesh geometry={nodes.nodes59.geometry} material={materials.Interior}
                      position={[-0.321, 0.277, 0.669]}/>
                <mesh geometry={nodes.nodes60.geometry} material={materials.Interior}
                      position={[-0.321, 0.229, 0.669]}/>
                <mesh geometry={nodes.nodes61.geometry} material={materials.Interior}
                      position={[-0.289, 0.581, 0.117]}/>
                <mesh geometry={nodes.nodes62.geometry} material={materials.Interior} position={[-2.16, 0.581, 0.117]}/>
                <mesh geometry={nodes.nodes63.geometry} material={materials.Interior}
                      position={[-2.128, 0.689, 0.066]}/>
                <mesh geometry={nodes.nodes64.geometry} material={materials.Interior} position={[-0.32, 0.687, 0.064]}/>
                <mesh geometry={nodes.nodes65.geometry} material={materials.Interior}
                      position={[-1.224, 0.689, -0.552]}/>
                <mesh geometry={nodes.nodes66.geometry} material={materials.Interior}
                      position={[-1.225, 0.697, 0.708]}/>
                <mesh geometry={nodes.nodes67.geometry} material={materials.Interior}
                      position={[-1.224, 0.588, 0.063]}/>
                <mesh geometry={nodes.nodes68.geometry} material={materials.Interior}
                      position={[-0.321, 0.717, 0.669]}/>
                <mesh geometry={nodes.nodes69.geometry} material={materials.Interior}
                      position={[-0.321, 0.669, 0.669]}/>
                <mesh geometry={nodes.nodes70.geometry} material={materials.Interior}
                      position={[-0.289, 1.021, 0.117]}/>
                <mesh geometry={nodes.nodes71.geometry} material={materials.Interior} position={[-2.16, 1.021, 0.117]}/>
                <mesh geometry={nodes.nodes72.geometry} material={materials.Interior}
                      position={[-2.128, 1.129, 0.066]}/>
                <mesh geometry={nodes.nodes73.geometry} material={materials.Interior} position={[-0.32, 1.127, 0.064]}/>
                <mesh geometry={nodes.nodes74.geometry} material={materials.Interior}
                      position={[-1.224, 1.129, -0.552]}/>
                <mesh geometry={nodes.nodes75.geometry} material={materials.Interior}
                      position={[-1.225, 1.137, 0.708]}/>
                <mesh geometry={nodes.nodes76.geometry} material={materials.Interior}
                      position={[-1.224, 1.028, 0.063]}/>
                <mesh geometry={nodes.nodes77.geometry} material={materials.Interior}
                      position={[-0.321, 1.157, 0.669]}/>
                <mesh geometry={nodes.nodes78.geometry} material={materials.Interior}
                      position={[-0.321, 1.109, 0.669]}/>
                <mesh geometry={nodes.nodes79.geometry} material={materials.Interior}
                      position={[-1.224, 0.086, 0.006]}/>
                <mesh geometry={nodes.nodes80.geometry} material={materials.Interior}
                      position={[-2.206, 0.724, 0.006]}/>
                <mesh geometry={nodes.nodes81.geometry} material={materials.Interior}
                      position={[-0.243, 0.724, 0.006]}/>
                <mesh geometry={nodes.nodes82.geometry} material={materials.Interior} position={[-2.327, 0.724, 0.66]}/>
                <mesh geometry={nodes.nodes83.geometry} material={materials.Interior} position={[-0.122, 0.724, 0.66]}/>
                <mesh geometry={nodes.nodes84.geometry} material={materials.Interior}
                      position={[-2.327, 0.724, -0.648]}/>
                <mesh geometry={nodes.nodes85.geometry} material={materials.Interior}
                      position={[-0.122, 0.724, -0.648]}/>
                <mesh geometry={nodes.nodes86.geometry} material={materials.Interior}
                      position={[-1.224, 4.791, 0.006]}/>
                <mesh geometry={nodes.nodes91.geometry} material={materials.Interior} position={[1.224, 4.791, 0.006]}/>
                <mesh geometry={nodes.nodes92.geometry} material={materials.Interior} position={[0.029, 4.747, 0.469]}/>
                <mesh geometry={nodes.nodes93.geometry} material={materials.Interior}
                      position={[0.029, 4.747, -0.566]}/>
                <mesh geometry={nodes.nodes96.geometry} material={materials.Interior}
                      position={[-1.224, 3.108, 0.005]}/>
                <mesh geometry={nodes.nodes97.geometry} material={materials.Interior}
                      position={[-1.843, 3.669, -0.003]}/>
                <mesh geometry={nodes.nodes98.geometry} material={materials.Interior}
                      position={[-1.843, 2.547, -0.003]}/>
            </group>
        </group>
    )
}

useGLTF.preload('./models/ArmarioStep.glb')
