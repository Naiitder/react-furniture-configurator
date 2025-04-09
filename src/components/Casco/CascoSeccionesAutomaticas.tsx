import * as React from "react";
import * as THREE from "three";
import Caja from "./Caja";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import { useMaterial } from "../../assets/materials";
import { ReactNode } from "react";
import {CascoBase, CascoProps} from "./Casco";

// Nueva clase CascoSeccionesAutomaticas que hereda de CascoBase
class CascosSeccionesAutomaticas extends CascoBase {
    constructor(
        props: CascoProps & {
            contextRef: any;
            setContextRef: (ref: any) => void;
            materiales: any;
        }
    ) {
        super(props);
    }

    // Sobrescribimos render para añadir las secciones automáticas
    render() {
        const ref = this.props.contextRef || {};
        const {
            materiales,
            position = [0, 0, 0],
            rotation = [0, 0, 0],
            patas = [],
            puertas = [],
        } = this.props;

        const actualWidth = ref.width || this.props.width || 2;
        const actualHeight = ref.height || this.props.height || 2;
        const actualDepth = ref.depth || this.props.depth || 2;
        const actualEspesor = ref.espesor || this.props.espesor || 0.1;
        const actualEsquinaXTriangulada = ref.esquinaXTriangulada ?? this.props.esquinaXTriangulada ?? false;
        const actualEsquinaZTriangulada = ref.esquinaZTriangulada ?? this.props.esquinaZTriangulada ?? false;
        const actualAlturaPatas = ref.alturaPatas || this.props.alturaPatas || 0.5;

        let indiceActualPata = ref.indicePata ?? this.props.indicePata ?? -1;
        if (indiceActualPata > 0) indiceActualPata--;

        let indiceActualPuerta = ref.indicePuerta ?? this.props.indicePuerta ?? -1;
        if (indiceActualPuerta > 0) indiceActualPuerta--;

        const dimensiones = this.calcularDimensiones();
        const posiciones = this.calcularPosiciones();

        // Lógica para secciones automáticas
        const secciones = Math.ceil((actualWidth - actualEspesor * 2) * 100 / 100);
        const anchoUtil = actualWidth - actualEspesor * 2;
        const distanciaEntre = anchoUtil / secciones;
        const inicio = -anchoUtil / 2 + distanciaEntre / 2;
        const posicionXsecciones = Array.from({ length: secciones }, (_, i) => inicio + i * distanciaEntre);

        // Renderizamos la estructura básica de CascoBase y añadimos las secciones automáticas
        return (
            <group ref={this.groupRef} position={position} rotation={rotation}>
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.suelo}
                    width={dimensiones.suelo.width}
                    height={dimensiones.suelo.height}
                    depth={dimensiones.suelo.depth}
                    material={materiales.OakWood}
                    posicionCaja={"bottom"}
                    shape={actualEsquinaXTriangulada ? "trapezoid" : "box"}
                    bordeEjeY={false}
                />
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.izquierda}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.DarkWood}
                    posicionCaja={"left"}
                    shape={actualEsquinaXTriangulada ? "trapezoid" : "box"}
                />
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.derecha}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.DarkWood}
                    posicionCaja={"right"}
                    shape={actualEsquinaXTriangulada ? "trapezoid" : "box"}
                />
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.trasero}
                    width={dimensiones.trasero.width}
                    height={dimensiones.trasero.height}
                    depth={dimensiones.trasero.depth}
                    material={materiales.DarkWood}
                    shape={"box"}
                />
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.techo}
                    width={dimensiones.techo.width}
                    height={dimensiones.techo.height}
                    depth={dimensiones.techo.depth}
                    material={materiales.OakWood}
                    posicionCaja={"top"}
                    shape={actualEsquinaXTriangulada || actualEsquinaZTriangulada ? "trapezoid" : "box"}
                    bordeEjeY={false}
                    bordeEjeZ={actualEsquinaZTriangulada}
                    disableAdjustedWidth={
                        actualEsquinaZTriangulada || (actualEsquinaZTriangulada && actualEsquinaXTriangulada)
                    }
                />
                {patas && indiceActualPata !== -1 && patas[indiceActualPata] && (
                    <group>
                        {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                            position: [-actualWidth / 2 + 0.1, position[1], -actualDepth / 2 + 0.1],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                            position: [actualWidth / 2 - 0.1, position[1], -actualDepth / 2 + 0.1],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                            position: [-actualWidth / 2 + 0.1, position[1], actualDepth / 2 - 0.1],
                            height: actualAlturaPatas,
                        })}
                        {React.cloneElement(patas[indiceActualPata] as React.ReactElement, {
                            position: [actualWidth / 2 - 0.1, position[1], actualDepth / 2 - 0.1],
                            height: actualAlturaPatas,
                        })}
                    </group>
                )}
                {puertas && indiceActualPuerta !== -1 && puertas[indiceActualPuerta] && (
                    <>
                        {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                            position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                            width: actualWidth > 2 ? actualWidth / 2 : actualWidth,
                            height: actualHeight,
                            depth: actualEspesor,
                            pivot: "right",
                        })}
                        {actualWidth > 2 && (
                            <>
                                {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                                    position: [-posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                                    width: actualWidth / 2,
                                    height: actualHeight,
                                    depth: actualEspesor,
                                    pivot: "left",
                                })}
                            </>
                        )}
                    </>
                )}
                {secciones > 0 && (
                    <group>
                        {Array.from({ length: secciones }).map((_, index) => (
                            <Caja
                                key={index}
                                espesorBase={actualEspesor}
                                position={[
                                    posicionXsecciones[index],
                                    actualHeight / 2,
                                    actualEspesor / 2,
                                ]}
                                width={actualEspesor}
                                height={actualHeight - actualEspesor * 2}
                                depth={actualDepth - actualEspesor}
                                material={materiales.WoodWorn}
                                posicionCaja={"bottom"}
                                shape={"box"}
                                bordeEjeY={false}
                            />
                        ))}
                    </group>
                )}
            </group>
        );
    }
}

// HOC para manejar el contexto con hooks
const CascoSeccionesAutomaticasWithContext: React.FC<CascoProps> = (props) => {
    const { ref, setRef } = useSelectedItemProvider();
    const materiales = useMaterial();
    const cascoProps = React.useRef(props);

    React.useEffect(() => {
        cascoProps.current = props;
    }, [props]);

    return (
        <CascosSeccionesAutomaticas
            {...props}
            contextRef={ref}
            setContextRef={setRef}
            materiales={materiales}
        />
    );
};

export default CascoSeccionesAutomaticasWithContext;