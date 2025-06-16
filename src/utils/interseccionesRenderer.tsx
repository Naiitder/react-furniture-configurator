import * as React from "react";
import InterseccionMueble, { Orientacion, Posicion } from "../components/Interseccion";
import Tabla from "../components/Casco/Tabla";

type RenderInterArgs = {
    intersecciones: InterseccionMueble[];
    dimensiones: {
        width: number;
        height: number;
        depth: number;
        espesor: number;
        retranqueoTrasero?: number;
        extraAltura?: number;
        traseroDentro?: boolean;
    };
    refs: {
        groupRef: React.MutableRefObject<any>;
        detectionBoxRef: React.MutableRefObject<any>;
    };
    materiales: Record<string, any>;
};

export const renderIntersecciones = ({
                                                 intersecciones,
                                                 dimensiones: {
                                                     width = 0,
                                                     height = 0,
                                                     depth = 0,
                                                     espesor = 0,
                                                     retranqueoTrasero = 0,
                                                     extraAltura = 0,
                                                     traseroDentro = false,
                                                 },
                                                 refs: { groupRef, detectionBoxRef },
                                                 materiales,
                                             }: RenderInterArgs) => {
    // 1) Ordenar por fecha y luego por índice
    const sorted = intersecciones
        .map((inter, idx) => ({ inter, idx }))
        .sort((a, b) => {
            const tA = a.inter.createdAt.getTime();
            const tB = b.inter.createdAt.getTime();
            if (tA !== tB) return tA - tB;
            return a.idx - b.idx;
        })
        .map(x => x.inter);

    // Extras: mismo getVerticalRange y computeHorizontalRange de antes...
    const getVerticalRange = (vertical, verticalIndex) => {
        const x = (vertical.position.x - 0.5) * width;
        let topY = extraAltura + height - espesor;
        let botY = extraAltura + espesor;

        // Buscamos horizontales anteriores o CON LA MISMA FECHA que recorten esta vertical
        for (let i = 0; i < verticalIndex; i++) {
            const h = sorted[i];
            if (h.orientation === Orientacion.Horizontal) {
                const horizontalTime = h.createdAt.getTime();
                const verticalTime = vertical.createdAt.getTime();

                if (horizontalTime <= verticalTime) {
                    // Calculamos el rango horizontal de esta horizontal
                    const hx = (h.position.x - 0.5) * width;
                    let leftX = -width / 2;
                    let rightX = width / 2;

                    // Buscamos verticales que limiten esta horizontal
                    let isBlocked = false;
                    for (let j = 0; j < i; j++) {
                        const v = sorted[j];
                        if (v.orientation === Orientacion.Vertical) {
                            const vx = (v.position.x - 0.5) * width;
                            const hy = h.position.y * height + extraAltura;
                            const [vBotY, vTopY] = getVerticalRange(v, j);
                            const mismoEspacioEnY = hy >= vBotY - espesor / 2 && hy <= vTopY + espesor / 2;

                            if (mismoEspacioEnY) {
                                if ((vx < hx && vx > x && x < hx) || (vx > hx && vx < x && x > hx)) {
                                    isBlocked = true;
                                    break;
                                }
                                if (vx < hx && vx > leftX) leftX = vx;
                                if (vx > hx && vx < rightX) rightX = vx;
                            }
                        }
                    }

                    if (isBlocked) {
                        continue;
                    }

                    leftX += espesor / 2;
                    rightX -= espesor / 2;

                    if (x >= leftX && x <= rightX) {
                        const hy = h.position.y * height + extraAltura;
                        const verticalY = vertical.position.y * height + extraAltura;

                        if (Math.abs(hy - verticalY) <= espesor / 2) {
                            if (hy > verticalY) {
                                topY = Math.min(topY, hy - espesor / 2);
                            } else {
                                botY = Math.max(botY, hy - espesor / 2);
                            }
                        } else if (hy > verticalY) {
                            topY = Math.min(topY, hy - espesor / 2);
                        } else {
                            botY = Math.max(botY, hy + espesor / 2);
                        }
                    }
                }
            }
        }

        return [botY, topY];
    };

    // Helper: devuelve [leftX, rightX] de una horizontal
    const computeHorizontalRange = (h, horizontalIndex) => {
        const hx = (h.position.x - 0.5) * width;
        const hy = h.position.y * height + extraAltura;
        let leftX = -width / 2;
        let rightX = width / 2;

        let exactMatchVertical = null;
        let exactMatchVerticalIndex = -1;

        for (let i = 0; i < horizontalIndex; i++) {
            const v = sorted[i];

            if (v.orientation === Orientacion.Vertical) {
                const verticalTime = v.createdAt.getTime();
                const horizontalTime = h.createdAt.getTime();

                if (verticalTime <= horizontalTime) {
                    const vx = (v.position.x - 0.5) * width;
                    const [vBotY, vTopY] = getVerticalRange(v, i);
                    const mismoEspacioEnY = hy >= vBotY - espesor / 2 && hy <= vTopY + espesor / 2;

                    if (mismoEspacioEnY) {
                        if (Math.abs(vx - hx) < 0.001) {
                            exactMatchVertical = v;
                            exactMatchVerticalIndex = i;
                        } else if (vx < hx && vx > leftX) {
                            leftX = vx;
                        } else if (vx > hx && vx < rightX) {
                            rightX = vx;
                        }
                    }
                }
            }
        }

        leftX += espesor / 2;
        rightX -= espesor / 2;

        if (exactMatchVertical !== null) {
            const espacioIzquierda = hx - leftX;
            const espacioDerecha = rightX - hx;
            const vx = (exactMatchVertical.position.x - 0.5) * width;

            if (espacioIzquierda >= espacioDerecha) {
                rightX = vx - espesor / 2;
            } else {
                leftX = vx + espesor / 2;
            }
        }

        return [leftX, rightX];
    };


    return sorted.map((inter, idx) => {
        // **Aquí** leemos del userData la posición extra (si existe)
        const { positionExtra } = (inter as any).userData || {};
        // Si no hay override, usamos la posición original:
        const pos: Posicion = positionExtra ?? inter.position;

        // Calculamos x,y,z con pos
        const x0 = (pos.x - 0.5) * width;
        const y0 = pos.y * height + extraAltura;
        const z0 = espesor / 2 + (traseroDentro ? retranqueoTrasero / 2 : 0);

        if (inter.orientation === Orientacion.Horizontal) {
            const [l, r] = computeHorizontalRange(inter, idx);
            const wSeg = r - l;
            const cx = (l + r) / 2;

            return (
                <Tabla
                    key={`h-int-${idx}`}
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    shape="box"
                    position={[cx, y0, z0]}
                    width={wSeg}
                    height={espesor}
                    depth={depth - retranqueoTrasero - espesor}
                    material={inter.previsualization ? materiales.Vidrio : materiales.Artico}
                    espesorBase={espesor}
                    isInterseccion
                    piezasAdyacientesData={
                        inter.piezasAdyacientes
                            // 1) quitamos null/undefined
                            ?.filter((pm): pm is NonNullable<typeof pm> => pm != null)
                            // 2) luego mapeamos
                            .map(pm => ({
                                position: pm.position,
                                orientation: pm.orientation,
                                createdAt: pm.createdAt.getTime(),
                            }))
                        ?? []
                    }
                    piezasLimitantesData={
                        inter.piezasLimitantes
                            ?.filter((pl): pl is NonNullable<typeof pl> => pl != null)
                            .map(pl => ({
                                position: pl.position,
                                orientation: pl.orientation,
                                createdAt: pl.createdAt.getTime(),
                            }))
                        ?? []
                    }
                />
            );
        } else {
            const [bY, tY] = getVerticalRange(inter, idx);
            const hSeg = tY - bY;
            const cy = (bY + tY) / 2;
            if (hSeg <= 0) return null;

            return (
                <Tabla
                    key={`v-int-${idx}`}
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    shape="box"
                    position={[x0, cy, z0]}
                    width={espesor}
                    height={hSeg}
                    depth={depth - retranqueoTrasero - espesor}
                    material={inter.previsualization ? materiales.Vidrio : materiales.Artico}
                    espesorBase={espesor}
                    isInterseccion
                    piezasAdyacientesData={
                        inter.piezasAdyacientes
                            // 1) quitamos null/undefined
                            ?.filter((pm): pm is NonNullable<typeof pm> => pm != null)
                            // 2) luego mapeamos
                            .map(pm => ({
                                position: pm.position,
                                orientation: pm.orientation,
                                createdAt: pm.createdAt.getTime(),
                            }))
                        ?? []
                    }
                    piezasLimitantesData={
                        inter.piezasLimitantes
                            ?.filter((pl): pl is NonNullable<typeof pl> => pl != null)
                            .map(pl => ({
                                position: pl.position,
                                orientation: pl.orientation,
                                createdAt: pl.createdAt.getTime(),
                            }))
                        ?? []
                    }
                />
            );
        }
    });
};