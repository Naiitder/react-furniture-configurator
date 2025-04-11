import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import Caja from "./Caja";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import { useMaterial } from "../../assets/materials";

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
    seccionesHorizontales?: any[];
    seccionesVerticales?: any[];
};

// Componente funcional que reemplaza al componente de clase
const CascoFuncional = (
    props: CascoProps & {
        contextRef: React.MutableRefObject<any>;
        setContextRef: (ref: any) => void;
        materiales: any;
    }
) => {
    // Definición de valores por defecto (equivalentes a defaultProps)
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
        alturaPatas = 0.5,
        indicePata = -1,
        puertas = [],
        indicePuerta = -1,
        seccionesHorizontales = [],
        seccionesVerticales = [],
        contextRef,
        setContextRef,
        materiales,
    } = props;

    const groupRef = useRef<THREE.Group>(null);
    const horizontalSectionsRefs = useRef<{ [key: string]: THREE.Mesh }>({});
    const verticalSectionsRefs = useRef<{ [key: string]: THREE.Mesh }>({});

    const externalContext = contextRef.current || {};

    // Función que calcula las dimensiones de las cajas (suelo, techo, laterales y trasero)
    const calcularDimensiones = () => {
        const userData = externalContext?.userData || {};
        const actualWidth = userData.width || width;
        const actualHeight = userData.height || height;
        const actualDepth = userData.depth || depth;
        const actualEspesor = userData.espesor || espesor;
        const actualSueloDentro = userData.sueloDentro ?? sueloDentro;
        const actualTechoDentro = userData.techoDentro ?? techoDentro;
        const actualTraseroDentro = userData.traseroDentro ?? traseroDentro;
        const offsetDepthTraseroDentro = actualTraseroDentro
            ? actualDepth
            : actualDepth - actualEspesor;
        const actualRetranqueoTrasero =
            externalContext.retranqueoTrasero ?? retranqueoTrasero;
        const actualRetranquearSuelo =
            externalContext.retranquearSuelo ?? retranquearSuelo;
        const actualEsquinaXTriangulada =
            externalContext.esquinaXTriangulada ?? esquinaXTriangulada;
        const actualEsquinaZTriangulada =
            externalContext.esquinaZTriangulada ?? esquinaZTriangulada;

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

    // Función que calcula las posiciones para cada parte del Casco
    const calcularPosiciones = () => {
        const userData = externalContext?.userData || {};
        const actualWidth = userData.width || width;
        const actualHeight = userData.height || height;
        const actualDepth = userData.depth || depth;
        const actualEspesor = userData.espesor || espesor;
        const actualSueloDentro = userData.sueloDentro ?? sueloDentro;
        const actualTechoDentro = userData.techoDentro ?? techoDentro;
        const actualTraseroDentro = userData.traseroDentro ?? traseroDentro;
        const offsetDepthTraseroDentro = actualTraseroDentro
            ? actualDepth
            : actualDepth - actualEspesor;
        const actualRetranqueoTrasero =
            externalContext.retranqueoTrasero ?? retranqueoTrasero;
        const actualRetranquearSuelo =
            externalContext.retranquearSuelo ?? retranquearSuelo;
        const actualEsquinaXTriangulada =
            externalContext.esquinaXTriangulada ?? esquinaXTriangulada;
        const actualEsquinaZTriangulada =
            externalContext.esquinaZTriangulada ?? esquinaZTriangulada;
        const actualAlturaPatas = externalContext.alturaPatas || alturaPatas;
        const indiceActualPata = externalContext.indicePata ?? indicePata;

        const mitadAncho = actualWidth / 2;
        const mitadProfundidad = actualDepth / 2;
        const extraAltura =
            patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;
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
                actualWidth / 2,
                (actualHeight - actualEspesor - actualEspesor) / 2 +
                actualEspesor +
                extraAltura,
                actualDepth / 2 + actualEspesor / 2,
            ] as [number, number, number],
        };
    };

    // Renderizado de las secciones horizontales
    const renderHorizontalSections = () => {
        const actualWidth = externalContext.width || width;
        const actualHeight = externalContext.height || height;
        const actualDepth = externalContext.depth || depth;
        const actualEspesor = externalContext.espesor || espesor;
        const actualTraseroDentro = externalContext.traseroDentro ?? traseroDentro;
        const actualRetranqueoTrasero =
            externalContext.retranqueoTrasero ?? retranqueoTrasero;
        const actualAlturaPatas = externalContext.alturaPatas || alturaPatas;
        const indiceActualPata = externalContext.indicePata ?? indicePata;
        const extraAltura =
            patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;

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
                <Caja
                    key={cube.id}
                    parentRef={groupRef}
                    shape="box"
                    ref={(ref: any) => {
                        if (ref) horizontalSectionsRefs.current[cube.id] = ref;
                    }}
                    position={[
                        adjustedXposition,
                        ry * actualHeight + extraAltura,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                    ]}
                    width={adjustedWidth}
                    height={actualEspesor}
                    depth={
                        cube.relativeDepth * actualDepth -
                        actualRetranqueoTrasero -
                        actualEspesor
                    }
                    material={materiales.OakWood}
                    espesorBase={actualEspesor}
                />
            );
        });
    };

    // Renderizado de las secciones verticales
    const renderVerticalSections = () => {
        const actualWidth = externalContext.width || width;
        const actualHeight = externalContext.height || height;
        const actualDepth = externalContext.depth || depth;
        const actualEspesor = externalContext.espesor || espesor;
        const actualTraseroDentro = externalContext.traseroDentro ?? traseroDentro;
        const actualRetranqueoTrasero =
            externalContext.retranqueoTrasero ?? retranqueoTrasero;
        const actualAlturaPatas = externalContext.alturaPatas || alturaPatas;
        const indiceActualPata = externalContext.indicePata ?? indicePata;
        const extraAltura =
            patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;

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
                <Caja
                    key={cube.id}
                    parentRef={groupRef}
                    shape="box"
                    ref={(ref: any) => {
                        if (ref) verticalSectionsRefs.current[cube.id] = ref;
                    }}
                    position={[
                        rx * actualWidth,
                        adjustedYposition,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                    ]}
                    width={actualEspesor}
                    height={adjustedHeight}
                    depth={
                        cube.relativeDepth * actualDepth -
                        actualRetranqueoTrasero -
                        actualEspesor
                    }
                    material={materiales.OakWood}
                    espesorBase={actualEspesor}
                />
            );
        });
    };

    // Manejador del clic (evita la propagación y actualiza la ref de contexto)
    const handleClick = (event: React.PointerEvent) => {
        event.stopPropagation();
        if (setContextRef && groupRef.current) {
            setContextRef({
                groupRef: groupRef.current,
            });
        }
    };

    // Cálculos
    const dimensiones = calcularDimensiones();
    const posiciones = calcularPosiciones();

    // Ajustes para índices (tal como se hacía en la versión de clase)
    let indiceActualPata = externalContext.indicePata ?? indicePata;
    if (indiceActualPata > 0) indiceActualPata--;
    let indiceActualPuerta = externalContext.indicePuerta ?? indicePuerta;
    if (indiceActualPuerta > 0) indiceActualPuerta--;

    return (
        <group ref={groupRef} position={position} rotation={rotation} onClick={handleClick}>
            {/* Caja inferior (suelo) */}
            <Caja
                parentRef={groupRef}
                espesorBase={espesor}
                position={posiciones.suelo}
                width={dimensiones.suelo.width}
                height={dimensiones.suelo.height}
                depth={dimensiones.suelo.depth}
                material={materiales.OakWood}
                posicionCaja="bottom"
                shape={esquinaXTriangulada ? "trapezoid" : "box"}
                bordeEjeY={false}
            />

            {/* Caja lado izquierdo */}
            <Caja
                parentRef={groupRef}
                espesorBase={espesor}
                position={posiciones.izquierda}
                width={dimensiones.lateral.width}
                height={dimensiones.lateral.height}
                depth={dimensiones.lateral.depth}
                material={materiales.DarkWood}
                posicionCaja="left"
                shape={esquinaXTriangulada ? "trapezoid" : "box"}
            />

            {/* Caja lado derecho */}
            <Caja
                parentRef={groupRef}
                espesorBase={espesor}
                position={posiciones.derecha}
                width={dimensiones.lateral.width}
                height={dimensiones.lateral.height}
                depth={dimensiones.lateral.depth}
                material={materiales.DarkWood}
                posicionCaja="right"
                shape={esquinaXTriangulada ? "trapezoid" : "box"}
            />

            {/* Caja detrás */}
            <Caja
                parentRef={groupRef}
                espesorBase={espesor}
                position={posiciones.trasero}
                width={dimensiones.trasero.width}
                height={dimensiones.trasero.height}
                depth={dimensiones.trasero.depth}
                material={materiales.DarkWood}
                shape="box"
            />

            {/* Caja arriba (techo) */}
            <Caja
                parentRef={groupRef}
                espesorBase={espesor}
                position={posiciones.techo}
                width={dimensiones.techo.width}
                height={dimensiones.techo.height}
                depth={dimensiones.techo.depth}
                material={materiales.OakWood}
                posicionCaja="top"
                shape={esquinaXTriangulada || esquinaZTriangulada ? "trapezoid" : "box"}
                bordeEjeY={false}
                bordeEjeZ={esquinaZTriangulada}
                disableAdjustedWidth={
                    esquinaZTriangulada ||
                    (esquinaZTriangulada && esquinaXTriangulada)
                }
            />

            {/* Renderizar patas */}
            {patas && indiceActualPata !== -1 && patas[indiceActualPata] && (
                <group>
                    {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                        position: [-width / 2 + 0.1, position[1], -depth / 2 + 0.1],
                        height: alturaPatas,
                    })}
                    {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                        position: [width / 2 - 0.1, position[1], -depth / 2 + 0.1],
                        height: alturaPatas,
                    })}
                    {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                        position: [-width / 2 + 0.1, position[1], depth / 2 - 0.1],
                        height: alturaPatas,
                    })}
                    {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                        position: [width / 2 - 0.1, position[1], depth / 2 - 0.1],
                        height: alturaPatas,
                    })}
                </group>
            )}

            {/* Renderizar puertas */}
            {puertas && indiceActualPuerta !== -1 && puertas[indiceActualPuerta] && (
                <>
                    {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                        parentRef: groupRef,
                        position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                        width: width > 2 ? width / 2 : width,
                        height: height,
                        depth: espesor,
                        pivot: "right",
                    })}
                    {width > 2 && (
                        <>
                            {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                                parentRef: groupRef,
                                position: [-posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                                width: width / 2,
                                height: height,
                                depth: espesor,
                                pivot: "left",
                            })}
                        </>
                    )}
                </>
            )}

            {/* Renderizar secciones horizontales y verticales */}
            {renderHorizontalSections()}
            {renderVerticalSections()}
        </group>
    );
};

// Componente de alto nivel que utiliza el proveedor de contexto y los materiales,
// equivalente a la versión original de CascoWithContext.
const CascoWithContext = (props: any) => {
    const { refItem, setRefItem } = useSelectedItemProvider();
    const meshRef = useRef<any>(null);
    const materiales = useMaterial();

    const updateContextRef = useCallback(
        (ref: any) => {
            if (ref && (!refItem || ref.groupRef !== refItem.groupRef)) {
                console.log("NUEVO REF", ref);
                setRefItem(ref);
            }
        },
        [refItem, setRefItem]
    );

    return (
        <CascoFuncional
            {...props}
            contextRef={meshRef}
            setContextRef={updateContextRef}
            materiales={materiales}
        />
    );
};

export default CascoWithContext;