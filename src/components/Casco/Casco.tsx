import * as React from "react";
import {useRef, useEffect, useState} from "react";
import * as THREE from 'three';
import Caja from "./Caja";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";
import {useMaterial} from "../../assets/materials";

// Props para el componente Casco
type CascoProps = {
    width?: number;
    height?: number;
    depth?: number;
    espesor?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    sueloDentro?: boolean;
    techoDentro?: boolean;
    traseroDentro?: boolean;
    retranqueoTrasero?: number;
    retranquearSuelo?: boolean;
    esquinaXTriangulada?: boolean;
    esquinaZTriangulada?: boolean;
    patas?: React.ReactNode; // Array
    alturaPatas?: number;
    indicePata?: number;
    puertas?: React.ReactNode;
    indicePuerta?: number;
    seccionesHorizontales?: any;
    seccionesVerticales?: any;
}

// Componente principal Casco
const Casco: React.FC<CascoProps> = ({
                                         width = 2,
                                         height = 2,
                                         depth = 2,
                                         espesor = 0.1,
                                         position = [0, 0, 0],
                                         rotation = [0, 0, 0],
                                         retranqueoTrasero = 0,
                                         retranquearSuelo = false,
                                         sueloDentro = false,
                                         techoDentro = false,
                                         traseroDentro = false,
                                         esquinaXTriangulada = false,
                                         esquinaZTriangulada = false,
                                         patas = [],
                                         alturaPatas = 0.5,
                                         indicePata = -1,
                                         puertas = [],
                                         indicePuerta = -1,
                                         seccionesHorizontales = null,
                                         seccionesVerticales = null,
                                     }) => {
    const groupRef = useRef<THREE.Group>(null);
    const {ref, setRef} = useSelectedItemProvider();

    // Guardamos una referencia al elemento threejs
    useEffect(() => {
        if (groupRef.current && ref) {
            // Solo actualizamos la referencia al grupo, manteniendo todas las demás propiedades
            setRef({
                ...ref,
                groupRef: groupRef.current
            });
        }
    }, [groupRef.current]);

    // Obtenemos las propiedades desde el contexto si están disponibles
    var indiceActualPata = ref?.indicePata || indicePata;
    if (indiceActualPata > 0) {
        indiceActualPata--;
    }

    var indiceActualPuerta = ref?.indicePuerta || indicePuerta;
    if (indiceActualPuerta > 0) {
        indiceActualPuerta--;
    }


    const actualWidth = ref?.width || width;
    const actualAlturaPatas = ref?.alturaPatas || alturaPatas;
    const actualHeight = ref?.height || height;
    const actualDepth = ref?.depth || depth;
    const actualEspesor = ref?.espesor || espesor;
    const actualRetranqueoTrasero = ref?.retranqueoTrasero ?? retranqueoTrasero;
    const actualRetranquearSuelo = ref?.retranquearSuelo ?? retranquearSuelo;
    const actualSueloDentro = ref?.sueloDentro ?? sueloDentro;
    const actualTechoDentro = ref?.techoDentro ?? techoDentro;
    const actualTraseroDentro = ref?.traseroDentro ?? traseroDentro;
    const actualEsquinaXTriangulada = ref?.esquinaXTriangulada ?? esquinaXTriangulada;
    const actualEsquinaZTriangulada = ref?.esquinaZTriangulada ?? esquinaZTriangulada;

    const leftWallRef = useRef<THREE.Mesh>(null);
    const rightWallRef = useRef<THREE.Mesh>(null);
    const backWallRef = useRef<THREE.Mesh>(null);
    const topWallRef = useRef<THREE.Mesh>(null);
    const bottomWallRef = useRef<THREE.Mesh>(null);
    const horizontalSectionsRefs = useRef<{[key: string]: THREE.Mesh}>({});
    const verticalSectionsRefs = useRef<{[key: string]: THREE.Mesh}>({});

    const checkSectionCollision = (position: THREE.Vector3, type: 'horizontal' | 'vertical') => {
        const threshold = 0.1; // Margen de detección
        const raycaster = new THREE.Raycaster();

        // Configurar rayo según el tipo de sección
        if (type === 'horizontal') {
            raycaster.set(position, new THREE.Vector3(0, 1, 0));
            raycaster.far = actualHeight;
        } else {
            raycaster.set(position, new THREE.Vector3(1, 0, 0));
            raycaster.far = actualWidth;
        }

        // Lista de objetos a verificar
        const objectsToCheck = [
            leftWallRef.current,
            rightWallRef.current,
            backWallRef.current,
            topWallRef.current,
            bottomWallRef.current,
            ...Object.values(horizontalSectionsRefs.current),
            ...Object.values(verticalSectionsRefs.current)
        ].filter(Boolean) as THREE.Object3D[];

        const intersects = raycaster.intersectObjects(objectsToCheck, true);
        return intersects.length > 0;
    };

    const renderHorizontalSections = () => {
        return seccionesHorizontales.map((cube) => {
            const [rx, ry, rz] = cube.relativePosition;
            return (
                <Caja
                    key={cube.id}
                    ref={(ref) => {
                        if (ref) horizontalSectionsRefs.current[cube.id] = ref;
                    }}
                    position={[
                        rx * actualWidth,
                        ry * actualHeight,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0)
                    ]}
                    width={cube.relativeWidth * actualWidth - actualEspesor / 2}
                    height={actualEspesor}
                    depth={cube.relativeDepth * actualDepth}
                    color={materiales.OakWood}
                    bordesTriangulados={false}
                    espesorBase={actualEspesor}
                />
            );
        });
    };

    const renderVerticalSections = () => {
        return seccionesVerticales.map((cube) => {
            const [rx, ry, rz] = cube.relativePosition;
            return (
                <Caja
                    key={cube.id}
                    ref={(ref) => {
                        if (ref) verticalSectionsRefs.current[cube.id] = ref;
                    }}
                    position={[
                        rx * actualWidth,
                        ry * actualHeight,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0)
                    ]}
                    width={actualEspesor}
                    height={cube.relativeHeight * actualHeight - actualEspesor}
                    depth={cube.relativeDepth * actualDepth}
                    color={materiales.OakWood}
                    bordesTriangulados={false}
                    espesorBase={actualEspesor}
                />
            );
        });
    };

    // Calcular dimensiones ajustadas para evitar solapamientos
    const calcularDimensiones = () => {
        const offsetDepthTraseroDentro = actualTraseroDentro ? actualDepth : actualDepth - (actualEspesor);

        return {
            suelo: {
                width: actualSueloDentro ? actualWidth - (actualEspesor * 2) : actualWidth,
                height: actualEspesor,
                depth: (actualSueloDentro ? offsetDepthTraseroDentro : actualDepth) - (actualRetranquearSuelo ? ((actualRetranqueoTrasero - actualEspesor) + (actualEspesor % 2)) : 0),
            },
            techo: {
                width: actualTechoDentro ? actualWidth - (actualEspesor * 2) : actualWidth,
                height: actualEspesor,
                depth: actualTechoDentro ? offsetDepthTraseroDentro : actualDepth
            },
            lateral: {
                width: actualEspesor,
                height: actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor) - (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor : 0),
                depth: offsetDepthTraseroDentro
            },
            trasero: {
                width: actualTraseroDentro ? actualWidth - (actualEspesor * 2) : actualWidth,
                height: actualHeight - (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor) - (actualTechoDentro ? (actualTechoDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor),
                depth: actualEspesor
            }
        };
    };

    // Calcular posiciones para que el casco crezca hacia arriba
    const calcularPosiciones = () => {
        const mitadAncho = actualWidth / 2;
        const mitadProfundidad = actualDepth / 2;

        const extraAltura = patas && indiceActualPata != -1 ? actualAlturaPatas : 0;

        const alturaLaterales = (actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor)) / 2 + (actualSueloDentro ? 0 : actualEspesor) - (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor / 2 : 0)

        return {
            suelo: [
                0,
                (actualEspesor / 2) + extraAltura,
                (actualSueloDentro && !actualTraseroDentro ? actualEspesor / 2 : 0) + (actualRetranquearSuelo ? actualRetranqueoTrasero / 2 : 0),
            ] as [number, number, number],

            techo: [
                0,
                (actualHeight - actualEspesor / 2) + extraAltura,
                (actualTechoDentro && actualEsquinaZTriangulada ? 0 : (actualTechoDentro && !actualTraseroDentro) ? actualEspesor / 2 : 0) - (actualEsquinaZTriangulada && actualTraseroDentro ? actualEspesor / 2 : 0)
            ] as [number, number, number],

            izquierda: [
                -mitadAncho + actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0
            ] as [number, number, number],

            derecha: [
                mitadAncho - actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0
            ] as [number, number, number],

            trasero: [
                0,
                (actualHeight - (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor) - (actualTechoDentro ? (actualTechoDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor)) / 2 + (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor) + extraAltura,
                (-mitadProfundidad + actualEspesor / 2) + (actualTraseroDentro ? actualRetranqueoTrasero : 0)
            ] as [number, number, number],

            puerta: [
                actualWidth / 2,
                (actualHeight - actualEspesor - actualEspesor) / 2 + actualEspesor + extraAltura,
                (actualDepth / 2) + actualEspesor / 2
            ] as [number, number, number]
        };
    };

    const dimensiones = calcularDimensiones();
    const posiciones = calcularPosiciones();

    // Ajustamos la posición base del grupo para que el fondo esté en la posición Y especificada
    const adjustedPosition: [number, number, number] = [
        position[0],
        position[1],
        position[2]
    ];

    const materiales = useMaterial();

    return (
        <group ref={groupRef} position={adjustedPosition} rotation={rotation}>
            {/* Caja inferior (suelo) */}
            <Caja
                ref={bottomWallRef}
                espesorBase={actualEspesor}
                position={posiciones.suelo}
                width={dimensiones.suelo.width}
                height={dimensiones.suelo.height}
                depth={dimensiones.suelo.depth}
                color={materiales.OakWood}
                posicionCaja={"bottom"}
                bordesTriangulados={actualEsquinaXTriangulada}
                bordeEjeY={false}
            />

            {/* Caja lado izquierdo */}
            <Caja
                ref={leftWallRef}
                espesorBase={actualEspesor}
                position={posiciones.izquierda}
                width={dimensiones.lateral.width}
                height={dimensiones.lateral.height}
                depth={dimensiones.lateral.depth}
                color={materiales.DarkWood}
                posicionCaja={"left"}
                bordesTriangulados={actualEsquinaXTriangulada}
            />

            {/* Caja lado derecho */}
            <Caja
                ref={rightWallRef}
                espesorBase={actualEspesor}
                position={posiciones.derecha}
                width={dimensiones.lateral.width}
                height={dimensiones.lateral.height}
                depth={dimensiones.lateral.depth}
                color={materiales.DarkWood}
                posicionCaja={"right"}
                bordesTriangulados={actualEsquinaXTriangulada}
            />

            {/* Caja detrás */}
            <Caja
                ref={backWallRef}
                espesorBase={actualEspesor}
                position={posiciones.trasero}
                width={dimensiones.trasero.width}
                height={dimensiones.trasero.height}
                depth={dimensiones.trasero.depth}
                color={materiales.DarkWood}
                bordesTriangulados={false}
            />

            {/* Caja arriba (techo) */}
            <Caja
                ref={topWallRef}
                espesorBase={actualEspesor}
                position={posiciones.techo}
                width={dimensiones.techo.width}
                height={dimensiones.techo.height}
                depth={dimensiones.techo.depth}
                color={materiales.OakWood}
                posicionCaja={"top"}
                bordesTriangulados={actualEsquinaXTriangulada || actualEsquinaZTriangulada}
                bordeEjeY={false}
                bordeEjeZ={actualEsquinaZTriangulada}
                disableAdjustedWidth={actualEsquinaZTriangulada || (actualEsquinaZTriangulada && actualEsquinaXTriangulada)}
            />

            {/* Renderizar 4 patas en las esquinas */}
            {(patas && indiceActualPata !== -1) && patas[indiceActualPata] && (
                <group>
                    {React.cloneElement(patas[indiceActualPata], {
                        position: [-actualWidth / 2 + 0.1, position[1], -actualDepth / 2 + 0.1],
                        height: actualAlturaPatas
                    })}
                    {React.cloneElement(patas[indiceActualPata], {
                        position: [actualWidth / 2 - 0.1, position[1], -actualDepth / 2 + 0.1],
                        height: actualAlturaPatas
                    })}
                    {React.cloneElement(patas[indiceActualPata], {
                        position: [-actualWidth / 2 + 0.1, position[1], actualDepth / 2 - 0.1],
                        height: actualAlturaPatas
                    })}
                    {React.cloneElement(patas[indiceActualPata], {
                        position: [actualWidth / 2 - 0.1, position[1], actualDepth / 2 - 0.1],
                        height: actualAlturaPatas
                    })}
                </group>
            )}

            {/* Renderizar puerta en la parte frontal */}
            {puertas && indiceActualPuerta !== -1 && puertas[indiceActualPuerta] && (
                <>
                    {React.cloneElement(puertas[indiceActualPuerta], {
                        position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                        width: actualWidth > 2 ? actualWidth / 2 : actualWidth,
                        height: actualHeight,
                        depth: actualEspesor,
                        pivot: "right" // Define el pivote en el borde derecho
                    })}

                    {actualWidth > 2 && (
                        <>
                            {React.cloneElement(puertas[indiceActualPuerta], {
                                position: [-posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                                width: actualWidth / 2,
                                height: actualHeight,
                                depth: actualEspesor,
                                pivot: "left" // Define el pivote en el borde derecho
                            })}
                        </>
                    )}
                </>
            )}
            {renderHorizontalSections()}
            {renderVerticalSections()}
        </group>
    );
};

export default Casco;