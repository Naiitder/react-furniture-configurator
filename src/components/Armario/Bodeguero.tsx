import * as React from "react";
import Casco from "../Casco/Casco";
import Tabla from "../Casco/Tabla";
import {useMaterial} from "../../assets/materials";

export type BodegueroProps = {
    width?: number;
    height?: number;
    depth?: number;
    espesor?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    sueloDentro?: boolean;
    techoDentro?: boolean;
    traseroDentro?: boolean;
    retranqueoTrasero?: number;
    retranquearSuelo?: boolean;
    esquinaXTriangulada?: boolean;
    esquinaZTriangulada?: boolean;
    patas?: React.ReactNode[];
    alturaPatas?: number;
    indicePata?: number;
    puertas?: React.ReactNode[];
    indicePuerta?: number;
    intersecciones?: any[];
    version?: any[];
    setVersion?: (version: any) => void;
    id?: string;
};

const Bodeguero = (props: BodegueroProps) => {
    const {
        width = 2.5,
        height = 2,
        depth = 2,
        espesor = 0.1,
        position = [0, 0, 0],
        rotation = [0, 0, 0],
        sueloDentro = false,
        techoDentro = true,
        traseroDentro = true,
        retranqueoTrasero = 0.1,
        retranquearSuelo = false,
        esquinaXTriangulada = false,
        esquinaZTriangulada = false,
        patas = [],
        alturaPatas = 0.2,
        indicePata = 1,
        puertas = [],
        indicePuerta = 0,
        intersecciones = [],
        version,
        setVersion,
        id,
    } = props;

    const materiales = useMaterial();

    const renderExtraParts = ({ localConfig, dimensiones, posiciones, materiales , parentRef}: { localConfig: any; dimensiones: any; posiciones: any; materiales: any , parentRef: any}) => {
        const actualWidth = localConfig.width || width;
        const actualHeight = localConfig.height || height;
        const actualDepth = localConfig.depth || depth;
        const actualEspesor = localConfig.espesor || espesor;
        const extraAltura = patas && indicePata !== -1 ? localConfig.alturaPatas || alturaPatas : 0;

        return (
            <group>
                {/* Lateral izquierdo adicional */}
                <Tabla
                    parentRef={parentRef}
                    espesorBase={actualEspesor}
                    position={[
                        -((actualWidth / 2) - actualEspesor),
                        (actualHeight / 2) + extraAltura,
                        (actualDepth / 2) + (actualEspesor / 2)
                    ]}
                    width={actualEspesor * 2}
                    height={actualHeight}
                    depth={actualEspesor}
                    material={materiales.Artico}
                    posicionCaja="left"
                    shape="box"
                />

                {/* Lateral derecho adicional */}
                <Tabla
                    parentRef={parentRef}
                    espesorBase={actualEspesor}
                    position={[
                        ((actualWidth / 2) - actualEspesor),
                        (actualHeight / 2) + extraAltura,
                        (actualDepth / 2) + (actualEspesor / 2)
                    ]}
                    width={actualEspesor * 2}
                    height={actualHeight}
                    depth={actualEspesor}
                    material={materiales.Artico}
                    posicionCaja="right"
                    shape="box"
                />

                {/* Techo adicional */}
                <Tabla
                    parentRef={parentRef}
                    espesorBase={actualEspesor}
                    position={[
                        0,
                        (actualHeight - actualEspesor) + extraAltura,
                        (actualDepth / 2) + (actualEspesor / 2)
                    ]}
                    width={actualWidth - (actualEspesor * 4)}
                    height={actualEspesor * 2}
                    depth={actualEspesor}
                    material={materiales.Artico}
                    posicionCaja="top"
                    shape="box"
                />
            </group>
        );
    };


    // Ajustar la puerta para la mitad inferior
    const doorHeight = height / 4;
    const doorPositionY = -height / 2 + (doorHeight / 2) + (patas && indicePata !== -1 ? alturaPatas : 0); // Base de la mitad inferior, ajustada por extraAltura
    const adjustedPuertas = puertas.map((puerta) =>
        React.cloneElement(puerta as React.ReactElement, {
            width: width - espesor*4,
            height: height/2,
            depth: espesor,
            position: [0, doorPositionY, 0],
            extraAltura: patas && indicePata !== -1 ? alturaPatas : 0,
            pivot: "right",
        })
    );

    return (
        <Casco
            {...props}
            material={materiales.Artico}
            renderExtraParts={renderExtraParts}
            puertas={adjustedPuertas}
        />
    );
};

export default Bodeguero;