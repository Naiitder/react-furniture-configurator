import * as React from "react";
import InterseccionMueble, { Orientacion } from "../components/Interseccion";
import InterseccionTabla from "../components/Casco/InterseccionTabla";

export const renderIntersecciones = ({
                                         intersecciones = [],
                                         dimensiones = {},
                                         refs = {},
                                         materiales = {},
                                         extraProps = {},
                                     }: {
    intersecciones: InterseccionMueble[];
    dimensiones: {
        width: number;
        height: number;
        depth: number;
        espesor: number;
        retranqueoTrasero: number;
        extraAltura: number;
        traseroDentro: boolean;
    };
    refs: {
        groupRef: React.MutableRefObject<any>;
        detectionBoxRef: React.MutableRefObject<any>;
    };
    materiales: any;
    extraProps?: { boundsKey?: string | number };
}) => {
    const {
        width = 0,
        height = 0,
        depth = 0,
        espesor = 0,
        retranqueoTrasero = 0,
        extraAltura = 0,
        traseroDentro = false,
    } = dimensiones as any;

    const { groupRef = { current: null }, detectionBoxRef = { current: null } } = refs as any;

    // Orden estable por fecha de creación y, en empate, por índice original
    const sorted = intersecciones
        .map((inter, idx) => ({ inter, idx }))
        .sort((a, b) => {
            const ta = a.inter.createdAt.getTime();
            const tb = b.inter.createdAt.getTime();
            return ta !== tb ? ta - tb : a.idx - b.idx;
        })
        .map((o) => o.inter);

    return sorted.map((inter: InterseccionMueble, i: number) => {
        const isHorizontal = inter.orientation === Orientacion.Horizontal;

        // Posición base (x/y en coords locales del Casco)
        const x = (inter.position.x - 0.5) * width; // uv.x -> [-0.5..0.5] * width
        const y = inter.position.y * height + extraAltura; // uv.y * height + altura patas
        const z = espesor / 2 + (traseroDentro ? retranqueoTrasero / 2 : 0);

        return (
            <InterseccionTabla
                key={`int-${i}`}
                parentRef={groupRef}
                insideRef={detectionBoxRef}
                position={[x, y, z]}
                // Dimensiones "semilla". El wrapper recalculará width/height exactos.
                width={isHorizontal ? width : espesor}
                height={isHorizontal ? espesor : height}
                depth={depth - retranqueoTrasero - espesor}
                material={inter.previsualization ? materiales.Vidrio : materiales.Artico}
                espesorBase={espesor}
                // Estas props solo afectan a decorados y a userData.rayOrientation de las TABLAS normales
                posicionCaja={isHorizontal ? "top" : "left"}
                bordeEjeY={true}
                bordeEjeZ={false}
                orientacionBordeZ="front"
                disableAdjustedWidth
                stopPropagation
                orientation={isHorizontal ? "horizontal" : "vertical"}
                boundsKey={extraProps?.boundsKey}
                uv={{ x: inter.position.x, y: inter.position.y }}
                interseccion={inter}
            />
        );
    });
};
