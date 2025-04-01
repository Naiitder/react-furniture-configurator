import React, {useEffect, useRef, useState} from 'react'
import {useGLTF} from '@react-three/drei'
import {useArmarioConfigurator} from '../../contexts/ArmarioConfigurator';
import * as Three from 'three'
import {useFrame} from '@react-three/fiber';

export function ArmarioStep(props) {
    const {nodes, materials} = useGLTF('./models/ArmarioStep.glb');

    const {closetWidth, closetHeight, closetDepth, texture} = useArmarioConfigurator();

    const [secciones, setSecciones] = useState(2);

    const [sizeX, setSizeX] = useState(0);


    useEffect(() => {
        const nuevasSecciones = Math.ceil(closetWidth / 60);
        setSecciones(nuevasSecciones);
    }, [closetWidth]);


    useFrame((state, delta) => {
            const closetWidthScale = closetWidth / 100;
            const closetHeightScale = closetHeight / 100;
            const closetDepthScale = closetDepth / 100;

            const box = new Three.Box3().setFromObject(connectorWalls.current[4])
            const size = new Three.Vector3()
            box.getSize(size)

            const newSizeX = size.x;
            setSizeX(newSizeX);

            if (closet.current) {
                closet.current.scale.set(1, 1, closetDepthScale);
            }

            connectorWalls.current.forEach((wall) => {
                if (wall) {
                    wall.scale.set(closetWidthScale, closetHeightScale, 1);
                }
            });

            if (backWall.current) {
                backWall.current.scale.set(closetWidthScale * 2, 1, 1);
                backWall.current.position.set(0, backWall.current.position.y, backWall.current.position.z);

                // backWall.material.map.repeat.set(closetWidthScale, closetDepthScale);

            }

            if (leftWall.current) {
                leftWall.current.position.set(-size.x / 2, leftWall.current.position.y, leftWall.current.position.z);
                leftWall.current.scale.set(1, 1, 1);
            }
            if (rightWall.current) {
                rightWall.current.position.set(size.x / 2, rightWall.current.position.y, rightWall.current.position.z);
                rightWall.current.scale.set(1, 1, 1);
            }

            doorConnector.current.forEach((door) => {
                    if (door) {
                        door.scale.set(closetWidthScale, 1, 1);
                    }
                }
            );

            materials.Exterior.map.repeat.set(closetWidthScale, closetDepthScale);

        }
    )

    const leftWall = useRef();
    const rightWall = useRef();
    const backWall = useRef();
    const connectorWalls = useRef([]);
    const closet = useRef();
    const doorConnector = useRef([]);


    return (
        <group {...props} dispose={null}>
            <group ref={closet}>
                <group>
                    <mesh geometry={nodes.nodes0.geometry} material={materials.Exterior}
                          position={[-2.463, 2.864, 0.096]}
                          ref={leftWall}/>
                    <mesh geometry={nodes.nodes1.geometry} material={materials.Exterior}
                          position={[2.463, 2.864, 0.096]}
                          ref={rightWall}/>
                    <mesh geometry={nodes.nodes27.geometry} material={materials.Exterior}
                          position={[1.225, 2.902, -0.678]}
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
                    <mesh geometry={nodes.nodes113.geometry} material={materials.Interior}
                          position={[0, 5.757, 0.854]} ref={(el) => doorConnector.current[0] = el}/>
                    <mesh geometry={nodes.nodes114.geometry} material={materials.Interior}
                          position={[0, 5.757, 0.759]} ref={(el) => doorConnector.current[1] = el}/>
                    <mesh geometry={nodes.nodes115.geometry} material={materials.Interior} position={[0, 0.046, 0.854]}
                          ref={(el) => doorConnector.current[2] = el}/>
                    <mesh geometry={nodes.nodes116.geometry} material={materials.Interior} position={[0, 0.046, 0.759]}
                          ref={(el) => doorConnector.current[3] = el}/>
                </group>

                {Array.from({ length: secciones }, (_, i) => {
                    const sectionWidth = sizeX / secciones;
                    const xOffset = ((i - (secciones - 1) / 2) * sectionWidth)-1.225;

                    console.log("xOffset", xOffset, "Width Seccion", sectionWidth, "Width Closet", closetWidth);

                    return (
                        <SeccionArmario
                            key={i}
                            nodes={nodes}
                            materials={materials}
                            variacion={i % 2 + 1}
                            centerPoint={[xOffset, 0, 0]}
                            sectionWidth={sectionWidth}
                        />
                    );
                })}


            </group>
        </group>
    )
}

function SeccionArmario({ nodes, materials, variacion, centerPoint, sectionWidth, paredIntermedia = true }) {
    // Calcula la posición relativa de los elementos dentro de la sección
    const getRelativePosition = (position) => {
        return [
            position[0] - centerPoint[0],
            position[1] - centerPoint[1],
            position[2] - centerPoint[2]
        ];
    };

    // Función para crear un mesh con posición relativa
    const RelativeMesh = ({ geometry, material, position, ...meshProps }) => {
        const relativePos = getRelativePosition(position);
        return (
            <mesh
                geometry={geometry}
                material={material}
                position={relativePos}
                {...meshProps}
            />
        );
    };

    return (
        <group dispose={null}>
            {paredIntermedia &&
                <RelativeMesh
                    geometry={nodes.nodes4.geometry}
                    material={materials.Interior}
                    position={[0, 2.902, -0.003]}
                />
            }

            {variacion === 1 &&
                <group>
                    <RelativeMesh geometry={nodes.nodes86.geometry} material={materials.Interior}
                                  position={[-1.224, 4.791, 0.006]}/>
                    <RelativeMesh geometry={nodes.nodes96.geometry} material={materials.Interior}
                                  position={[-1.224, 3.108, 0.005]}/>
                    <RelativeMesh geometry={nodes.nodes97.geometry} material={materials.Interior}
                                  position={[-1.843, 3.669, -0.003]}/>
                    <RelativeMesh geometry={nodes.nodes98.geometry} material={materials.Interior}
                                  position={[-1.843, 2.547, -0.003]}/>
                    <RelativeMesh geometry={nodes.nodes83.geometry} material={materials.Interior}
                                  position={[-0.122, 0.724, 0.66]}/>
                    <RelativeMesh geometry={nodes.nodes82.geometry} material={materials.Interior}
                                  position={[-2.327, 0.724, 0.66]}/>
                    <RelativeMesh geometry={nodes.nodes80.geometry} material={materials.Interior}
                                  position={[-2.206, 0.724, 0.006]}/>
                    <RelativeMesh geometry={nodes.nodes79.geometry} material={materials.Interior}
                                  position={[-1.224, 0.086, 0.006]}/>
                    <RelativeMesh geometry={nodes.nodes81.geometry} material={materials.Interior}
                                  position={[-0.243, 0.724, 0.006]}/>
                    <RelativeMesh geometry={nodes.nodes84.geometry} material={materials.Interior}
                                  position={[-2.327, 0.724, -0.648]}/>
                    <RelativeMesh geometry={nodes.nodes85.geometry} material={materials.Interior}
                                  position={[-0.122, 0.724, -0.648]}/>
                    <RelativeMesh geometry={nodes.nodes76.geometry} material={materials.Interior}
                                  position={[-1.224, 1.028, 0.063]}/>
                    <RelativeMesh geometry={nodes.nodes75.geometry} material={materials.Interior}
                                  position={[-1.225, 1.137, 0.708]}/>
                    <RelativeMesh geometry={nodes.nodes74.geometry} material={materials.Interior}
                                  position={[-1.224, 1.129, -0.552]}/>
                    <RelativeMesh geometry={nodes.nodes73.geometry} material={materials.Interior}
                                  position={[-0.32, 1.127, 0.064]}/>
                    <RelativeMesh geometry={nodes.nodes72.geometry} material={materials.Interior}
                                  position={[-2.128, 1.129, 0.066]}/>
                    <RelativeMesh geometry={nodes.nodes71.geometry} material={materials.Interior}
                                  position={[-2.16, 1.021, 0.117]}/>
                    <RelativeMesh geometry={nodes.nodes70.geometry} material={materials.Interior}
                                  position={[-0.289, 1.021, 0.117]}/>
                    <RelativeMesh geometry={nodes.nodes61.geometry} material={materials.Interior}
                                  position={[-0.289, 0.581, 0.117]}/>
                    <RelativeMesh geometry={nodes.nodes62.geometry} material={materials.Interior}
                                  position={[-2.16, 0.581, 0.117]}/>
                    <RelativeMesh geometry={nodes.nodes63.geometry} material={materials.Interior}
                                  position={[-2.128, 0.689, 0.066]}/>
                    <RelativeMesh geometry={nodes.nodes64.geometry} material={materials.Interior}
                                  position={[-0.32, 0.687, 0.064]}/>
                    <RelativeMesh geometry={nodes.nodes65.geometry} material={materials.Interior}
                                  position={[-1.224, 0.689, -0.552]}/>
                    <RelativeMesh geometry={nodes.nodes66.geometry} material={materials.Interior}
                                  position={[-1.225, 0.697, 0.708]}/>
                    <RelativeMesh geometry={nodes.nodes67.geometry} material={materials.Interior}
                                  position={[-1.224, 0.588, 0.063]}/>
                    <RelativeMesh geometry={nodes.nodes52.geometry} material={materials.Interior}
                                  position={[-0.289, 0.141, 0.117]}/>
                    <RelativeMesh geometry={nodes.nodes53.geometry} material={materials.Interior}
                                  position={[-2.16, 0.141, 0.117]}/>
                    <RelativeMesh geometry={nodes.nodes54.geometry} material={materials.Interior}
                                  position={[-2.129, 0.249, 0.066]}/>
                    <RelativeMesh geometry={nodes.nodes55.geometry} material={materials.Interior}
                                  position={[-0.32, 0.247, 0.064]}/>
                    <RelativeMesh geometry={nodes.nodes56.geometry} material={materials.Interior}
                                  position={[-1.224, 0.249, -0.552]}/>
                    <RelativeMesh geometry={nodes.nodes57.geometry} material={materials.Interior}
                                  position={[-1.225, 0.257, 0.708]}/>
                    <RelativeMesh geometry={nodes.nodes58.geometry} material={materials.Interior}
                                  position={[-1.224, 0.148, 0.062]}/>
                    <RelativeMesh geometry={nodes.nodes42.geometry} material={materials.Interior}
                                  position={[-1.224, 1.424, 0.006]}/>
                </group>
            }


            {variacion === 2 && (
                <group>
                    <RelativeMesh geometry={nodes.nodes91.geometry} material={materials.Interior}
                                  position={[-1.224, 4.791, 0.006]}/>  {/* Antes era positivo, ahora es negativo */}
                    <RelativeMesh geometry={nodes.nodes47.geometry} material={materials.Interior}
                                  position={[-1.224, 1.424, 0.006]}/>  {/* Alineado con variación 1 */}
                    <RelativeMesh geometry={nodes.nodes127.geometry} material={materials.Interior}
                                  position={[-1.224, 4.638, 0.009]}/>  {/* Alineado con variación 1 */}
                </group>
            )}

            <group>
                <RelativeMesh geometry={nodes.nodes109.geometry} material={materials.Interior}
                              position={[-2.373, 2.902, 0.84]}/>
                <RelativeMesh geometry={nodes.nodes110.geometry} material={materials.Interior}
                              position={[-0.002, 2.902, 0.84]}/>
                <RelativeMesh geometry={nodes.nodes107.geometry} material={materials.Puertas}
                              position={[-1.188, 2.902, 0.854]}/>
            </group>
        </group>
    );
}

useGLTF.preload('./models/ArmarioStep.glb')
