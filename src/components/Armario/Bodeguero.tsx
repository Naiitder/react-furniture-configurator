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
        // 1) Ordenamos por fecha de creación y mantenemos el orden original si las fechas son iguales
        // Primero mapeamos para incluir el índice original
        const withIndices = actualIntersecciones.map((inter, idx) => ({ inter, originalIndex: idx }));

        // Ordenamos por fecha, y en caso de fechas iguales, por índice original
        const sortedWithIndices = withIndices.sort((a, b) => {
            const timeA = a.inter.createdAt.getTime();
            const timeB = b.inter.createdAt.getTime();

            // Si las fechas son diferentes, ordenamos por fecha
            if (timeA !== timeB) {
                return timeA - timeB;
            }

            // Si las fechas son iguales, ordenamos por posición original en el array
            return a.originalIndex - b.originalIndex;
        });

        // Extraemos las intersecciones ordenadas
        const sorted = sortedWithIndices.map(item => item.inter);



        // Función auxiliar: calcula el rango vertical real de una intersección vertical
        const getVerticalRange = (vertical, verticalIndex) => {
            const x = (vertical.position.x - 0.5) * actualWidth;
            let topY = extraAltura + actualHeight - actualEspesor;
            let botY = extraAltura + actualEspesor;

            // Buscamos horizontales anteriores o CON LA MISMA FECHA que recorten esta vertical
            for (let i = 0; i < verticalIndex; i++) {
                const h = sorted[i];
                if (h.orientation === Orientacion.Horizontal) {
                    // Si la horizontal tiene fecha anterior o igual (y menor índice)
                    // puede recortar a esta vertical
                    const horizontalTime = h.createdAt.getTime();
                    const verticalTime = vertical.createdAt.getTime();

                    if (horizontalTime <= verticalTime) {
                        // Calculamos el rango horizontal de esta horizontal
                        const hx = (h.position.x - 0.5) * actualWidth;
                        let leftX = -actualWidth / 2;
                        let rightX = actualWidth / 2;

                        // Buscamos verticales que limiten esta horizontal
                        // Solo las verticales con índice menor que i pueden afectar
                        for (let j = 0; j < i; j++) {
                            const v = sorted[j];
                            if (v.orientation === Orientacion.Vertical && v.id !== vertical.id) {
                                const vx = (v.position.x - 0.5) * actualWidth;
                                if (vx < hx && vx > leftX) leftX = vx;
                                if (vx > hx && vx < rightX) rightX = vx;
                            }
                        }

                        leftX += actualEspesor / 2;
                        rightX -= actualEspesor / 2;

                        // Solo recortamos si nuestra x está dentro del rango de esta horizontal
                        if (x >= leftX && x <= rightX) {
                            const hy = h.position.y * actualHeight + extraAltura;
                            const verticalY = vertical.position.y * actualHeight + extraAltura;

                            // Revisamos si esta horizontal cruza nuestra vertical
                            if (Math.abs(hy - verticalY) <= actualEspesor/2) {
                                // Está justo en la intersección, recortamos
                                if (hy > verticalY) {
                                    topY = Math.min(topY, hy - actualEspesor/2);
                                } else {
                                    botY = Math.max(botY, hy - actualEspesor/2);
                                }
                            } else if (hy > verticalY) {
                                topY = Math.min(topY, hy);
                            } else {
                                botY = Math.max(botY, hy);
                            }
                        }
                    }
                }
            }

            return [botY, topY];
        };

        // Helper: devuelve [leftX, rightX] de una horizontal teniendo en cuenta
        // los rangos verticales reales de las verticales
        const computeHorizontalRange = (h, horizontalIndex) => {
            const hx = (h.position.x - 0.5) * actualWidth;
            const hy = h.position.y * actualHeight + extraAltura;
            let leftX = -actualWidth / 2;
            let rightX = actualWidth / 2;

            // Para manejar el caso de verticales exactamente en la misma X
            let exactMatchVertical = null;
            let exactMatchVerticalIndex = -1;

            // Solo verticales anteriores o CON LA MISMA FECHA que h
            // Pero solo hasta el índice de esta horizontal
            for (let i = 0; i < horizontalIndex; i++) {
                const v = sorted[i];

                if (v.orientation === Orientacion.Vertical) {
                    const verticalTime = v.createdAt.getTime();
                    const horizontalTime = h.createdAt.getTime();

                    // Consideramos verticales anteriores o con la misma fecha (pero menor índice)
                    if (verticalTime <= horizontalTime) {
                        const vx = (v.position.x - 0.5) * actualWidth;

                        // Verificamos si la vertical realmente intersecta con la horizontal en Y
                        const [vBotY, vTopY] = getVerticalRange(v, i);

                        // El punto clave: solo consideramos esta vertical si realmente
                        // se cruza con nuestra horizontal, teniendo en cuenta el espesor
                        const intersecta = hy >= vBotY - actualEspesor/2 && hy <= vTopY + actualEspesor/2;

                        if (intersecta) {
                            // Detectamos si hay coincidencia exacta en X (con un pequeño margen de tolerancia)
                            if (Math.abs(vx - hx) < 0.001) {
                                // Guardamos referencia a la vertical que coincide exactamente
                                exactMatchVertical = v;
                                exactMatchVerticalIndex = i;
                                //console.log(`¡Coincidencia exacta! Horizontal [${horizontalIndex}] y Vertical [${i}] en x=${v.position.x.toFixed(2)}`);
                            } else if (vx < hx && vx > leftX) {
                                leftX = vx;
                                //console.log(`Horizontal [${horizontalIndex}] en y=${h.position.y.toFixed(2)}: limitada por izquierda en x=${v.position.x.toFixed(2)}`);
                            } else if (vx > hx && vx < rightX) {
                                rightX = vx;
                                //console.log(`Horizontal [${horizontalIndex}] en y=${h.position.y.toFixed(2)}: limitada por derecha en x=${v.position.x.toFixed(2)}`);
                            }
                        } else {
                            //console.log(`Vertical [${i}] en x=${v.position.x.toFixed(2)} NO intersecta con horizontal [${horizontalIndex}] en y=${h.position.y.toFixed(2)}, rango vertical: [${vBotY.toFixed(2)}, ${vTopY.toFixed(2)}]`);
                        }
                    }
                }
            }

            // Ajustamos márgenes por espesor
            leftX += actualEspesor / 2;
            rightX -= actualEspesor / 2;

            // Si hay coincidencia exacta en X, desplazamos la horizontal al lado con más espacio
            if (exactMatchVertical !== null) {
                // Calculamos espacio disponible a cada lado
                const espacioIzquierda = hx - leftX;
                const espacioDerecha = rightX - hx;


                // Obtenemos la posición X exacta de la vertical (en el sistema de coordenadas de renderizado)
                const vx = (exactMatchVertical.position.x - 0.5) * actualWidth;

                // Comparamos para ver hacia dónde expandir
                if (espacioIzquierda >= espacioDerecha) {
                    // Más espacio a la izquierda, expandimos desde la vertical hacia la izquierda
                    //console.log(`Expandiendo horizontal hacia la izquierda desde la vertical`);
                    // La vertical marca el límite derecho, restamos medio espesor
                    rightX = vx - actualEspesor/2;
                } else {
                    // Más espacio a la derecha, expandimos desde la vertical hacia la derecha
                    //console.log(`Expandiendo horizontal hacia la derecha desde la vertical`);
                    // La vertical marca el límite izquierdo, sumamos medio espesor
                    leftX = vx + actualEspesor/2;
                }
            }

            const result = [leftX, rightX];

            return result;
        };

        return sorted.map((inter, idx) => {
            const x = (inter.position.x - 0.5) * actualWidth;
            const y = inter.position.y * actualHeight + extraAltura;

            if (inter.orientation === Orientacion.Horizontal) {
                // ——————— BRANCH HORIZONTAL ———————
                // Si hay verticales posteriores a esta horizontal, no deberían afectarla
                const [leftX, rightX] = computeHorizontalRange(inter, idx);
                const widthSeg = rightX - leftX;
                const centerX = (leftX + rightX) / 2;

                return (
                    <Tabla
                        key={`int-${idx}`}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        shape="box"
                        position={[
                            centerX,
                            y,
                            actualEspesor / 2 +
                            (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                        ]}
                        width={widthSeg}
                        height={actualEspesor}
                        depth={actualDepth - actualRetranqueoTrasero - actualEspesor}
                        material={materiales.Artico}
                        espesorBase={actualEspesor}
                    />
                );
            } else {
                // ——————— BRANCH VERTICAL ———————
                // Calculamos el rango vertical real considerando horizontales previas
                const [botY, topY] = getVerticalRange(inter, idx);
                const heightSeg = topY - botY;
                const centerY = (topY + botY) / 2;

                // Verificamos que la altura calculada sea positiva
                if (heightSeg <= 0) {
                    //console.log(`Vertical [${idx}] en ${x},${y} tiene altura inválida: ${heightSeg}`);
                    return null; // No renderizamos verticales con altura inválida
                }

                return (
                    <Tabla
                        key={`int-${idx}`}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        shape="box"
                        position={[
                            x,
                            centerY,
                            actualEspesor / 2 +
                            (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                        ]}
                        width={actualEspesor}
                        height={heightSeg}
                        depth={actualDepth - actualRetranqueoTrasero - actualEspesor}
                        material={materiales.Artico}
                        espesorBase={actualEspesor}
                    />
                );
            }
        });
    };

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
