import React, { useRef, useEffect, useCallback, useState } from "react";
import * as THREE from "three";
import Tabla from "../Casco/Tabla";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import { useMaterial } from "../../assets/materials";

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
    seccionesHorizontales?: any[];
    seccionesVerticales?: any[];
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
        seccionesHorizontales = [],
        seccionesVerticales = [],
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

    const renderHorizontalSections = () => {
        return (seccionesHorizontales || []).map((cube: any) => {
            const [rx, ry] = cube.relativePosition;
            const halfWidth = (cube.relativeWidth * actualWidth) / 2;
            const leftEdge = (rx + 0.5) * actualWidth + halfWidth;
            const rightEdge = (rx + 0.5) * actualWidth - halfWidth;
            const tolerance = 0.1;
            const touchesLeftEdge = Math.abs(leftEdge - actualWidth) < tolerance;
            const touchesRightEdge = Math.abs(rightEdge) < tolerance;

            let adjustedWidth = cube.relativeWidth * actualWidth - actualEspesor / 2;
            let adjustedXposition = 0;

            if (!touchesLeftEdge && !touchesRightEdge) {
                adjustedWidth -= actualEspesor / 2;
                adjustedXposition = rx * actualWidth;
            } else if (touchesRightEdge && !touchesLeftEdge) {
                adjustedWidth -= actualEspesor;
                adjustedXposition = rx * actualWidth + actualEspesor / 4;
            } else if (touchesLeftEdge && !touchesRightEdge) {
                adjustedWidth -= actualEspesor;
                adjustedXposition = rx * actualWidth - actualEspesor / 4;
            } else {
                adjustedWidth -= actualEspesor * 1.5;
                adjustedXposition = rx * actualWidth;
            }

            return (
                <Tabla
                    key={cube.id}
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    shape="box"
                    position={[
                        adjustedXposition,
                        ry * actualHeight + extraAltura,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                    ]}
                    width={adjustedWidth}
                    height={actualEspesor}
                    depth={
                        cube.relativeDepth * actualDepth - actualRetranqueoTrasero - actualEspesor
                    }
                    material={materiales.OakWood}
                    espesorBase={actualEspesor}
                />
            );
        });
    };

    const renderVerticalSections = () => {
        return (seccionesVerticales || []).map((cube: any) => {
            const [rx, ry] = cube.relativePosition;
            const touchesTopEdge =
                Math.abs(ry * actualHeight + (cube.relativeHeight * actualHeight) / 2 - actualHeight) <
                0.01;
            const touchesBottomEdge =
                Math.abs(ry * actualHeight - (cube.relativeHeight * actualHeight) / 2) < 0.01;

            let adjustedHeight = cube.relativeHeight * actualHeight - actualEspesor / 2;
            let adjustedYposition = 0;

            if (!touchesTopEdge && !touchesBottomEdge) {
                adjustedHeight -= actualEspesor / 2;
                adjustedYposition = ry * actualHeight + extraAltura;
            } else if (touchesBottomEdge && !touchesTopEdge) {
                adjustedHeight -= actualEspesor;
                adjustedYposition = ry * actualHeight + actualEspesor / 4 + extraAltura;
            } else if (touchesTopEdge && !touchesBottomEdge) {
                adjustedHeight -= actualEspesor;
                adjustedYposition = ry * actualHeight - actualEspesor / 4 + extraAltura;
            } else {
                adjustedHeight -= actualEspesor * 1.5;
                adjustedYposition = ry * actualHeight + extraAltura;
            }

            return (
                <Tabla
                    key={cube.id}
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    shape="box"
                    position={[
                        rx * actualWidth,
                        adjustedYposition,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                    ]}
                    width={actualEspesor}
                    height={adjustedHeight}
                    depth={
                        cube.relativeDepth * actualDepth - actualRetranqueoTrasero - actualEspesor
                    }
                    material={materiales.OakWood}
                    espesorBase={actualEspesor}
                />
            );
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
                    material={materiales.OakWood}
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
                    material={materiales.DarkWood}
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
                    material={materiales.DarkWood}
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
                    material={materiales.DarkWood}
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
                    material={materiales.OakWood}
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




                {/* Renderizar secciones horizontales y verticales */}
                {renderHorizontalSections()}
                {renderVerticalSections()}
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
                    material={materiales.WoodBatch}
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
                    material={materiales.WoodBatch}
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
                    material={materiales.WoodBatch}
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