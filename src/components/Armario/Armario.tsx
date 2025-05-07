import React, { useRef, useEffect, useCallback, useState } from "react";
import * as THREE from "three";
import Tabla from "../Casco/Tabla";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import { useMaterial } from "../../assets/materials";
import { useSelectedPieceProvider } from "../../contexts/SelectedPieceProvider";
import Cajon from "../Aparador/Cajon";

// Definición de los props para el componente Casco
export type ArmarioProps = {
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
    version?: any[];
    setVersion?: (version: any) => void;
    cajonesHorizontales?: number;
    cajonesVerticales?: number;
    seccionesHorizontales?: number;
    seccionesVerticales?: any[];
    ratiosHorizontales?: any[]; // Nuevo prop para ratios horizontales
    ratiosVerticales?: string;   // Nuevo prop para ratios verticales
};

const ArmarioFuncional = (
    props: ArmarioProps & {
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
        contextRef,
        setContextRef,
        materiales,
        version,
        cajonesHorizontales = 2,
        cajonesVerticales = 2,
        seccionesHorizontales = [],
        seccionesVerticales = [],
        ratiosHorizontales = "1.4/1", // Valor por defecto
        ratiosVerticales = "1.8/1.8/1", // Valor por defecto
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
        cajonesHorizontales,
        cajonesVerticales,
        ratiosHorizontales, // Añadido al estado inicial
        ratiosVerticales,   // Añadido al estado inicial
    };

    // Usamos estado local para la configuración de este casco.
    const [localConfig, setLocalConfig] = useState(initialData);

    useEffect(() => {
        if (groupRef.current && Object.keys(groupRef.current.userData).length === 0) {
            groupRef.current.userData = { ...initialData };
        }

        if (!groupRef.current.name && props.id) {
            groupRef.current.name = props.id; // 🔑 esto permite identificar el casco
        }
    }, []);

    // Sincronizamos el estado local con userData cuando el casco está seleccionado
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

    // Función para actualizar la configuración tanto en el estado local como en el userData
    const updateConfig = (key: string, value: any) => {
        setLocalConfig((prev) => {
            const newConfig = { ...prev, [key]: value };
            if (refItem && refItem.groupRef) {
                refItem.groupRef.userData = { ...refItem.groupRef.userData, [key]: value };
                if (refItem.groupRef.setVersion) {
                    refItem.groupRef.setVersion((prev: number) => prev + 1);
                }
            }
            return newConfig;
        });
    };

    useEffect(() => {
        console.log(seccionesVerticales)
        console.log(seccionesHorizontales)
    }, [seccionesVerticales, seccionesHorizontales]);

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
    const actualRetranqueoTrasero = localConfig.retranqueoTrasero ?? retranqueoTrasero;
    const actualRetranquearSuelo = localConfig.retranquearSuelo ?? retranquearSuelo;
    const actualEsquinaXTriangulada = localConfig.esquinaXTriangulada ?? esquinaXTriangulada;
    const actualEsquinaZTriangulada = localConfig.esquinaZTriangulada ?? esquinaZTriangulada;
    const actualAlturaPatas = localConfig.alturaPatas || alturaPatas;
    const actualRatiosHorizontales = localConfig.ratiosHorizontales ?? ratiosHorizontales; // Extraemos del estado
    const actualRatiosVerticales = localConfig.ratiosVerticales ?? ratiosVerticales;     // Extraemos del estado
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
            ],
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
            ],
            izquierda: [
                -mitadAncho + actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0,
            ],
            derecha: [
                mitadAncho - actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0,
            ],
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
            ],
            puerta: [
                actualWidth / 2,
                (actualHeight - actualEspesor - actualEspesor) / 2 +
                actualEspesor +
                extraAltura,
                actualDepth / 2 + actualEspesor / 2,
            ],
        };
    };

    // Manejador del clic: actualiza la ref de contexto para el casco seleccionado
    const handleClick = (event: React.PointerEvent) => {
        event.stopPropagation();
        if (groupRef.current && detectionBoxRef.current) {
            setContextRef({ groupRef: groupRef.current, detectionRef: detectionBoxRef.current });
        }
    };

    const { refPiece, setRefPiece } = useSelectedPieceProvider();

    const innerHeight = actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor);

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

    const handleSectionClick = (event: React.PointerEvent) => {
        event.stopPropagation();
        if (groupRef.current && detectionBoxRef.current) {
            setContextRef({ groupRef: groupRef.current, detectionRef: detectionBoxRef.current });
            setRefPiece(sectionDoor.current);
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

    const sectionDoor = useRef(null);

    const renderGridSections = () => {
        const seccionesX = localConfig.cajonesHorizontales;
        const seccionesY = localConfig.cajonesVerticales;

        // Usar los ratios del estado local
        const ratioArrayX = actualRatiosHorizontales
            ? actualRatiosHorizontales.split('/').map(Number)
            : Array(seccionesX).fill(1);
        if (ratioArrayX.length !== seccionesX) {
            console.warn(`Los ratios horizontales (${ratioArrayX.length}) no coinciden con seccionesX (${seccionesX}). Usando ratios por defecto.`);
            ratioArrayX.length = 0;
            ratioArrayX.push(...Array(seccionesX).fill(1));
        }

        const ratioArrayY = actualRatiosVerticales
            ? actualRatiosVerticales.split('/').map(Number)
            : Array(seccionesY).fill(1);
        if (ratioArrayY.length !== seccionesY) {
            console.warn(`Los ratios verticales (${ratioArrayY.length}) no coinciden con seccionesY (${seccionesY}). Usando ratios por defecto.`);
            ratioArrayY.length = 0;
            ratioArrayY.push(...Array(seccionesY).fill(1));
        }

        // Calcular anchos horizontales
        const totalAvailableWidth = actualWidth - actualEspesor * 2;
        const totalRatioX = ratioArrayX.reduce((sum, ratio) => sum + ratio, 0);
        const unitWidth = totalAvailableWidth / totalRatioX;
        const sectionWidths = ratioArrayX.map(ratio => ratio * unitWidth);

        // Calcular alturas verticales
        const totalAvailableHeight = innerHeight/2 ;
        const totalRatioY = ratioArrayY.reduce((sum, ratio) => sum + ratio, 0);
        const unitHeight = totalAvailableHeight / totalRatioY;
        const sectionHeights = ratioArrayY.map(ratio => ratio * unitHeight);

        const sectionDepth = actualDepth - actualEspesor - actualRetranqueoTrasero;

        const sections = [];

        for (let ix = 0; ix < seccionesX; ix++) {
            for (let iy = 0; iy < seccionesY; iy++) {
                // Calcular posición X (centro de la sección)
                let x = -actualWidth / 2 + actualEspesor;
                for (let i = 0; i < ix; i++) {
                    x += sectionWidths[i];
                }
                x += sectionWidths[ix] / 2;

                // Calcular posición Y (centro de la sección)
                let y = (actualSueloDentro ? 0 : actualEspesor) + extraAltura;
                for (let i = 0; i < iy; i++) {
                    y += sectionHeights[i];
                }
                y += sectionHeights[iy] / 2;

                const z = actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0);

                sections.push(
                    <group key={`grid-section-${ix}-${iy}g`}>
                        <Cajon
                            cajon={(ix == 0 && iy == 1) ? -1 : null}
                            parentRef={groupRef}
                            insideRef={detectionBoxRef}
                            position={[x, y, z + sectionDepth / 2 - 0.05 / 2]}
                            width={sectionWidths[ix] - 0.011}
                            height={sectionHeights[iy] - 0.011} // Añado otro decimal para evitar clipping de intersecciones
                            depth={0.05}
                        />
                        <mesh
                            key={`grid-section-${ix}-${iy}1`}
                            position={[x, y + sectionHeights[iy] / 2 - 0.005 / 2, z-0.005]}
                            material={materiales.Interior}
                        >
                            <boxGeometry args={[sectionWidths[ix] - 0.01, 0.005, sectionDepth]} />
                        </mesh>
                        <mesh
                            key={`grid-section-${ix}-${iy}2`}
                            position={[x, y - sectionHeights[iy] / 2 + 0.005 / 2, z-0.005]}
                            material={materiales.Interior}
                        >
                            <boxGeometry args={[sectionWidths[ix] - 0.01, 0.005, sectionDepth]} />
                        </mesh>
                        <mesh
                            key={`grid-section-${ix}-${iy}3`}
                            position={[x + sectionWidths[ix] / 2 - 0.005 / 2, y, z-0.005]}
                            material={materiales.Interior}
                        >
                            <boxGeometry args={[0.005, sectionHeights[iy], sectionDepth]} />
                        </mesh>
                        <mesh
                            key={`grid-section-${ix}-${iy}4`}
                            position={[x - sectionWidths[ix] / 2 + 0.005 / 2, y, z-0.005]}
                            material={materiales.Interior}
                        >
                            <boxGeometry args={[0.005, sectionHeights[iy], sectionDepth]} />
                        </mesh>
                    </group>
                );
            }
        }

        return sections;
    };

    return (
        <group ref={groupRef} position={position} rotation={rotation}>
            <group onClick={handleClick}>
                {/* Tablon inferior (suelo) */}
                {/*Secciones*/}
                <group>
                    {renderGridSections()}
                </group>

                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    espesorBase={espesor}
                    position={posiciones.suelo}
                    width={dimensiones.suelo.width}
                    height={dimensiones.suelo.height}
                    depth={dimensiones.suelo.depth}
                    material={materiales.WoodBatch}
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
                    material={materiales.WoodBatch}
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
                    material={materiales.WoodBatch}
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
                    material={materiales.WoodBatch}
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
                    material={materiales.WoodBatch}
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
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [-actualWidth / 2 + 0.1, position[1], -actualDepth / 2 + 0.1],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [actualWidth / 2 - 0.1, position[1], -actualDepth / 2 + 0.1],
                            height: actualAlturaPatas,
                        })}
                        <mesh position={[-actualWidth/2 +0.1 , (position[1] + actualAlturaPatas -(actualAlturaPatas*0.25)/2), actualDepth/256]} material={materiales.Interior}>
                            <boxGeometry args={[.075,actualAlturaPatas * 0.25,actualDepth-0.075*2]}  />
                        </mesh>
                        <mesh position={[actualWidth/2 -0.1 , (position[1] + actualAlturaPatas -(actualAlturaPatas*0.25)/2), actualDepth/256]} material={materiales.Interior}>
                            <boxGeometry args={[.075,actualAlturaPatas * 0.25 ,actualDepth-0.075*2]}  />
                        </mesh>
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [0, position[1], 0],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [-actualWidth / 2 + 0.1, position[1], actualDepth / 2 - 0.1],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [actualWidth / 2 - 0.1, position[1], actualDepth / 2 - 0.1],
                            height: actualAlturaPatas,
                        })}
                    </group>
                )}

                {/* Renderizar puertas */}
                {puertas && indiceActualPuerta !== -1 && puertas[indiceActualPuerta] && (
                    <>
                        {React.cloneElement(puertas[indiceActualPuerta], {
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
                                {React.cloneElement(puertas[indiceActualPuerta], {
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
            </group>
            <group ref={detectionBoxRef}>
                <mesh
                    position={[
                        0,
                        (actualSueloDentro ? 0 : actualEspesor) + extraAltura + (innerHeight/2) + (innerHeight/2) / 2,
                        actualRetranqueoTrasero / 2]}
                    material={materiales.Transparent}
                >
                    <boxGeometry
                        args={[actualWidth - actualEspesor * 2,innerHeight/2, actualDepth - actualEspesor / 4 - actualRetranqueoTrasero]}
                    />
                </mesh>
            </group>
            <group >
                <mesh
                    position={[
                        0,
                        (actualSueloDentro ? 0 : actualEspesor) + extraAltura + (innerHeight/2) + (innerHeight/2) / 2,
                        actualRetranqueoTrasero / 2]}
                    material={materiales.OakWood}
                >
                    <boxGeometry
                        args={[actualEspesor,innerHeight/2, actualDepth - actualEspesor / 4 - actualRetranqueoTrasero]}
                    />
                </mesh>
                <mesh
                    position={[
                        0,
                        (actualSueloDentro ? 0 : actualEspesor) + extraAltura + (innerHeight/2) + (innerHeight/2) / 2,
                        actualRetranqueoTrasero / 2]}
                    material={materiales.OakWood}
                >
                    <boxGeometry
                        args={[actualWidth - actualEspesor * 2,actualEspesor, actualDepth - actualEspesor / 4 - actualRetranqueoTrasero]}
                    />
                </mesh>
            </group>
            {renderHorizontalSections()}
            {renderVerticalSections()}
        </group>
    );
};

// Componente de alto nivel: el que actualiza el contexto únicamente si es el casco seleccionado.
const ArmarioWithContext = (props: any) => {
    const { refItem, setRefItem, version } = useSelectedItemProvider();
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
        <ArmarioFuncional
            {...props}
            contextRef={meshRef}
            setContextRef={updateContextRef}
            materiales={materiales}
            version={version}
        />
    );
};

export default ArmarioWithContext;