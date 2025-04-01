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
}

// Componente principal Casco
const Casco: React.FC<CascoProps> = ({
                                         width = 2,
                                         height = 2,
                                         depth = 2,
                                         espesor = 0.1,
                                         position = [0, 0, 0],
                                         rotation = [0, 0, 0],
                                         sueloDentro = false,
                                         techoDentro = false,
                                         traseroDentro = false
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
                height: height - (sueloDentro ? 0 : espesor) - (techoDentro ? 0 : espesor),
                // Si trasero no está dentro, se expande completamente en profundidad
                depth: !traseroDentro ? depth - (espesor) : depth
            },
            trasero: {
                // Si trasero no está dentro, se expande completamente en ancho
                width: traseroDentro ? width - (espesor * 2) : width,
                // Si el suelo está fuera, no expandir hacia abajo; si el techo está fuera, no expandir hacia arriba
                height: height - (sueloDentro ? (sueloDentro && !traseroDentro) ? 0  : espesor : espesor) - (techoDentro ? (techoDentro && !traseroDentro) ? 0  : espesor : espesor),
                depth: espesor
            }
        };
    };

    // Calcular posiciones para que el casco crezca hacia arriba
    const calcularPosiciones = () => {
        const mitadAncho = width / 2;
        const mitadProfundidad = depth / 2;

        return {
            suelo: [
                0,
                espesor / 2,
                sueloDentro && !traseroDentro ? espesor / 2 : 0
            ] as [number, number, number],

            techo: [
                0,
                height - espesor / 2,
                techoDentro && !traseroDentro ? espesor / 2 : 0
            ] as [number, number, number],

            izquierda: [
                -mitadAncho + espesor / 2,
                (height - (sueloDentro ? 0 : espesor) - (techoDentro ? 0 : espesor)) / 2 + (sueloDentro ? 0 : espesor),
                !traseroDentro ? espesor / 2 : 0
            ] as [number, number, number],

            derecha: [
                mitadAncho - espesor / 2,
                (height - (sueloDentro ? 0 : espesor) - (techoDentro ? 0 : espesor)) / 2 + (sueloDentro ? 0 : espesor),
                !traseroDentro ? espesor / 2 : 0
            ] as [number, number, number],

            trasero: [
                0,
                (height - (sueloDentro ? (sueloDentro && !traseroDentro) ? 0  : espesor : espesor) - (techoDentro ? (techoDentro && !traseroDentro) ? 0  : espesor : espesor)) / 2 + (sueloDentro ? (sueloDentro && !traseroDentro) ? 0  : espesor : espesor),
                -mitadProfundidad + espesor / 2
            ] as [number, number, number]
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
                position={posiciones.suelo}
                width={dimensiones.suelo.width}
                height={dimensiones.suelo.height}
                depth={dimensiones.suelo.depth}
                color="#ff0000"
            />

            {/* Caja lado izquierdo */}
            <Caja
                position={posiciones.izquierda}
                width={dimensiones.lateral.width}
                height={dimensiones.lateral.height}
                depth={dimensiones.lateral.depth}
                color="#0000ff"
            />

            {/* Caja lado derecho */}
            <Caja
                position={posiciones.derecha}
                width={dimensiones.lateral.width}
                height={dimensiones.lateral.height}
                depth={dimensiones.lateral.depth}
                color="#0000ff"
            />

            {/* Caja detrás */}
            <Caja
                position={posiciones.trasero}
                width={dimensiones.trasero.width}
                height={dimensiones.trasero.height}
                depth={dimensiones.trasero.depth}
                color="#ffff00"
            />

            {/* Caja arriba (techo) */}
            <Caja
                position={posiciones.techo}
                width={dimensiones.techo.width}
                height={dimensiones.techo.height}
                depth={dimensiones.techo.depth}
                color="#ff0000"
            />
        </group>
    );
};

export default Casco;