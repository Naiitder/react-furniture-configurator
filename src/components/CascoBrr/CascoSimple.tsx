import * as React from "react";
import {useEffect, useRef, useState} from "react";
import Tablon from "./Tablon";
import * as THREE from "three";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider"

type CascoSimpleProps = {
    id: string;
    position?: [number, number, number];
    isSelected: boolean;
    espesor: number;
    ancho: number;
    profundidad: number;
    altura: number;
    onClick: () => void;
    version: number;
};

export default function CascoSimple({
                                        position = [0, 0, 0],
                                        isSelected,
                                        onClick,
                                        espesor,
                                        ancho,
                                        profundidad,
                                        altura,
                                        version,
                                    }: CascoSimpleProps) {
    const groupRef = useRef<THREE.Group>(null);
    const { setRefItem, refItem } = useSelectedItemProvider();

    const [actualEspesor, setActualEspesor] = useState(espesor);
    const [actualAncho, setActualAncho] = useState(ancho);
    const [actualProfundidad, setActualProfundidad] = useState(profundidad);
    const [actualAltura, setActualAltura] = useState(altura);

    const alturaInterna = actualAltura - actualEspesor * 2;
    const centroY = actualEspesor + alturaInterna / 2;


    useEffect(() => {
        console.log("Recalculando desde useEffect porque version cambió");
        if (!refItem?.current?.userData || !groupRef?.current?.userData) return;
        if (refItem?.current?.uuid !== groupRef?.current?.uuid) return;

        const userData = refItem.current.userData;

        setActualEspesor(userData.espesor || actualEspesor);
        setActualAncho(userData.ancho || actualAncho);
        setActualProfundidad(userData.profundidad || actualProfundidad);
        setActualAltura(userData.altura || actualAltura);
    }, [version]);

    return (
        <group
            ref={groupRef}
            position={position}
            onPointerDown={(e) => {
                e.stopPropagation();
                onClick();

                if (groupRef.current) {
                    groupRef.current.userData = {
                        espesor: actualEspesor,
                        ancho: actualAncho,
                        profundidad: actualProfundidad,
                        altura: actualAltura,
                    };
                    setRefItem({ current: groupRef.current });
                }
            }}
        >
            {/* Tableros */}
            <Tablon nombre="suelo" width={actualAncho} height={actualEspesor} depth={actualProfundidad} position={[0, actualEspesor / 2, 0]} color={isSelected ? "#00ff00" : "#deb887"}  />
            <Tablon nombre="techo" width={actualAncho} height={actualEspesor} depth={actualProfundidad} position={[0, actualAltura - actualEspesor / 2, 0]} color={isSelected ? "#00ff00" : "#deb887"} />
            <Tablon nombre="izquierda" width={actualEspesor} height={alturaInterna} depth={actualProfundidad} position={[(actualAncho - actualEspesor) / 2, centroY, 0]} color={isSelected ? "#00ff00" : "#ae9292"} />
            <Tablon nombre="derecha" width={actualEspesor} height={alturaInterna} depth={actualProfundidad} position={[-(actualAncho - actualEspesor) / 2, centroY, 0]} color={isSelected ? "#00ff00" : "#ae9292"} />
            <Tablon nombre="trasero" width={actualAncho - actualEspesor * 2} height={alturaInterna} depth={actualEspesor} position={[0, centroY, (actualProfundidad - actualEspesor) / 2]} color={isSelected ? "#00ff00" : "#c5e07a"} />

        </group>
    );
}
