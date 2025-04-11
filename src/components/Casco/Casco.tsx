import * as React from "react";
import {useRef, useEffect, useState} from "react";
import * as ReactDOM from 'react-dom';
import * as THREE from "three";
import Pieza from "./Pieza";
import CascoInterface from "./CascoInterface"
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";
import {useMaterial} from "../../assets/materials";

// Props para el componente Casco
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
    patas?: React.ReactNode[]; // Array de React nodes para las patas
    alturaPatas?: number;
    indicePata?: number;
    puertas?: React.ReactNode[];
    indicePuerta?: number;
};

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
                                     }) => {
    const groupRef = useRef<THREE.Group>(null);
    const {refItem, setRefItem} = useSelectedItemProvider();
    const materiales = useMaterial();

    // Estados para la interfaz
    const [interfaceMode, setInterfaceMode] = useState("scale");
    const [showInterface, setShowInterface] = useState(false);

    // Actualiza la referencia del grupo en el contexto de Three.js
    useEffect(() => {
        if (groupRef.current && refItem !== groupRef.current) {
            setRefItem(groupRef.current);
        }
    }, [groupRef.current, refItem, setRefItem]);

    // Detectar si este Casco es el seleccionado
    useEffect(() => {
        if (groupRef.current && refItem === groupRef.current) {
            setShowInterface(true);
        } else {
            setShowInterface(false);
        }
    }, [groupRef.current, refItem]);

    // Obtención de propiedades desde el contexto (si existen) o por defecto
    const actualWidth = refItem?.width || width;
    let indiceActualPata = refItem?.indicePata ?? indicePata;
    if (indiceActualPata > 0) {
        indiceActualPata--;
    }
    let indiceActualPuerta = refItem?.indicePuerta ?? indicePuerta;
    if (indiceActualPuerta > 0) {
        indiceActualPuerta--;
    }

    const actualAlturaPatas = refItem?.alturaPatas || alturaPatas;
    const actualHeight = refItem?.height || height;
    const actualDepth = refItem?.depth || depth;
    const actualEspesor = refItem?.espesor || espesor;
    const actualRetranqueoTrasero = refItem?.retranqueoTrasero ?? retranqueoTrasero;
    const actualRetranquearSuelo = refItem?.retranquearSuelo ?? retranquearSuelo;
    const actualSueloDentro = refItem?.sueloDentro ?? sueloDentro;
    const actualTechoDentro = refItem?.techoDentro ?? techoDentro;
    const actualTraseroDentro = refItem?.traseroDentro ?? traseroDentro;
    const actualEsquinaXTriangulada = refItem?.esquinaXTriangulada ?? esquinaXTriangulada;
    const actualEsquinaZTriangulada = refItem?.esquinaZTriangulada ?? esquinaZTriangulada;

    // Función para calcular las dimensiones de cada parte del casco
    const calcularDimensiones = () => {
        const offsetDepthTraseroDentro = actualTraseroDentro ? actualDepth : actualDepth - actualEspesor;
        return {
            suelo: {
                width: actualSueloDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height: actualEspesor,
                depth: (actualSueloDentro ? offsetDepthTraseroDentro : actualDepth) -
                    (actualRetranquearSuelo ? actualRetranqueoTrasero - actualEspesor + (actualEspesor % 2) : 0)
            },
            techo: {
                width: actualTechoDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height: actualEspesor,
                depth: actualTechoDentro ? offsetDepthTraseroDentro : actualDepth
            },
            lateral: {
                width: actualEspesor,
                height: actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor) -
                    (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor : 0),
                depth: offsetDepthTraseroDentro
            },
            trasero: {
                width: actualTraseroDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height: actualHeight -
                    (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro ? 0 : actualEspesor) : actualEspesor) -
                    (actualTechoDentro ? (actualTechoDentro && !actualTraseroDentro ? 0 : actualEspesor) : actualEspesor),
                depth: actualEspesor
            }
        };
    };

    // Función para calcular las posiciones de cada parte del casco
    const calcularPosiciones = () => {
        const mitadAncho = actualWidth / 2;
        const mitadProfundidad = actualDepth / 2;
        const extraAltura = patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;
        const alturaLaterales = (actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor)) / 2 +
            (actualSueloDentro ? 0 : actualEspesor) -
            (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor / 2 : 0);

        return {
            suelo: [
                0,
                actualEspesor / 2 + extraAltura,
                (actualSueloDentro && !actualTraseroDentro ? actualEspesor / 2 : 0) + (actualRetranquearSuelo ? actualRetranqueoTrasero / 2 : 0)
            ] as [number, number, number],
            techo: [
                0,
                actualHeight - actualEspesor / 2 + extraAltura,
                (actualTechoDentro && actualEsquinaZTriangulada ? 0 : (actualTechoDentro && !actualTraseroDentro ? actualEspesor / 2 : 0)) -
                (actualEsquinaZTriangulada && actualTraseroDentro ? actualEspesor / 2 : 0)
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
                (actualHeight - (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro ? 0 : actualEspesor) : actualEspesor) -
                    (actualTechoDentro ? (actualTechoDentro && !actualTraseroDentro ? 0 : actualEspesor) : actualEspesor)) / 2 +
                (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro ? 0 : actualEspesor) : actualEspesor) + extraAltura,
                -mitadProfundidad + actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero : 0)
            ] as [number, number, number],
            puerta: [
                actualWidth / 2,
                (actualHeight - actualEspesor - actualEspesor) / 2 + actualEspesor + extraAltura,
                actualDepth / 2 + actualEspesor / 2
            ] as [number, number, number]
        };
    };

    const dimensiones = calcularDimensiones();
    const posiciones = calcularPosiciones();

    // Posición base del grupo (se puede ajustar si se requiere mover el grupo completo)
    const adjustedPosition: [number, number, number] = [position[0], position[1], position[2]];

    // Renderizar el portal de la interfaz
    const renderInterface = () => {
        if (showInterface) {
            const interfaceContainer = document.getElementById('interfaz');
            if (interfaceContainer) {
                return ReactDOM.createPortal(
                    <CascoInterface
                        show={showInterface}
                        mode={interfaceMode}
                        setMode={setInterfaceMode}
                        setShow={setShowInterface}
                    />,
                    interfaceContainer
                );
            }
        }
        return null;
    };

    return (
        <>
            <group ref={groupRef} position={adjustedPosition} rotation={rotation}>
                {/* Caja inferior (suelo) */}
                <Pieza
                    parentRef={groupRef}
                    espesorBase={actualEspesor}
                    position={posiciones.suelo}
                    width={dimensiones.suelo.width}
                    height={dimensiones.suelo.height}
                    depth={dimensiones.suelo.depth}
                    material={materiales.OakWood}
                    posicionCaja="bottom"
                    bordesTriangulados={actualEsquinaXTriangulada}
                    bordeEjeY={false}
                />

                {/* Caja lado izquierdo */}
                <Pieza
                    parentRef={groupRef}
                    espesorBase={actualEspesor}
                    position={posiciones.izquierda}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.DarkWood}
                    posicionCaja="left"
                    bordesTriangulados={actualEsquinaXTriangulada}
                />

                {/* Caja lado derecho */}
                <Pieza
                    parentRef={groupRef}
                    espesorBase={actualEspesor}
                    position={posiciones.derecha}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.DarkWood}
                    posicionCaja="right"
                    bordesTriangulados={actualEsquinaXTriangulada}
                />

                {/* Caja detrás */}
                <Pieza
                    parentRef={groupRef}
                    espesorBase={actualEspesor}
                    position={posiciones.trasero}
                    width={dimensiones.trasero.width}
                    height={dimensiones.trasero.height}
                    depth={dimensiones.trasero.depth}
                    material={materiales.DarkWood}
                    bordesTriangulados={false}
                />

                {/* Caja superior (techo) */}
                <Pieza
                    parentRef={groupRef}
                    espesorBase={actualEspesor}
                    position={posiciones.techo}
                    width={dimensiones.techo.width}
                    height={dimensiones.techo.height}
                    depth={dimensiones.techo.depth}
                    material={materiales.OakWood}
                    posicionCaja="top"
                    bordesTriangulados={actualEsquinaXTriangulada || actualEsquinaZTriangulada}
                    bordeEjeY={false}
                    bordeEjeZ={actualEsquinaZTriangulada}
                    disableAdjustedWidth={actualEsquinaZTriangulada || (actualEsquinaZTriangulada && actualEsquinaXTriangulada)}
                />

                {/* Renderizar 4 patas en las esquinas si están definidas */}
                {patas && indiceActualPata !== -1 && patas[indiceActualPata] && (
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

                {/* Renderizar puerta en la parte frontal, con pivote derecho y (si corresponde) izquierdo */}
                {puertas && indiceActualPuerta !== -1 && (
                    <>
                        {React.cloneElement(puertas[indiceActualPuerta], {
                            position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                            width: actualWidth > 2 ? actualWidth / 2 : actualWidth,
                            height: actualHeight,
                            depth: actualEspesor,
                            pivot: "right" // Pivote en el borde derecho
                        })}
                        {actualWidth > 2 && (<>
                            {React.cloneElement(puertas[indiceActualPuerta], {
                                position: [-posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                                width: actualWidth / 2,
                                height: actualHeight,
                                depth: actualEspesor,
                                pivot: "left"
                            })}
                        </>)}
                    </>)}
            </group>
            {renderInterface()}
        </>
    );
};

export default Casco;