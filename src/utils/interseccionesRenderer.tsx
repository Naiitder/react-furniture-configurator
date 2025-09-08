import * as React from "react";
import InterseccionMueble, {Orientacion} from "../components/Interseccion";
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

    const {groupRef = {current: null}, detectionBoxRef = {current: null}} = refs;

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

    return sorted.map((inter: InterseccionMueble, idx) => {
        const x = (inter.position.x - 0.5) * width;
        const y = inter.position.y * height + extraAltura;

        const isHorizontal = inter.orientation === Orientacion.Horizontal;

        return (
            <React.Fragment key={`int-${idx}`}>
                <Tabla
                    parentRef={groupRef}
                    insideRef={detectionBoxRef}
                    shape="box"
                    position={[
                        x,
                        y,
                        espesor / 2 + (traseroDentro ? retranqueoTrasero / 2 : 0),
                    ]}
                    interseccion={inter}
                    width={isHorizontal ? width : espesor}
                    height={isHorizontal ? espesor : height}
                    depth={depth - retranqueoTrasero - espesor}
                    material={inter.previsualization ? materiales.Vidrio : materiales.Artico}
                    espesorBase={espesor}
                    isInterseccion={true}
                    orientation={isHorizontal ? "horizontal" : "vertical"}
                />
            </React.Fragment>
        );

    });
};