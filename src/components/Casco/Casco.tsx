import * as React from "react";
import {useRef, useEffect} from "react";
import * as THREE from 'three';
import Caja from "./Caja";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";

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
    offsetTrasero?: number;
    esquinaXTriangulada?: boolean;
    esquinaZTriangulada?: boolean;
    pata?: React.ReactNode;
    alturaPatas?: number;
    puerta?: React.ReactNode;
}

// Componente principal Casco
const Casco: React.FC<CascoProps> = ({
                                         width = 2,
                                         height = 2,
                                         depth = 2,
                                         espesor = 0.1,
                                         position = [0, 0, 0],
                                         rotation = [0, 0, 0],
                                         offsetTrasero = 0,
                                         sueloDentro = false,
                                         techoDentro = false,
                                         traseroDentro = false,
                                         esquinaXTriangulada = false,
                                         esquinaZTriangulada = false,
                                         pata,
                                         alturaPatas = 1,
                                         puerta
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
    const actualWidth = ref?.width || width;
    const actualHeight = ref?.height || height;
    const actualDepth = ref?.depth || depth;
    const actualEspesor = ref?.espesor || espesor;
    const actualOffsetTrasero = ref?.offsetTrasero ?? offsetTrasero;
    const actualSueloDentro = ref?.sueloDentro ?? sueloDentro;
    const actualTechoDentro = ref?.techoDentro ?? techoDentro;
    const actualTraseroDentro = ref?.traseroDentro ?? traseroDentro;
    const actualEsquinaXTriangulada = ref?.esquinaXTriangulada ?? esquinaXTriangulada;
    const actualEsquinaZTriangulada = ref?.esquinaZTriangulada ?? esquinaZTriangulada;

    // Calcular dimensiones ajustadas para evitar solapamientos
    const calcularDimensiones = () => {
        return {
            suelo: {
                width: actualSueloDentro ? actualWidth - (actualEspesor * 2) : actualWidth,
                height: actualEspesor,
                depth: actualSueloDentro ? actualTraseroDentro ? actualDepth : actualDepth - (actualEspesor) : actualDepth
            },
            techo: {
                width: actualTechoDentro ? actualWidth - (actualEspesor * 2) : actualWidth,
                height: actualEspesor,
                depth: actualTechoDentro ? actualTraseroDentro ? actualDepth : actualDepth - (actualEspesor) : actualDepth
            },
            lateral: {
                width: actualEspesor,
                height: actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor) - (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor : 0),
                depth: !actualTraseroDentro ? actualDepth - (actualEspesor) : actualDepth
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

        const extraAltura = pata ? (pata.props.height / 2.3) : 0;

        const alturaLaterales = (actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor)) / 2 + (actualSueloDentro ? 0 : actualEspesor) - (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor / 2 : 0)

        return {
            suelo: [
                0,
                (actualEspesor / 2) + extraAltura,
                actualSueloDentro && !actualTraseroDentro ? actualEspesor / 2 : 0
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
                (-mitadProfundidad + actualEspesor / 2) + (actualTraseroDentro ? actualOffsetTrasero : 0)
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

    return (
        <group ref={groupRef} position={adjustedPosition} rotation={rotation}>
            {/* Caja inferior (suelo) */}
            <Caja
                espesorBase={actualEspesor}
                position={posiciones.suelo}
                width={dimensiones.suelo.width}
                height={dimensiones.suelo.height}
                depth={dimensiones.suelo.depth}
                color="#ff0000"
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
                color="#0000ff"
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
                color="#0000ff"
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
                color="#ffff00"
                bordesTriangulados={false}
            />

            {/* Caja arriba (techo) */}
            <Caja
                espesorBase={actualEspesor}
                position={posiciones.techo}
                width={dimensiones.techo.width}
                height={dimensiones.techo.height}
                depth={dimensiones.techo.depth}
                color="#ff0000"
                posicionCaja={"top"}
                bordesTriangulados={actualEsquinaXTriangulada || actualEsquinaZTriangulada}
                bordeEjeY={false}
                bordeEjeZ={actualEsquinaZTriangulada}
                disableAdjustedWidth={actualEsquinaZTriangulada || (actualEsquinaZTriangulada && actualEsquinaXTriangulada)}
            />

            {/* Renderizar 4 patas en las esquinas */}
            {pata &&
                <>
                    {React.cloneElement(pata, {position: [-actualWidth / 2 + 0.1, -0.5, -actualDepth / 2 + 0.1]})}
                    {React.cloneElement(pata, {position: [actualWidth / 2 - 0.1, -0.5, -actualDepth / 2 + 0.1]})}
                    {React.cloneElement(pata, {position: [-actualWidth / 2 + 0.1, -0.5, actualDepth / 2 - 0.1]})}
                    {React.cloneElement(pata, {position: [actualWidth / 2 - 0.1, -0.5, actualDepth / 2 - 0.1]})}
                </>
            }

            {/* Renderizar puerta en la parte frontal */}
            {puerta && (
                <>
                    {React.cloneElement(puerta, {
                        position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                        width: actualWidth > 2 ? actualWidth / 2 : actualWidth,
                        height: actualHeight,
                        depth: actualEspesor,
                        pivot: "right" // Define el pivote en el borde derecho
                    })}

                    {actualWidth > 2 && (
                        <>
                            {React.cloneElement(puerta, {
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
        </group>
    );
};

export default Casco;