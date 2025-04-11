import * as React from "react";
import { useRef } from "react";
import Tablon from "./Tablon";
import * as THREE from "three";

type CascoSimpleProps = {
    id: string;
    position?: [number, number, number];
    isSelected: boolean;
    onClick: () => void;
};

export default function CascoSimple({
                                        position = [0, 0, 0],
                                        isSelected,
                                        onClick,
                                    }: CascoSimpleProps) {
    const groupRef = useRef<THREE.Group>(null);

    const espesor = 0.2;
    const ancho = 2;
    const profundidad = 2;

    const altura = 2;
    const alturaInterna = altura - espesor * 2;
    const centroY = espesor + alturaInterna / 2;

    return (
        <group ref={groupRef} position={position} onPointerDown={(e) => { e.stopPropagation(); onClick(); }}>
            {/* Suelo */}
            <Tablon
                nombre="suelo"
                width={ancho}
                height={espesor}
                depth={profundidad}
                position={[0, espesor / 2, 0]}
                color={isSelected ? "#00ff00" : "#deb887"}
            />
            {/* Techo */}
            <Tablon
                nombre="techo"
                width={ancho}
                height={espesor}
                depth={profundidad}
                position={[0, altura - espesor / 2, 0]}
                color={isSelected ? "#00ff00" : "#deb887"}
            />
            {/* Lateral Izquierda */}
            <Tablon
                nombre="izquierda"
                width={espesor}
                height={alturaInterna}
                depth={profundidad}
                position={[(ancho - espesor) / 2, centroY, 0]}
                color={isSelected ? "#00ff00" : "#ae9292"}
            />
            {/* Lateral Derecha */}
            <Tablon
                nombre="derecha"
                width={espesor}
                height={alturaInterna}
                depth={profundidad}
                position={[-(ancho - espesor) / 2, centroY, 0]}
                color={isSelected ? "#00ff00" : "#ae9292"}
            />
            {/* Trasero */}
            <Tablon
                nombre="trasero"
                width={ancho - espesor * 2}
                height={alturaInterna}
                depth={espesor}
                position={[0, centroY, (profundidad - espesor) / 2]}
                color={isSelected ? "#00ff00" : "#c5e07a"}
            />
        </group>
    );
}
