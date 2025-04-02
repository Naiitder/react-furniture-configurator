import * as React from "react";
import {useRef} from "react";
import * as THREE from 'three';
import Caja from "./Caja";

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
                                         puerta
                                     }) => {
    const groupRef = useRef<THREE.Group>(null);

    // Calcular dimensiones ajustadas para evitar solapamientos
    const calcularDimensiones = () => {
        return {
            suelo: {
                width: sueloDentro ? width - (espesor * 2) : width,
                height: espesor,
                depth: sueloDentro ? traseroDentro ? depth : depth - (espesor) : depth
            },
            techo: {
                width: techoDentro ? width - (espesor * 2) : width,
                height: espesor,
                depth: techoDentro ? traseroDentro ? depth : depth - (espesor) : depth
            },
            lateral: {
                width: espesor,
                // Si el suelo está fuera, no expandir hacia abajo; si el techo está fuera, no expandir hacia arriba
                height: height - (sueloDentro ? 0 : espesor) - (techoDentro ? 0 : espesor) - (esquinaZTriangulada && esquinaXTriangulada ? espesor : 0),
                // Si trasero no está dentro, se expande completamente en profundidad
                depth: !traseroDentro ? depth - (espesor) : depth
            },
            trasero: {
                // Si trasero no está dentro, se expande completamente en ancho
                width: traseroDentro ? width - (espesor * 2) : width,
                // Si el suelo está fuera, no expandir hacia abajo; si el techo está fuera, no expandir hacia arriba
                height: height - (sueloDentro ? (sueloDentro && !traseroDentro) ? 0 : espesor : espesor) - (techoDentro ? (techoDentro && !traseroDentro) ? 0 : espesor : espesor),
                depth: espesor
            }
        };
    };

    // Calcular posiciones para que el casco crezca hacia arriba
    const calcularPosiciones = () => {
        const mitadAncho = width / 2;
        const mitadProfundidad = depth / 2;

        const extraAltura = pata ? pata.props.height - espesor * 5 : 0;
        console.log(pata.props.height)

        return {
            suelo: [
                0,
                (espesor / 2) + extraAltura,
                sueloDentro && !traseroDentro ? espesor / 2 : 0
            ] as [number, number, number],

            techo: [
                0,
                (height - espesor / 2) + extraAltura,
                (techoDentro && esquinaZTriangulada ? 0 : (techoDentro && !traseroDentro) ? espesor / 2 : 0) - (esquinaZTriangulada && traseroDentro ? espesor / 2 : 0)
            ] as [number, number, number],

            izquierda: [
                -mitadAncho + espesor / 2,
                (height - (sueloDentro ? 0 : espesor) - (techoDentro ? 0 : espesor)) / 2 + (sueloDentro ? 0 : espesor) - (esquinaZTriangulada && esquinaXTriangulada ? espesor / 2 : 0) + extraAltura,
                !traseroDentro ? espesor / 2 : 0
            ] as [number, number, number],

            derecha: [
                mitadAncho - espesor / 2,
                (height - (sueloDentro ? 0 : espesor) - (techoDentro ? 0 : espesor)) / 2 + (sueloDentro ? 0 : espesor) - (esquinaZTriangulada && esquinaXTriangulada ? espesor / 2 : 0) + extraAltura,
                !traseroDentro ? espesor / 2 : 0
            ] as [number, number, number],

            trasero: [
                0,
                (height - (sueloDentro ? (sueloDentro && !traseroDentro) ? 0 : espesor : espesor) - (techoDentro ? (techoDentro && !traseroDentro) ? 0 : espesor : espesor)) / 2 + (sueloDentro ? (sueloDentro && !traseroDentro) ? 0 : espesor : espesor) + extraAltura,
                (-mitadProfundidad + espesor / 2) + (traseroDentro ? offsetTrasero : 0)
            ] as [number, number, number],

            puerta: [
                width / 2,
                (height - espesor - espesor) / 2 + espesor + extraAltura,
                (depth / 2) + espesor / 2] as [number, number, number]
        };
    };

    const dimensiones = calcularDimensiones();
    const posiciones = calcularPosiciones();

    // Ajustamos la posición base del grupo para que el fondo esté en la posición Y especificada
    const adjustedPosition: [number, number, number] = [
        position[0],
        position[1], // Ya no necesitamos restar mitad de altura porque el origen está en la base
        position[2]
    ];

    return (
        <group ref={groupRef} position={adjustedPosition} rotation={rotation}>
            {/* Caja inferior (suelo) */}
            <Caja
                espesorBase={espesor}
                position={posiciones.suelo}
                width={dimensiones.suelo.width}
                height={dimensiones.suelo.height}
                depth={dimensiones.suelo.depth}
                color="#ff0000"
                posicionCaja={"bottom"}
                bordesTriangulados={esquinaXTriangulada}
                bordeEjeY={false}
            />

            {/* Caja lado izquierdo */}
            <Caja
                espesorBase={espesor}
                position={posiciones.izquierda}
                width={dimensiones.lateral.width}
                height={dimensiones.lateral.height}
                depth={dimensiones.lateral.depth}
                color="#0000ff"
                posicionCaja={"left"}
                bordesTriangulados={esquinaXTriangulada}
            />

            {/* Caja lado derecho */}
            <Caja
                espesorBase={espesor}
                position={posiciones.derecha}
                width={dimensiones.lateral.width}
                height={dimensiones.lateral.height}
                depth={dimensiones.lateral.depth}
                color="#0000ff"
                posicionCaja={"right"}
                bordesTriangulados={esquinaXTriangulada}
            />

            {/* Caja detrás */}
            <Caja
                espesorBase={espesor}
                position={posiciones.trasero}
                width={dimensiones.trasero.width}
                height={dimensiones.trasero.height}
                depth={dimensiones.trasero.depth}
                color="#ffff00"
                bordesTriangulados={false}
            />

            {/* Caja arriba (techo) */}
            <Caja
                espesorBase={espesor}
                position={posiciones.techo}
                width={dimensiones.techo.width}
                height={dimensiones.techo.height}
                depth={dimensiones.techo.depth}
                color="#ff0000"
                posicionCaja={"top"}
                bordesTriangulados={esquinaXTriangulada || esquinaZTriangulada}
                bordeEjeY={false}
                bordeEjeZ={esquinaZTriangulada}
                disableAdjustedWidth={esquinaZTriangulada && esquinaXTriangulada}
            />

            {/* Renderizar 4 patas en las esquinas */}
            {pata &&
                <>
                    {React.cloneElement(pata, {position: [-width / 2 + 0.1, -0.5, -depth / 2 + 0.1]})}
                    {React.cloneElement(pata, {position: [width / 2 - 0.1, -0.5, -depth / 2 + 0.1]})}
                    {React.cloneElement(pata, {position: [-width / 2 + 0.1, -0.5, depth / 2 - 0.1]})}
                    {React.cloneElement(pata, {position: [width / 2 - 0.1, -0.5, depth / 2 - 0.1]})}
                </>
            }

            {/* Renderizar puerta en la parte frontal */}
            {puerta && (
                <>
                    {React.cloneElement(puerta, {
                        position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                        width: width > 2 ? width / 2 : width,
                        height: height,
                        depth: espesor,
                        pivot: "right" // Define el pivote en el borde derecho
                    })}

                    {width > 2 && (
                        <>
                            {React.cloneElement(puerta, {
                                position: [-posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                                width: width / 2,
                                height: height,
                                depth: espesor,
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