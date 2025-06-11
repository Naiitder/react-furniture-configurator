import React, {useRef, useEffect, useCallback, useState} from "react";
import * as THREE from "three";
import Tabla from "./Tabla";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";
import {useMaterial} from "../../assets/materials";
import {calcularDimensiones} from "../../utils/calculadoraDimensiones";
import {calcularPosiciones} from "../../utils/calculadoraPosiciones";
import {renderIntersecciones} from "../../utils/interseccionesRenderer";

// Definición de los props para el componente Casco
export type CascoProps = {
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
    intersecciones?: any[];
    renderExtraParts?: (params: {
        localConfig: any;
        dimensiones: any;
        posiciones: any;
        materiales: any
    }) => React.ReactNode;
    seccionesHorizontales?: any[];
    seccionesVerticales?: any[];
    version?: any[];
    setVersion?: (version: any) => void;
    children?: React.ReactNode;
    id?: string;
};

const CascoFuncional = (
    props: CascoProps & {
        contextRef: React.MutableRefObject<any>;
        setContextRef: (ref: any) => void;
        materiales: any;
    }
) => {
    // Valores por defecto
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
        renderExtraParts,
        seccionesHorizontales = [],
        seccionesVerticales = [],
        contextRef,
        setContextRef,
        materiales,
        version,
        children,
        id,
    } = props;

    const groupRef = useRef<THREE.Group>(null);
    const detectionBoxRef = useRef<THREE.Group>(null);
    const horizontalSectionsRefs = useRef<{ [key: string]: THREE.Mesh }>({});
    const verticalSectionsRefs = useRef<{ [key: string]: THREE.Mesh }>({});
    const {refItem} = useSelectedItemProvider();

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
        intersecciones,
    };

    // Estado local para la configuración
    const [localConfig, setLocalConfig] = useState(initialData);

    // Inicializar userData y nombre
    useEffect(() => {
        if (groupRef.current && Object.keys(groupRef.current.userData).length === 0) {
            groupRef.current.userData = {...initialData};
        }
        if (groupRef.current && id && !groupRef.current.name) {
            groupRef.current.name = id;
        }
    }, [id]);

    // Sincronizar configuración cuando está seleccionado
    const isSelected = refItem && refItem.groupRef === groupRef.current;
    useEffect(() => {
        if (refItem && isSelected) {
            const newConfig = refItem.groupRef?.userData ?? refItem.userData ?? initialData;
            setLocalConfig((prev) => {
                const hasChanged = Object.keys(newConfig).some(
                    (key) => newConfig[key] !== prev[key]
                );
                return hasChanged ? {...prev, ...newConfig} : prev;
            });
        }
    }, [refItem, isSelected, version]);

    // Actualizar configuración
    const updateConfig = (key: string, value: any) => {
        setLocalConfig((prev) => {
            const newConfig = {...prev, [key]: value};
            if (refItem && refItem.groupRef) {
                refItem.groupRef.userData = {...refItem.groupRef.userData, [key]: value};
                if (refItem.groupRef.setVersion) {
                    refItem.groupRef.setVersion((prev: number) => prev + 1);
                }
            }
            return newConfig;
        });
    };

    // Extraer variables del estado local
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
    const actualRetranqueoTrasero = localConfig.retranqueoTrasero ?? retranqueoTrasero;
    const actualRetranquearSuelo = localConfig.retranquearSuelo ?? retranquearSuelo;
    const actualEsquinaXTriangulada = localConfig.esquinaXTriangulada ?? esquinaXTriangulada;
    const actualEsquinaZTriangulada = localConfig.esquinaZTriangulada ?? esquinaZTriangulada;
    const actualAlturaPatas = localConfig.alturaPatas || alturaPatas;
    const extraAltura = patas && indicePata !== -1 ? actualAlturaPatas : 0;
    let indiceActualPata = localConfig.indicePata ?? indicePata;
    if (indiceActualPata > 0) indiceActualPata--;
    let indiceActualPuerta = localConfig.indicePuerta ?? indicePuerta;
    if (indiceActualPuerta > 0) indiceActualPuerta--;

    // Manejador de clics
    const handleClick = (event: React.PointerEvent) => {
        event.stopPropagation();
        if (groupRef.current && detectionBoxRef.current) {
            setContextRef({groupRef: groupRef.current, detectionRef: detectionBoxRef.current});
        }
    };

    // Calcular dimensiones y posiciones
    const dimensiones = calcularDimensiones(localConfig);
    const posiciones = calcularPosiciones({...localConfig, patas});

    // Renderizar intersecciones
    const renderInterseccionesInternas = () => {
        if (!actualIntersecciones.length) return null;
        return renderIntersecciones({
            intersecciones: actualIntersecciones,
            dimensiones: {
                width: actualWidth,
                height: actualHeight,
                depth: actualDepth,
                espesor: actualEspesor,
                retranqueoTrasero: actualRetranqueoTrasero,
                extraAltura,
                traseroDentro: actualTraseroDentro,
            },
            refs: {
                groupRef,
                detectionBoxRef,
            },
            materiales,
        });
    };

    // TODO: Coger material de los props, quitar los valores hard-coded
    return (
        <group ref={groupRef} position={position} rotation={rotation}>
            <group onClick={handleClick}>
                {/* Suelo */}
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

                {/* Lado izquierdo */}
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

                {/* Lado derecho */}
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

                {/* Trasero */}
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

                {/* Techo */}
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

                {/* Patas */}
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

                {/* Puertas */}
                {puertas && indiceActualPuerta !== -1 && puertas[indiceActualPuerta] && (
                    <>
                        {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                            parentRef: groupRef,
                            insideRef: detectionBoxRef,
                            position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                            width: actualWidth > 2 ? actualWidth / 2 : actualWidth,
                            height: actualHeight,
                            depth: actualEspesor,
                            pivot: "right",
                        })}
                        {actualWidth > 2 && (
                            <>
                                {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                                    parentRef: groupRef,
                                    insideRef: detectionBoxRef,
                                    position: [-posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                                    width: actualWidth / 2,
                                    height: actualHeight,
                                    depth: actualEspesor,
                                    pivot: "left",
                                })}
                            </>
                        )}
                    </>
                )}

                {/* Intersecciones */}
                {renderInterseccionesInternas()}

                {/* Piezas adicionales dinámicas */}
                {renderExtraParts && renderExtraParts({localConfig, dimensiones, posiciones, materiales})}

                {/* Children dinámicos */}
                {children}
            </group>

            <group ref={detectionBoxRef}>
                <mesh
                    position={[0, actualHeight / 2 + extraAltura, actualRetranqueoTrasero / 2]}
                    material={materiales.Transparent}
                >
                    <boxGeometry
                        args={[actualWidth - actualEspesor * 2, actualHeight - actualEspesor * 2, actualDepth - actualEspesor / 2 - actualRetranqueoTrasero]}
                    />
                </mesh>
            </group>
        </group>
    );
};

const CascoWithContext = (props: any) => {
    const {refItem, setRefItem, version} = useSelectedItemProvider();
    const meshRef = useRef<any>(null);
    const materiales = useMaterial();

    const updateContextRef = useCallback((ref: any) => {
        if (ref && (!refItem || ref.groupRef !== refItem.groupRef)) {
            setRefItem(ref);
        }
    }, [refItem, setRefItem]);

    return (
        <CascoFuncional
            {...props}
            contextRef={meshRef}
            setContextRef={updateContextRef}
            materiales={materiales}
            version={version}
        />
    );
};

export default CascoWithContext;