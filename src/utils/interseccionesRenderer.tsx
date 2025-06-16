import * as React from "react";
import InterseccionMueble, { Orientacion } from "../components/Interseccion";
import Tabla from "../components/Casco/Tabla";
import pata from "../components/Casco/Pata";

// TODO Arreglar DEPTH al expandir el mueble
export const renderIntersecciones = ({
    intersecciones = [],
    dimensiones = {},
    refs = {},
    materiales = {}
}) => {
    const {
        width = 0,
        height = 0,
        depth = 0,
        espesor = 0,
        retranqueoTrasero = 0,
        extraAltura = 0,
        traseroDentro = false,
    } = dimensiones;

    const { groupRef = { current: null }, detectionBoxRef = { current: null } } = refs;

    //console.log("renderIntersecciones", intersecciones);

    // 1) Ordenamos por fecha de creación y mantenemos el orden original si las fechas son iguales
    const withIndices = intersecciones.map((inter, idx) => ({inter, originalIndex: idx}));

    const sortedWithIndices = withIndices.sort((a, b) => {
        const timeA = a.inter.createdAt.getTime();
        const timeB = b.inter.createdAt.getTime();

        if (timeA !== timeB) {
            return timeA - timeB;
        }

        return a.originalIndex - b.originalIndex;
    });

    const sorted = sortedWithIndices.map(item => item.inter);

    // Función auxiliar: calcula el rango vertical real de una intersección vertical
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

    return sorted.map((inter: InterseccionMueble, idx) => {
        const x = (inter.position.x - 0.5) * width;
        const y = inter.position.y * height + extraAltura;

        if (inter.orientation === Orientacion.Horizontal) {
            // ——————— BRANCH HORIZONTAL ———————
            const [leftX, rightX] = computeHorizontalRange(inter, idx);
            const widthSeg = rightX - leftX;
            const centerX = (leftX + rightX) / 2;

            if(!inter.previsualization){
                return (
                    <Tabla
                        key={`int-${idx}`}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        shape="box"
                        position={[
                            centerX,
                            y,
                            espesor / 2 +
                            (traseroDentro ? retranqueoTrasero / 2 : 0),
                        ]}
                        width={widthSeg}
                        height={espesor}
                        depth={depth - retranqueoTrasero - espesor}
                        material={materiales.Artico}
                        espesorBase={espesor}
                        isInterseccion={true}
                    />
                );
            }
            else{
                return (
                    <Tabla
                        key={`int-${idx}`}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        shape="box"
                        position={[
                            centerX,
                            y,
                            espesor / 2 +
                            (traseroDentro ? retranqueoTrasero / 2 : 0),
                        ]}
                        width={widthSeg}
                        height={espesor}
                        depth={depth - retranqueoTrasero - espesor}
                        material={materiales.Vidrio}
                        espesorBase={espesor}
                        isInterseccion={true}
                    />
                );
            }
        } else {
            // ——————— BRANCH VERTICAL ———————
            const [botY, topY] = getVerticalRange(inter, idx);
            const heightSeg = topY - botY;
            const centerY = (topY + botY) / 2;

            if (heightSeg <= 0) {
                return null;
            }

            if(!inter.previsualization){
                return (
                    <Tabla
                        key={`int-${idx}`}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        shape="box"
                        position={[
                            x,
                            centerY,
                            espesor / 2 +
                            (traseroDentro ? retranqueoTrasero / 2 : 0),
                        ]}
                        width={espesor}
                        height={heightSeg}
                        depth={depth - retranqueoTrasero - espesor}
                        material={materiales.Artico}
                        espesorBase={espesor}
                        isInterseccion={true}
                    />
                );
            }
            else {
                return (
                    <Tabla
                        key={`int-${idx}`}
                        parentRef={groupRef}
                        insideRef={detectionBoxRef}
                        shape="box"
                        position={[
                            x,
                            centerY,
                            espesor / 2 +
                            (traseroDentro ? retranqueoTrasero / 2 : 0),
                        ]}
                        width={espesor}
                        height={heightSeg}
                        depth={depth - retranqueoTrasero - espesor}
                        material={materiales.Vidrio}
                        espesorBase={espesor}
                        isInterseccion={true}
                    />
                );
            }
        }
    });
};
