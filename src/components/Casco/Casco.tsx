import * as React from "react";
import {useRef, useEffect, useMemo} from "react";
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
    seccionesHorizontales?: any[];
    seccionesVerticales?: any[];
}

// Tipo para representar una sección
type Seccion = {
    position: [number, number, number];
    width: number;
    height: number;
    depth: number;
    id: string;
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
                                         seccionesHorizontales = [],
                                         seccionesVerticales = [],
                                     }) => {
    const groupRef = useRef<THREE.Group>(null);
    const {ref, setRef} = useSelectedItemProvider();

    // Guardamos una referencia al elemento threejs
    useEffect(() => {
        if (groupRef.current && ref) {
            // Solo actualizamos la referencia al grupo, manteniendo todas las demás propiedades
            setRef(prevRef => ({
                ...prevRef,
                groupRef: groupRef.current
            }));
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

    const transparentBoxRef = useRef<THREE.Mesh>(null);
    useEffect(() => {
        if (transparentBoxRef.current && ref) {
            setRef({
                ...ref,
                transparentBoxRef: transparentBoxRef.current
            });
        }
    }, [transparentBoxRef.current]);

    // Convertir posiciones a coordenadas locales
    const seccionesHorizontalesLocal = useMemo(() => {
        return seccionesHorizontales.map(cube => {
            let localPosition = new THREE.Vector3(...cube.position);
            if (groupRef.current) {
                localPosition = groupRef.current.worldToLocal(localPosition.clone());
            }
            return {
                ...cube,
                localPosition
            };
        });
    }, [seccionesHorizontales, groupRef.current]);

    const seccionesVerticalesLocal = useMemo(() => {
        return seccionesVerticales.map(cube => {
            let localPosition = new THREE.Vector3(...cube.position);
            if (groupRef.current) {
                localPosition = groupRef.current.worldToLocal(localPosition.clone());
            }
            return {
                ...cube,
                localPosition
            };
        });
    }, [seccionesVerticales, groupRef.current]);

    // Obtener posiciones X de todas las secciones verticales
    const posicionesVerticales = useMemo(() => {
        return seccionesVerticalesLocal.map(seccion => seccion.localPosition.x);
    }, [seccionesVerticalesLocal]);

    // Obtener posiciones Y de todas las secciones horizontales
    const posicionesHorizontales = useMemo(() => {
        return seccionesHorizontalesLocal.map(seccion => seccion.localPosition.y);
    }, [seccionesHorizontalesLocal]);

    // Calcular las áreas invisibles entre secciones
    const areasInvisibles = useMemo(() => {
        // Si no hay secciones, crear una única área que ocupe todo el espacio
        if (seccionesHorizontalesLocal.length === 0 && seccionesVerticalesLocal.length === 0) {
            return [{
                id: "area-completa",
                position: [0, actualHeight / 2, actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0)],
                width: actualWidth - (actualEspesor * 2),
                height: actualHeight - (actualEspesor * 2),
                depth: actualDepth - actualEspesor - (actualTraseroDentro ? actualRetranqueoTrasero : 0)
            }];
        }

        // Definir puntos de división en los ejes X e Y
        const limiteIzquierdo = -actualWidth / 2 + actualEspesor;
        const limiteDerecho = actualWidth / 2 - actualEspesor;
        const limiteInferior = actualEspesor;
        const limiteSuperior = actualHeight - actualEspesor;

        // Puntos en el eje X (incluyendo límites laterales)
        const puntosX = [limiteIzquierdo];
        seccionesVerticalesLocal.forEach(seccion => {
            const posX = seccion.localPosition.x;
            if (posX > limiteIzquierdo && posX < limiteDerecho) {
                puntosX.push(posX);
            }
        });
        puntosX.push(limiteDerecho);
        const puntosXOrdenados = [...new Set(puntosX)].sort((a, b) => a - b);

        // Puntos en el eje Y (incluyendo límites superior e inferior)
        const puntosY = [limiteInferior];
        seccionesHorizontalesLocal.forEach(seccion => {
            const posY = seccion.localPosition.y;
            if (posY > limiteInferior && posY < limiteSuperior) {
                puntosY.push(posY);
            }
        });
        puntosY.push(limiteSuperior);
        const puntosYOrdenados = [...new Set(puntosY)].sort((a, b) => a - b);

        // Generar áreas invisibles para cada celda
        const areas: Seccion[] = [];

        for (let i = 0; i < puntosXOrdenados.length - 1; i++) {
            for (let j = 0; j < puntosYOrdenados.length - 1; j++) {
                const x1 = puntosXOrdenados[i];
                const x2 = puntosXOrdenados[i + 1];
                const y1 = puntosYOrdenados[j];
                const y2 = puntosYOrdenados[j + 1];

                // Verificar si hay una sección vertical en estos límites
                const tieneSeccionVertical = seccionesVerticalesLocal.some(
                    seccion => Math.abs(seccion.localPosition.x - x1) < 0.001 ||
                        Math.abs(seccion.localPosition.x - x2) < 0.001
                );

                // Verificar si hay una sección horizontal en estos límites
                const tieneSeccionHorizontal = seccionesHorizontalesLocal.some(
                    seccion => Math.abs(seccion.localPosition.y - y1) < 0.001 ||
                        Math.abs(seccion.localPosition.y - y2) < 0.001
                );

                // Si hay tanto sección vertical como horizontal en los límites,
                // no crear área invisible para esta celda
                if (tieneSeccionVertical && tieneSeccionHorizontal) {
                    continue;
                }

                // Calcular dimensiones y centro de la celda
                const width = x2 - x1;
                const height = y2 - y1;
                const centerX = (x1 + x2) / 2;
                const centerY = (y1 + y2) / 2;

                // Crear área invisible para esta celda
                areas.push({
                    id: `area-${i}-${j}`,
                    position: [
                        centerX,
                        centerY,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0)
                    ],
                    width: width,
                    height: height,
                    depth: actualDepth - actualEspesor - (actualTraseroDentro ? actualRetranqueoTrasero : 0)
                });
            }
        }

        return areas;
    }, [seccionesHorizontalesLocal, seccionesVerticalesLocal, actualWidth, actualHeight, actualDepth, actualEspesor, actualTraseroDentro, actualRetranqueoTrasero]);

    // Calcular los segmentos horizontales ajustados
    const segmentosHorizontales = useMemo(() => {
        if (seccionesHorizontalesLocal.length === 0) return [];

        const segmentos = [];
        const limiteIzquierdo = -actualWidth / 2 + actualEspesor;
        const limiteDerecho = actualWidth / 2 - actualEspesor;

        // Para cada plancha horizontal
        seccionesHorizontalesLocal.forEach((seccionH, index) => {
            const posY = seccionH.localPosition.y;

            // Obtener todas las posiciones X de secciones verticales
            const posicionesX = seccionesVerticalesLocal.map(sv => sv.localPosition.x).sort((a, b) => a - b);

            // Si no hay secciones verticales, crear un único segmento completo
            if (posicionesX.length === 0) {
                segmentos.push({
                    id: `h-${index}-completo`,
                    position: [0, posY, actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0)],
                    width: actualWidth - (actualEspesor * 2),
                    height: actualEspesor,
                    depth: actualDepth - actualEspesor - (actualTraseroDentro ? actualRetranqueoTrasero : 0)
                });
                return;
            }

            // Agregar límites laterales a los puntos X
            const puntosX = [limiteIzquierdo, ...posicionesX, limiteDerecho];

            // Crear segmentos entre cada par de puntos X
            for (let i = 0; i < puntosX.length - 1; i++) {
                const x1 = puntosX[i];
                const x2 = puntosX[i + 1];

                // Calcular centro y ancho del segmento
                const centerX = (x1 + x2) / 2;
                const width = x2 - x1;

                // Crear segmento
                segmentos.push({
                    id: `h-${index}-${i}`,
                    position: [centerX, posY, actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0)],
                    width: width,
                    height: actualEspesor,
                    depth: actualDepth - actualEspesor - (actualTraseroDentro ? actualRetranqueoTrasero : 0)
                });
            }
        });

        return segmentos;
    }, [seccionesHorizontalesLocal, seccionesVerticalesLocal, actualWidth, actualHeight, actualDepth, actualEspesor, actualTraseroDentro, actualRetranqueoTrasero]);

    // Calcular los segmentos verticales ajustados
    const segmentosVerticales = useMemo(() => {
        if (seccionesVerticalesLocal.length === 0) return [];

        const segmentos = [];
        const limiteInferior = actualEspesor;
        const limiteSuperior = actualHeight - actualEspesor;

        // Para cada plancha vertical
        seccionesVerticalesLocal.forEach((seccionV, index) => {
            const posX = seccionV.localPosition.x;

            // Obtener todas las posiciones Y de secciones horizontales
            const posicionesY = seccionesHorizontalesLocal.map(sh => sh.localPosition.y).sort((a, b) => a - b);

            // Si no hay secciones horizontales, crear un único segmento completo
            if (posicionesY.length === 0) {
                segmentos.push({
                    id: `v-${index}-completo`,
                    position: [posX, actualHeight/2, actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0)],
                    width: actualEspesor,
                    height: actualHeight - (actualEspesor * 2),
                    depth: actualDepth - actualEspesor - (actualTraseroDentro ? actualRetranqueoTrasero : 0)
                });
                return;
            }

            // Agregar límites superior e inferior a los puntos Y
            const puntosY = [limiteInferior, ...posicionesY, limiteSuperior];

            // Crear segmentos entre cada par de puntos Y
            for (let i = 0; i < puntosY.length - 1; i++) {
                const y1 = puntosY[i];
                const y2 = puntosY[i + 1];

                // Calcular centro y altura del segmento
                const centerY = (y1 + y2) / 2;
                const height = y2 - y1;

                // Crear segmento
                segmentos.push({
                    id: `v-${index}-${i}`,
                    position: [posX, centerY, actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0)],
                    width: actualEspesor,
                    height: height,
                    depth: actualDepth - actualEspesor - (actualTraseroDentro ? actualRetranqueoTrasero : 0)
                });
            }
        });

        return segmentos;
    }, [seccionesHorizontalesLocal, seccionesVerticalesLocal, actualWidth, actualHeight, actualDepth, actualEspesor, actualTraseroDentro, actualRetranqueoTrasero]);

    return (
        <group ref={groupRef} position={adjustedPosition} rotation={rotation}>
            {/* Caja inferior (suelo) */}
            <Caja
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

            {/* Cajas invisibles para cada área */}
            <group ref={transparentBoxRef}>
                {areasInvisibles.map((area, index) => (
                    <Caja
                        key={area.id || index}
                        position={area.position as [number, number, number]}
                        width={area.width}
                        height={area.height}
                        depth={area.depth}
                        color={materiales.Transparent}
                        bordesTriangulados={false}
                        espesorBase={0}
                    />
                ))}
            </group>

            {/* Renderizar segmentos horizontales */}
            {segmentosHorizontales.map((segmento, index) => (
                <Caja
                    key={segmento.id || `h-seg-${index}`}
                    position={segmento.position as [number, number, number]}
                    width={segmento.width}
                    height={segmento.height}
                    depth={segmento.depth}
                    color={materiales.OakWood}
                    bordesTriangulados={false}
                    espesorBase={actualEspesor}
                />
            ))}

            {/* Renderizar segmentos verticales */}
            {segmentosVerticales.map((segmento, index) => (
                <Caja
                    key={segmento.id || `v-seg-${index}`}
                    position={segmento.position as [number, number, number]}
                    width={segmento.width}
                    height={segmento.height}
                    depth={segmento.depth}
                    color={materiales.OakWood}
                    bordesTriangulados={false}
                    espesorBase={actualEspesor}
                />
            ))}
        </group>
    );
};

export default Casco;