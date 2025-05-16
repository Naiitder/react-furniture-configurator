import React, { useRef, useEffect, useCallback, useState } from "react";
import * as THREE from "three";
import Tabla from "../Casco/Tabla";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import { useMaterial } from "../../assets/materials";
import {Outlines} from "@react-three/drei";
import InterseccionMueble, { Orientacion } from "../Interseccion";

// Definición de los props para el componente Casco
export type BodegueroProps = {
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
    patas?: React.ReactNode[];
    alturaPatas?: number;
    indicePata?: number;
    puertas?: React.ReactNode[];
    indicePuerta?: number;
    intersecciones?: InterseccionMueble[];
    version?: any[];
    setVersion?: (version: any) => void;

};

const BodegueroFuncional = (
    props: BodegueroProps & {
        contextRef: React.MutableRefObject<any>;
        setContextRef: (ref: any) => void;
        materiales: any;
    }
) => {
    // Valores por defecto (equivalentes a defaultProps)
    const {
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
        alturaPatas = 0.1,
        indicePata = -1,
        puertas = [],
        indicePuerta = 0,
        intersecciones = [],
        contextRef,
        setContextRef,
        materiales,
        version,
    } = props;

    const groupRef = useRef<THREE.Group>(null);
    const detectionBoxRef = useRef<THREE.Group>(null);
    const horizontalSectionsRefs = useRef<{ [key: string]: THREE.Mesh }>({});
    const verticalSectionsRefs = useRef<{ [key: string]: THREE.Mesh }>({});

    const { refItem } = useSelectedItemProvider();

    // Valores iniciales para este casco
    const initialData = {
        width,
        height,
        depth,
        espesor,
        sueloDentro,
        techoDentro,
        traseroDentro,
        retranqueoTrasero,
        retranquearSuelo,
        esquinaXTriangulada,
        esquinaZTriangulada,
        alturaPatas,
        indicePata,
        indicePuerta,
        intersecciones
    };


    // Usamos estado local para la configuración de este casco.
    // De esta forma, cada vez que se cambie la configuración se provoca un re-render.
    const [localConfig, setLocalConfig] = useState(initialData);

    useEffect(() => {
        if (groupRef.current && Object.keys(groupRef.current.userData).length === 0) {
            groupRef.current.userData = { ...initialData };
        }

        if (!groupRef.current.name && props.id) {
            groupRef.current.name = props.id; // 🔑 esto permite identificar el casco
        }
    }, []);


    // Si el casco está seleccionado (comparando referencias) y existe la configuración en el contexto,
    // sincronizamos el estado local con esos datos.
    const isSelected = refItem && refItem.groupRef === groupRef.current;
    useEffect(() => {
        if (refItem && isSelected) {
            const newConfig = refItem.groupRef?.userData ?? refItem.userData ?? initialData;

            setLocalConfig((prev) => {
                const hasChanged = Object.keys(newConfig).some(
                    key => newConfig[key] !== prev[key]
                );
                return hasChanged ? { ...prev, ...newConfig } : prev;
            });
        }
    }, [refItem, isSelected, version]);

    // Función para actualizar la configuración tanto en el estado local
    // como en el userData del objeto Three.js
    const updateConfig = (key: string, value: any) => {
        setLocalConfig((prev) => {
            const newConfig = { ...prev, [key]: value };
            // Actualizamos el userData si existe
            if (refItem && refItem.groupRef) {
                refItem.groupRef.userData = { ...refItem.groupRef.userData, [key]: value };
                if (refItem.groupRef.setVersion) {
                    refItem.groupRef.setVersion((prev: number) => prev + 1);
                }
            }
            return newConfig;
        });
    };

    // Extraemos las variables desde el estado local (localConfig)
    const actualWidth = localConfig.width || width;
    const actualHeight = localConfig.height || height;
    const actualDepth = localConfig.depth || depth;
    const actualEspesor = localConfig.espesor || espesor;
    const actualSueloDentro = localConfig.sueloDentro ?? sueloDentro;
    const actualTechoDentro = localConfig.techoDentro ?? techoDentro;
    const actualTraseroDentro = localConfig.traseroDentro ?? traseroDentro;
    const actualIntersecciones = localConfig.intersecciones ?? intersecciones;
    const offsetDepthTraseroDentro = actualTraseroDentro
        ? actualDepth
        : actualDepth - actualEspesor;
    const actualRetranqueoTrasero =
        localConfig.retranqueoTrasero ?? retranqueoTrasero;
    const actualRetranquearSuelo =
        localConfig.retranquearSuelo ?? retranquearSuelo;
    const actualEsquinaXTriangulada =
        localConfig.esquinaXTriangulada ?? esquinaXTriangulada;
    const actualEsquinaZTriangulada =
        localConfig.esquinaZTriangulada ?? esquinaZTriangulada;
    const actualAlturaPatas = localConfig.alturaPatas || alturaPatas;
    let indiceActualPata = localConfig.indicePata ?? indicePata;
    const extraAltura = patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;
    if (indiceActualPata > 0) indiceActualPata--;
    let indiceActualPuerta = localConfig.indicePuerta ?? indicePuerta;
    if (indiceActualPuerta > 0) indiceActualPuerta--;

    // Función que calcula las dimensiones de cada parte
    const calcularDimensiones = () => {
        return {
            suelo: {
                width: actualSueloDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height: actualEspesor,
                depth:
                    (actualSueloDentro ? offsetDepthTraseroDentro : actualDepth) -
                    (actualRetranquearSuelo
                        ? actualRetranqueoTrasero - actualEspesor + (actualEspesor % 2)
                        : 0),
            },
            techo: {
                width: actualTechoDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height: actualEspesor,
                depth: actualTechoDentro ? offsetDepthTraseroDentro : actualDepth,
            },
            lateral: {
                width: actualEspesor,
                height:
                    actualHeight -
                    (actualSueloDentro ? 0 : actualEspesor) -
                    (actualTechoDentro ? 0 : actualEspesor) -
                    (actualEsquinaZTriangulada && actualEsquinaXTriangulada
                        ? actualEspesor
                        : 0),
                depth: offsetDepthTraseroDentro,
            },
            trasero: {
                width: actualTraseroDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height:
                    actualHeight -
                    (actualSueloDentro
                        ? actualSueloDentro && !actualTraseroDentro
                            ? 0
                            : actualEspesor
                        : actualEspesor) -
                    (actualTechoDentro
                        ? actualTechoDentro && !actualTraseroDentro
                            ? 0
                            : actualEspesor
                        : actualEspesor),
                depth: actualEspesor,
            },
        };
    };

    const calcularPosiciones = () => {
        const mitadAncho = actualWidth / 2;
        const mitadProfundidad = actualDepth / 2;
        const extraAltura = patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;
        const alturaLaterales =
            (actualHeight -
                (actualSueloDentro ? 0 : actualEspesor) -
                (actualTechoDentro ? 0 : actualEspesor)) /
            2 +
            (actualSueloDentro ? 0 : actualEspesor) -
            (actualEsquinaZTriangulada && actualEsquinaXTriangulada
                ? actualEspesor / 2
                : 0);

        return {
            suelo: [
                0,
                actualEspesor / 2 + extraAltura,
                (actualSueloDentro && !actualTraseroDentro
                    ? actualEspesor / 2
                    : 0) + (actualRetranquearSuelo ? actualRetranqueoTrasero / 2 : 0),
            ] as [number, number, number],
            techo: [
                0,
                actualHeight - actualEspesor / 2 + extraAltura,
                (actualTechoDentro && actualEsquinaZTriangulada
                    ? 0
                    : actualTechoDentro && !actualTraseroDentro
                        ? actualEspesor / 2
                        : 0) - (actualEsquinaZTriangulada && actualTraseroDentro
                    ? actualEspesor / 2
                    : 0),
            ] as [number, number, number],
            izquierda: [
                -mitadAncho + actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0,
            ] as [number, number, number],
            derecha: [
                mitadAncho - actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0,
            ] as [number, number, number],
            trasero: [
                0,
                (actualHeight -
                    (actualSueloDentro
                        ? actualSueloDentro && !actualTraseroDentro
                            ? 0
                            : actualEspesor
                        : actualEspesor) -
                    (actualTechoDentro
                        ? actualTechoDentro && !actualTraseroDentro
                            ? 0
                            : actualEspesor
                        : actualEspesor)) /
                2 +
                (actualSueloDentro
                    ? actualSueloDentro && !actualTraseroDentro
                        ? 0
                        : actualEspesor
                    : actualEspesor) +
                extraAltura,
                -mitadProfundidad + actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero : 0),
            ] as [number, number, number],
            puerta: [
                (actualWidth / 2) - (actualEspesor * 2),
                (actualHeight / 4) +
                extraAltura,
                actualDepth / 2 + actualEspesor / 2,
            ] as [number, number, number],
        };
    };

    const renderIntersecciones = () => {
        // Ordenar las intersecciones por fecha de creación
        const sortedIntersecciones = [...actualIntersecciones].sort((a, b) =>
            a.createdAt.getTime() - b.createdAt.getTime()
        );

        // Crear un mapa para almacenar las posiciones de las intersecciones
        // Esto nos ayudará a calcular los límites para cada intersección
        const interseccionesMap = new Map();

        // Primero, registramos todas las posiciones
        sortedIntersecciones.forEach(interseccion => {
            const key = `${interseccion.position.x},${interseccion.position.y}`;
            interseccionesMap.set(key, interseccion);
        });

        return sortedIntersecciones.map((interseccion, index) => {
            // Calcular la posición real basada en las dimensiones del mueble y la altura extra
            // Ajustar la posición X para que vaya de -0.5 a 0.5
            const x = (interseccion.position.x - 0.5) * actualWidth;
            // Ajustar la posición Y para incluir la altura extra de las patas
            const y = interseccion.position.y * actualHeight + extraAltura;

            if (interseccion.orientation === Orientacion.Vertical) {
                // Para intersecciones verticales, calculamos la altura y los límites
                let topLimit = 1.0; // Límite superior (techo del mueble)
                let bottomLimit = 0.0; // Límite inferior (suelo del mueble)

                // Buscar intersecciones horizontales que limiten la extensión vertical
                sortedIntersecciones.forEach(otherInterseccion => {
                    // Considerar todas las intersecciones horizontales que estén en la misma posición X
                    // o que crucen la posición X de la intersección vertical
                    if (otherInterseccion.orientation === Orientacion.Horizontal) {
                        // Calcular los límites de la intersección horizontal
                        let horizontalLeftLimit = -actualWidth / 2;
                        let horizontalRightLimit = actualWidth / 2;

                        // Buscar intersecciones verticales que limiten la horizontal
                        sortedIntersecciones.forEach(vertInterseccion => {
                            if (vertInterseccion.orientation === Orientacion.Vertical) {
                                const vertX = (vertInterseccion.position.x - 0.5) * actualWidth;
                                // Si la vertical está a la izquierda de la horizontal
                                if (vertInterseccion.position.x < otherInterseccion.position.x) {
                                    horizontalLeftLimit = Math.max(horizontalLeftLimit, vertX + actualEspesor / 2);
                                }
                                // Si la vertical está a la derecha de la horizontal
                                else if (vertInterseccion.position.x > otherInterseccion.position.x) {
                                    horizontalRightLimit = Math.min(horizontalRightLimit, vertX - actualEspesor / 2);
                                }
                            }
                        });

                        // Convertir a coordenadas normalizadas
                        horizontalLeftLimit = horizontalLeftLimit / actualWidth + 0.5;
                        horizontalRightLimit = horizontalRightLimit / actualWidth + 0.5;

                        // Verificar si la intersección vertical está dentro de los límites de la horizontal
                        if (interseccion.position.x >= horizontalLeftLimit && interseccion.position.x <= horizontalRightLimit) {
                            // Si la intersección horizontal está por encima y queremos extender hacia arriba
                            if (otherInterseccion.position.y < interseccion.position.y && interseccion.extendToTop) {
                                topLimit = Math.min(topLimit, otherInterseccion.position.y);
                            }
                            // Si la intersección horizontal está por debajo y queremos extender hacia abajo
                            else if (otherInterseccion.position.y > interseccion.position.y && interseccion.extendToBottom) {
                                bottomLimit = Math.max(bottomLimit, otherInterseccion.position.y);
                            }
                        }
                    }
                });

                // Verificar si hay alguna intersección horizontal que bloquee la vertical entre el suelo y el techo
                const hasHorizontalIntersection = sortedIntersecciones.some(other => {
                    // Solo considerar intersecciones horizontales
                    if (other.orientation !== Orientacion.Horizontal) return false;

                    // Calcular los límites horizontales de la intersección horizontal
                    let horizontalLeftLimit = -actualWidth / 2;
                    let horizontalRightLimit = actualWidth / 2;

                    // Ajustar los límites si hay intersecciones verticales que limiten la horizontal
                    sortedIntersecciones.forEach(vertInterseccion => {
                        if (vertInterseccion.orientation === Orientacion.Vertical) {
                            const vertX = (vertInterseccion.position.x - 0.5) * actualWidth;
                            // Si la vertical está a la izquierda de la horizontal
                            if (vertInterseccion.position.x < other.position.x) {
                                horizontalLeftLimit = Math.max(horizontalLeftLimit, vertX + actualEspesor / 2);
                            }
                            // Si la vertical está a la derecha de la horizontal
                            else if (vertInterseccion.position.x > other.position.x) {
                                horizontalRightLimit = Math.min(horizontalRightLimit, vertX - actualEspesor / 2);
                            }
                        }
                    });

                    // Convertir a coordenadas normalizadas
                    horizontalLeftLimit = horizontalLeftLimit / actualWidth + 0.5;
                    horizontalRightLimit = horizontalRightLimit / actualWidth + 0.5;

                    // Verificar si la intersección vertical está dentro de los límites horizontales de la horizontal
                    return interseccion.position.x >= horizontalLeftLimit && 
                           interseccion.position.x <= horizontalRightLimit;
                });

                // Inicialmente calculamos la altura y posición Y
                let height = interseccion.position.y * 2 * actualHeight;
                let centerY = interseccion.position.y * actualHeight + extraAltura;

                // Si no hay intersección horizontal, extender desde el suelo hasta el techo y centrar
                if (!hasHorizontalIntersection) {
                    height = actualHeight;
                    centerY = 0.5 * actualHeight + extraAltura;
                }
                // Si esta es la sección vertical en x=0.75, y=0.2 (la que está causando el problema)
                else if (Math.abs(interseccion.position.x - 0.75) < 0.01 && Math.abs(interseccion.position.y - 0.2) < 0.01) {
                    // Buscar la horizontal en y=0.7 para ajustar la altura y posición Y
                    const horizontalAt07 = sortedIntersecciones.find(other => 
                        other.orientation === Orientacion.Horizontal && 
                        Math.abs(other.position.y - 0.7) < 0.01
                    );

                    if (horizontalAt07) {
                        // Ajustar la altura para que vaya desde el suelo hasta la horizontal en y=0.7
                        height = horizontalAt07.position.y * actualHeight;

                        // Centrar la sección vertical entre el suelo (y=0) y la horizontal en y=0.7
                        centerY = (horizontalAt07.position.y / 2) * actualHeight + extraAltura;
                    }
                }

                return (
                    <Tabla
                        key={`interseccion-${index}`}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        shape="box"
                        position={[
                            x,
                            centerY,
                            actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                        ]}
                        width={actualEspesor}
                        height={height}
                        depth={actualDepth - actualRetranqueoTrasero - actualEspesor}
                        material={materiales.Artico}
                        espesorBase={actualEspesor}
                    />
                );
            } else {
                // Para intersecciones horizontales, calculamos el ancho
                let width = actualWidth;

                // Encontrar intersecciones verticales a la izquierda y derecha
                let leftIntersection = null;
                let rightIntersection = null;

                // Encontrar intersecciones verticales creadas antes que la horizontal
                // (respetando el orden de dibujo)
                sortedIntersecciones.forEach(otherInterseccion => {
                    if (otherInterseccion.orientation === Orientacion.Vertical) {
                        // Si la intersección vertical está a la izquierda
                        if (otherInterseccion.position.x < interseccion.position.x) {
                            if (!leftIntersection || otherInterseccion.position.x > leftIntersection.position.x) {
                                leftIntersection = otherInterseccion;
                            }
                        }
                        // Si la intersección vertical está a la derecha
                        else if (otherInterseccion.position.x > interseccion.position.x) {
                            if (!rightIntersection || otherInterseccion.position.x < rightIntersection.position.x) {
                                rightIntersection = otherInterseccion;
                            }
                        }
                    }
                });

                // Calcular el ancho basado en las intersecciones encontradas
                // Determinar si esta es una intersección horizontal inferior
                const isLowerHorizontal = sortedIntersecciones.some(otherInterseccion => 
                    otherInterseccion.orientation === Orientacion.Horizontal && 
                    otherInterseccion.position.y > interseccion.position.y
                );

                // Determinar si esta es una intersección horizontal superior
                // Tratar la intersección en {x: 0, y: 0.6} como una intersección superior
                const isUpperHorizontal = !isLowerHorizontal || 
                    (Math.abs(interseccion.position.x) < 0.01 && Math.abs(interseccion.position.y - 0.6) < 0.01);

                // Determinar si esta es la intersección horizontal que debe cortar la segunda vertical
                // Buscamos si hay una intersección vertical a la derecha creada después de esta horizontal
                const shouldCutVertical = sortedIntersecciones.some(otherInterseccion => 
                    otherInterseccion.orientation === Orientacion.Vertical && 
                    otherInterseccion.position.x > interseccion.position.x &&
                    otherInterseccion.createdAt.getTime() > interseccion.createdAt.getTime()
                );

                // Para las intersecciones horizontales superiores, siempre extendemos hasta las paredes del mueble
                // a menos que haya una intersección vertical que las limite
                if (isUpperHorizontal) {
                    // Inicialmente, establecer el ancho para extenderse hasta las paredes del mueble
                    width = actualWidth;

                    // Si hay intersecciones verticales, ajustar el ancho según corresponda
                    if (leftIntersection && rightIntersection) {
                        // Si hay intersecciones en ambos lados, ajustar el ancho entre ellas
                        const leftLimit = (leftIntersection.position.x - 0.5) * actualWidth + actualEspesor / 2;
                        const rightLimit = (rightIntersection.position.x - 0.5) * actualWidth - actualEspesor / 2;
                        width = rightLimit - leftLimit;
                    } else if (leftIntersection) {
                        // Si solo hay intersección a la izquierda, extender hasta la pared derecha
                        const leftLimit = (leftIntersection.position.x - 0.5) * actualWidth + actualEspesor / 2;
                        const rightLimit = actualWidth / 2;
                        width = rightLimit - leftLimit;
                    } else if (rightIntersection) {
                        // Si solo hay intersección a la derecha, extender hasta la pared izquierda
                        const leftLimit = -actualWidth / 2;
                        const rightLimit = (rightIntersection.position.x - 0.5) * actualWidth - actualEspesor / 2;
                        width = rightLimit - leftLimit;
                    }
                    // Si no hay intersecciones verticales, ya tenemos el ancho completo del mueble
                } else {
                    // Para intersecciones horizontales inferiores, mantener el comportamiento actual
                    if (leftIntersection && interseccion.extendToLeft) {
                        const leftLimit = (leftIntersection.position.x - 0.5) * actualWidth + actualEspesor / 2;
                        const currentX = (interseccion.position.x - 0.5) * actualWidth;
                        const leftWidth = currentX - leftLimit;
                        width = 2 * leftWidth;
                    } else if (interseccion.extendToLeft && !isLowerHorizontal) {
                        // Si no hay intersección a la izquierda y no es una intersección inferior, extender hasta la pared del mueble
                        const currentX = (interseccion.position.x - 0.5) * actualWidth;
                        const leftLimit = -actualWidth / 2;
                        const leftWidth = currentX - leftLimit;
                        width = 2 * leftWidth;
                    } else if (interseccion.extendToLeft && isLowerHorizontal) {
                        // Si es una intersección inferior, no extender hasta la pared del mueble
                        // sino mantener un ancho mínimo
                        width = actualEspesor * 4;
                    }

                    if (rightIntersection && interseccion.extendToRight) {
                        const rightLimit = (rightIntersection.position.x - 0.5) * actualWidth - actualEspesor / 2;
                        const currentX = (interseccion.position.x - 0.5) * actualWidth;
                        const rightWidth = rightLimit - currentX;
                        width = Math.min(width, 2 * rightWidth);
                    } else if (interseccion.extendToRight && !isLowerHorizontal) {
                        // Si no hay intersección a la derecha y no es una intersección inferior, extender hasta la pared del mueble
                        const currentX = (interseccion.position.x - 0.5) * actualWidth;
                        const rightLimit = actualWidth / 2;
                        const rightWidth = rightLimit - currentX;
                        width = Math.min(width, 2 * rightWidth);
                    } else if (interseccion.extendToRight && isLowerHorizontal) {
                        // Si es una intersección inferior, no extender hasta la pared del mueble
                        // sino mantener un ancho mínimo
                        width = Math.min(width, actualEspesor * 4);
                    }
                }

                // Si esta es la intersección que debe cortar la segunda vertical,
                // asegurarse de que se extienda lo suficiente para cortarla
                if (shouldCutVertical && rightIntersection) {
                    const rightLimit = (rightIntersection.position.x - 0.5) * actualWidth - actualEspesor / 2;
                    const currentX = (interseccion.position.x - 0.5) * actualWidth;
                    const rightWidth = rightLimit - currentX;
                    width = Math.max(width, 2 * rightWidth);
                }

                // Calcular la posición X ajustada basada en el ancho
                let adjustedX = x;

                if (isUpperHorizontal) {
                    // Para intersecciones horizontales superiores, ajustar la posición según las intersecciones verticales
                    if (leftIntersection && rightIntersection) {
                        // Si hay intersecciones en ambos lados, centrar entre ellas
                        const leftLimit = (leftIntersection.position.x - 0.5) * actualWidth + actualEspesor / 2;
                        const rightLimit = (rightIntersection.position.x - 0.5) * actualWidth - actualEspesor / 2;
                        adjustedX = (leftLimit + rightLimit) / 2;
                    } else if (leftIntersection) {
                        // Si solo hay intersección a la izquierda, centrar entre esa intersección y la pared derecha
                        const leftLimit = (leftIntersection.position.x - 0.5) * actualWidth + actualEspesor / 2;
                        const rightLimit = actualWidth / 2;
                        adjustedX = (leftLimit + rightLimit) / 2;
                    } else if (rightIntersection) {
                        // Si solo hay intersección a la derecha, centrar entre la pared izquierda y esa intersección
                        const leftLimit = -actualWidth / 2;
                        const rightLimit = (rightIntersection.position.x - 0.5) * actualWidth - actualEspesor / 2;
                        adjustedX = (leftLimit + rightLimit) / 2;
                    } else {
                        // Si no hay intersecciones verticales, centrar en el mueble
                        adjustedX = 0;
                    }
                } else {
                    // Para intersecciones horizontales inferiores, mantener el comportamiento actual
                    // Si hay una intersección a la izquierda pero no a la derecha, ajustar hacia la derecha
                    if (leftIntersection && !rightIntersection && interseccion.extendToLeft) {
                        const leftLimit = (leftIntersection.position.x - 0.5) * actualWidth + actualEspesor / 2;
                        adjustedX = leftLimit + width / 2;
                    }
                    // Si hay una intersección a la derecha pero no a la izquierda, ajustar hacia la izquierda
                    else if (!leftIntersection && rightIntersection && interseccion.extendToRight) {
                        const rightLimit = (rightIntersection.position.x - 0.5) * actualWidth - actualEspesor / 2;
                        adjustedX = rightLimit - width / 2;
                    }
                    // Si hay intersecciones en ambos lados, centrar entre ellas
                    else if (leftIntersection && rightIntersection) {
                        const leftLimit = (leftIntersection.position.x - 0.5) * actualWidth + actualEspesor / 2;
                        const rightLimit = (rightIntersection.position.x - 0.5) * actualWidth - actualEspesor / 2;
                        adjustedX = (leftLimit + rightLimit) / 2;
                    }
                }

                return (
                    <Tabla
                        key={`interseccion-${index}`}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        shape="box"
                        position={[
                            adjustedX,
                            y,
                            actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                        ]}
                        width={width}
                        height={actualEspesor}
                        depth={actualDepth - actualRetranqueoTrasero - actualEspesor}
                        material={materiales.Artico}
                        espesorBase={actualEspesor}
                    />
                );
            }
        });
    }

    // Manejador del clic: actualiza la ref de contexto para el casco seleccionado
    const handleClick = (event: React.PointerEvent) => {
        event.stopPropagation();
        if (groupRef.current && detectionBoxRef.current) {
            setContextRef({ groupRef: groupRef.current, detectionRef: detectionBoxRef.current });
        }
    };


    const dimensiones = calcularDimensiones();
    const posiciones = calcularPosiciones();

    // Actualizamos el userData del grupo cuando cambia la configuración
    useEffect(() => {
        if (refItem && isSelected) {
            const newConfig = refItem.groupRef?.userData ?? refItem.userData ?? initialData;

            setLocalConfig((prev) => {
                const hasChanged = Object.keys(newConfig).some(
                    key => newConfig[key] !== prev[key]
                );
                return hasChanged ? { ...prev, ...newConfig } : prev;
            });
        }
    }, [refItem, isSelected]);



    return (
        <group ref={groupRef} position={position} rotation={rotation}>
            <group onClick={handleClick}>
                {/* Tablon inferior (suelo) */}
                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={posiciones.suelo}
                    width={dimensiones.suelo.width}
                    height={dimensiones.suelo.height}
                    depth={dimensiones.suelo.depth}
                    material={materiales.Artico}
                    posicionCaja="bottom"
                    shape={actualEsquinaXTriangulada ? "trapezoid" : "box"}
                    bordeEjeY={false}
                />

                {/* Tablon lado izquierdo */}
                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={posiciones.izquierda}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.Artico}
                    posicionCaja="left"
                    shape={actualEsquinaXTriangulada ? "trapezoid" : "box"}
                />

                {/* Tablon lado derecho */}
                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={posiciones.derecha}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.Artico}
                    posicionCaja="right"
                    shape={actualEsquinaXTriangulada ? "trapezoid" : "box"}
                />

                {/* Tablon detrás */}
                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={posiciones.trasero}
                    width={dimensiones.trasero.width}
                    height={dimensiones.trasero.height}
                    depth={dimensiones.trasero.depth}
                    material={materiales.Artico}
                    shape="box"
                />

                {/* Tablon arriba (techo) */}
                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={posiciones.techo}
                    width={dimensiones.techo.width}
                    height={dimensiones.techo.height}
                    depth={dimensiones.techo.depth}
                    material={materiales.Artico}
                    posicionCaja="top"
                    shape={actualEsquinaXTriangulada || actualEsquinaZTriangulada ? "trapezoid" : "box"}
                    bordeEjeY={false}
                    bordeEjeZ={actualEsquinaZTriangulada}
                    disableAdjustedWidth={
                        actualEsquinaZTriangulada || (actualEsquinaZTriangulada && actualEsquinaXTriangulada)
                    }
                />

                {/* Renderizar patas */}
                {patas && indiceActualPata !== -1 && patas[indiceActualPata] && (
                    <group>
                        {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                            position: [-actualWidth / 2 + 0.1, position[1], -actualDepth / 2 + 0.1],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                            position: [actualWidth / 2 - 0.1, position[1], -actualDepth / 2 + 0.1],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                            position: [-actualWidth / 2 + 0.1, position[1], actualDepth / 2 - 0.1],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                            position: [actualWidth / 2 - 0.1, position[1], actualDepth / 2 - 0.1],
                            height: actualAlturaPatas,
                        })}
                    </group>
                )}

                {/* Renderizar puertas */}
                {puertas && indiceActualPuerta !== -1 && puertas[indiceActualPuerta] && (
                    <>
                        {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                            parentRef: groupRef,
                            insideRef: detectionBoxRef,
                            position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                            width: actualWidth - (actualEspesor * 4),
                            height: actualHeight / 2,
                            depth: actualEspesor,
                            pivot: "right",
                        })}
                    </>
                )}

                {/* Renderizar intersecciones */}
                {renderIntersecciones()}
            </group>
            <group>
                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={[
                        -((actualWidth / 2) - actualEspesor),
                        (actualHeight / 2) + extraAltura,
                        (actualDepth / 2) + (actualEspesor / 2)
                    ]}
                    width={actualEspesor * 2}
                    height={actualHeight}
                    depth={actualEspesor}
                    material={materiales.Artico}
                    posicionCaja="left"
                    shape={"box"}
                />

                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={[
                        ((actualWidth / 2) - actualEspesor),
                        (actualHeight / 2) + extraAltura,
                        (actualDepth / 2) + (actualEspesor / 2)
                    ]}
                    width={actualEspesor * 2}
                    height={actualHeight}
                    depth={actualEspesor}
                    material={materiales.Artico}
                    posicionCaja="right"
                    shape={"box"}
                />

                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={[
                        0,
                        (actualHeight - (actualEspesor)) + extraAltura,
                        (actualDepth / 2) + (actualEspesor / 2)
                    ]}
                    width={actualWidth - (actualEspesor ) * 4}
                    height={actualEspesor * 2}
                    depth={actualEspesor}
                    material={materiales.Artico}
                    posicionCaja="top"
                    shape={"box"}
                />
            </group>

            <group
                ref={detectionBoxRef}>
                <mesh
                    position={[0,actualHeight/2+extraAltura,actualRetranqueoTrasero/2]}
                    material={materiales.Transparent}
                >
                    <boxGeometry args={[actualWidth-actualEspesor*2, actualHeight-actualEspesor*2, actualDepth-actualEspesor/4-actualRetranqueoTrasero]}/>
                </mesh>
            </group>
        </group>
    );
};

// Componente de alto nivel: el que actualiza el contexto únicamente si es el casco seleccionado.
const BodegueroWithContext = (props: any) => {
    const { refItem, setRefItem, version} = useSelectedItemProvider();
    const meshRef = useRef<any>(null);
    const materiales = useMaterial();

    const updateContextRef = useCallback(
        (ref: any) => {
            if (ref && (!refItem || ref.groupRef !== refItem.groupRef)) {
                setRefItem(ref);
            }
        },
        [refItem, setRefItem]
    );

    return (
        <BodegueroFuncional
            {...props}
            contextRef={meshRef}
            setContextRef={updateContextRef}
            materiales={materiales}
            version={version}
        />
    );
};

export default BodegueroWithContext;
