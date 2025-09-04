import * as React from "react";
import InterseccionMueble, { Orientacion } from "../components/Interseccion";
import Tabla from "../components/Casco/Tabla";

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

    return sorted.map((inter: InterseccionMueble, idx) => {
        const x = (inter.position.x - 0.5) * width;
        const y = inter.position.y * height + extraAltura;
        console.log(inter);
        const leftX = inter.adyacentLeft?.position.x ?? (-width / 2 + espesor / 2);
        const rightX = inter.adyacentRight?.position.x ?? (width / 2 - espesor / 2);
        const topY = inter.adyacentTop?.position.y ?? (height + extraAltura - espesor / 2);
        const botY = inter.adyacentBottom?.position.y ?? (extraAltura + espesor / 2);


        if (inter.orientation === Orientacion.Horizontal) {
            // ——————— BRANCH HORIZONTAL ———————
            const widthSeg = rightX - leftX;
            const centerX = (leftX + rightX) / 2;

            if (widthSeg <= 0) {
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
                            centerX,
                            y,
                            espesor / 2 +
                            (traseroDentro ? retranqueoTrasero / 2 : 0),
                        ]}
                        interseccion={inter}
                        width={widthSeg}
                        height={espesor}
                        depth={depth - retranqueoTrasero - espesor}
                        material={materiales.Artico}
                        espesorBase={espesor}
                        isInterseccion={true}
                        orientation={"horizontal"}
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
                        orientation={"horizontal"}
                        interseccion={inter}
                    />
                );
            }
        } else {
            // ——————— BRANCH VERTICAL ———————
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
                        orientation={"vertical"}
                        interseccion={inter}
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
                        orientation={"vertical"}
                        interseccion={inter}
                    />
                );
            }
        }
    });
};
