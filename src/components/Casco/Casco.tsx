import * as React from "react";
import * as THREE from "three";
import Caja from "./Caja";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import { useMaterial } from "../../assets/materials";
import { ReactNode } from "react";

// Props para el componente Casco
export type CascoProps = {
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
    patas?: ReactNode[];
    alturaPatas?: number;
    indicePata?: number;
    puertas?: ReactNode[];
    indicePuerta?: number;
    seccionesHorizontales?: any[]; // Array de secciones horizontales
    seccionesVerticales?: any[];   // Array de secciones verticales
};

// Componente principal Casco como clase
export class CascoBase extends React.Component<
    CascoProps & {
    contextRef: any;
    setContextRef: (ref: any) => void;
    materiales: any;
}
> {
    protected readonly groupRef: React.RefObject<THREE.Group>;
    private readonly horizontalSectionsRefs: React.RefObject<{ [key: string]: THREE.Mesh }>;
    private readonly verticalSectionsRefs: React.RefObject<{ [key: string]: THREE.Mesh }>;
    private _hasUpdatedRef = false;


    static defaultProps = {
        width: 2,
        height: 2,
        depth: 2,
        espesor: 0.1,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        retranqueoTrasero: 0,
        retranquearSuelo: false,
        sueloDentro: false,
        techoDentro: false,
        traseroDentro: false,
        esquinaXTriangulada: false,
        esquinaZTriangulada: false,
        patas: [],
        alturaPatas: 0.5,
        indicePata: -1,
        puertas: [],
        indicePuerta: -1,
        seccionesHorizontales: null,
        seccionesVerticales: null,
    };

    constructor(
        props: CascoProps & {
            contextRef: any;
            setContextRef: (ref: any) => void;
            materiales: any;
        }
    ) {
        super(props);
        this.groupRef = React.createRef<THREE.Group>();
        this.horizontalSectionsRefs = React.createRef<{ [key: string]: THREE.Mesh }>();
        this.verticalSectionsRefs = React.createRef<{ [key: string]: THREE.Mesh }>();
        this.horizontalSectionsRefs.current = {};
        this.verticalSectionsRefs.current = {};
    }

    componentDidMount() {
        this.updateContextRefOnce();
    }

    componentDidUpdate(prevProps) {
        // Only update ref if certain props have changed
        const relevantPropsChanged =
            prevProps.width !== this.props.width ||
            prevProps.height !== this.props.height ||
            prevProps.depth !== this.props.depth;

        if (relevantPropsChanged) {
            this.updateContextRefOnce();
        }
    }

// Call this once to prevent multiple updates
    updateContextRefOnce() {
        if (!this._hasUpdatedRef && this.groupRef.current) {
            this._hasUpdatedRef = true;
            this.updateContextRef();
            // Reset flag after a delay to allow future updates
            setTimeout(() => {
                this._hasUpdatedRef = false;
            }, 100);
        }
    }


    updateContextRef() {
        // Only update if actually necessary
        if (this.groupRef.current &&
            (!this.props.contextRef ||
                !this.props.contextRef.groupRef ||
                this.props.contextRef.groupRef !== this.groupRef.current)) {

            this.props.setContextRef({
                ...this.props.contextRef,
                groupRef: this.groupRef.current,
            });
        }
    }

    calcularDimensiones() {
        const ref = this.props.contextRef || {};
        const userData = ref?.userData || {};
        const actualWidth = userData.width || this.props.width || 2;
        const actualHeight = userData.height || this.props.height || 2;
        const actualDepth = userData.depth || this.props.depth || 2;
        const actualEspesor = userData.espesor || this.props.espesor || 0.1;
        const actualSueloDentro = userData.sueloDentro ?? this.props.sueloDentro ?? false;
        const actualTechoDentro = userData.techoDentro ?? this.props.techoDentro ?? false;
        const actualTraseroDentro = userData.traseroDentro ?? this.props.traseroDentro ?? true;

        const offsetDepthTraseroDentro = actualTraseroDentro ? actualDepth : actualDepth - actualEspesor;
        const actualRetranqueoTrasero = ref.retranqueoTrasero ?? this.props.retranqueoTrasero ?? 0;
        const actualRetranquearSuelo = ref.retranquearSuelo ?? this.props.retranquearSuelo ?? false;
        const actualEsquinaXTriangulada = ref.esquinaXTriangulada ?? this.props.esquinaXTriangulada ?? false;
        const actualEsquinaZTriangulada = ref.esquinaZTriangulada ?? this.props.esquinaZTriangulada ?? false;


        return {
            suelo: {
                width: actualSueloDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height: actualEspesor,
                depth:
                    (actualSueloDentro ? offsetDepthTraseroDentro : actualDepth) -
                    (actualRetranquearSuelo ? actualRetranqueoTrasero - actualEspesor + (actualEspesor % 2) : 0),
            },
            techo: {
                width: actualTechoDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height: actualEspesor,
                depth: actualTechoDentro ? offsetDepthTraseroDentro : actualDepth,
            },
            lateral: {
                width: actualEspesor,
                height:
                    actualHeight -
                    (actualSueloDentro ? 0 : actualEspesor) -
                    (actualTechoDentro ? 0 : actualEspesor) -
                    (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor : 0),
                depth: offsetDepthTraseroDentro,
            },
            trasero: {
                width: actualTraseroDentro ? actualWidth - actualEspesor * 2 : actualWidth,
                height:
                    actualHeight -
                    (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro ? 0 : actualEspesor) : actualEspesor) -
                    (actualTechoDentro ? (actualTechoDentro && !actualTraseroDentro ? 0 : actualEspesor) : actualEspesor),
                depth: actualEspesor,
            },
        };
    }

    calcularPosiciones() {
        const ref = this.props.contextRef || {};
        const actualWidth = ref.width || this.props.width || 2;
        const actualHeight = ref.height || this.props.height || 2;
        const actualDepth = ref.depth || this.props.depth || 2;
        const actualEspesor = ref.espesor || this.props.espesor || 0.1;
        const actualRetranqueoTrasero = ref.retranqueoTrasero ?? this.props.retranqueoTrasero ?? 0;
        const actualRetranquearSuelo = ref.retranquearSuelo ?? this.props.retranquearSuelo ?? false;
        const actualSueloDentro = ref.sueloDentro ?? this.props.sueloDentro ?? false;
        const actualTechoDentro = ref.techoDentro ?? this.props.techoDentro ?? false;
        const actualTraseroDentro = ref.traseroDentro ?? this.props.traseroDentro ?? false;
        const actualEsquinaXTriangulada = ref.esquinaXTriangulada ?? this.props.esquinaXTriangulada ?? false;
        const actualEsquinaZTriangulada = ref.esquinaZTriangulada ?? this.props.esquinaZTriangulada ?? false;
        const actualAlturaPatas = ref.alturaPatas || this.props.alturaPatas || 0.5;
        const indiceActualPata = ref.indicePata ?? this.props.indicePata ?? -1;

        const mitadAncho = actualWidth / 2;
        const mitadProfundidad = actualDepth / 2;
        const extraAltura = this.props.patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;
        const alturaLaterales =
            (actualHeight -
                (actualSueloDentro ? 0 : actualEspesor) -
                (actualTechoDentro ? 0 : actualEspesor)) /
            2 +
            (actualSueloDentro ? 0 : actualEspesor) -
            (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor / 2 : 0);

        return {
            suelo: [
                0,
                actualEspesor / 2 + extraAltura,
                (actualSueloDentro && !actualTraseroDentro ? actualEspesor / 2 : 0) +
                (actualRetranquearSuelo ? actualRetranqueoTrasero / 2 : 0),
            ] as [number, number, number],
            techo: [
                0,
                actualHeight - actualEspesor / 2 + extraAltura,
                (actualTechoDentro && actualEsquinaZTriangulada
                    ? 0
                    : actualTechoDentro && !actualTraseroDentro
                        ? actualEspesor / 2
                        : 0) - (actualEsquinaZTriangulada && actualTraseroDentro ? actualEspesor / 2 : 0),
            ] as [number, number, number],
            izquierda: [
                -mitadAncho + actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0,
            ] as [number, number, number],
            derecha: [
                mitadAncho - actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0,
            ] as [number, number, number],
            trasero: [
                0,
                (actualHeight -
                    (actualSueloDentro
                        ? actualSueloDentro && !actualTraseroDentro
                            ? 0
                            : actualEspesor
                        : actualEspesor) -
                    (actualTechoDentro
                        ? actualTechoDentro && !actualTraseroDentro
                            ? 0
                            : actualEspesor
                        : actualEspesor)) /
                2 +
                (actualSueloDentro
                    ? actualSueloDentro && !actualTraseroDentro
                        ? 0
                        : actualEspesor
                    : actualEspesor) +
                extraAltura,
                -mitadProfundidad + actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero : 0),
            ] as [number, number, number],
            puerta: [
                actualWidth / 2,
                (actualHeight - actualEspesor - actualEspesor) / 2 + actualEspesor + extraAltura,
                actualDepth / 2 + actualEspesor / 2,
            ] as [number, number, number],
        };
    }

    // Metodo para calcular el espacio entre dos paredes o secciones en el eje X
    getEspacioEntreParedes(eje: "x" | "y" | "z", id1: string, id2: string): number | null {
        const refs =
            eje === "y"
                ? this.verticalSectionsRefs.current
                : this.horizontalSectionsRefs.current;
        const mesh1 = refs?.[id1];
        const mesh2 = refs?.[id2];

        if (!mesh1 || !mesh2) return null;

        const pos1 = new THREE.Vector3();
        const pos2 = new THREE.Vector3();
        mesh1.getWorldPosition(pos1);
        mesh2.getWorldPosition(pos2);

        if (eje === "x") return Math.abs(pos1.x - pos2.x);
        if (eje === "y") return Math.abs(pos1.y - pos2.y);
        if (eje === "z") return Math.abs(pos1.z - pos2.z);
        return null;
    }

    renderHorizontalSections() {
        const ref = this.props.contextRef || {};
        const actualWidth = ref.width || this.props.width || 2;
        const actualHeight = ref.height || this.props.height || 2;
        const actualDepth = ref.depth || this.props.depth || 2;
        const actualEspesor = ref.espesor || this.props.espesor || 0.1;
        const actualTraseroDentro = ref.traseroDentro ?? this.props.traseroDentro ?? false;
        const actualRetranqueoTrasero = ref.retranqueoTrasero ?? this.props.retranqueoTrasero ?? 0;
        const actualAlturaPatas = ref.alturaPatas || this.props.alturaPatas || 0.5;
        const indiceActualPata = ref.indicePata ?? this.props.indicePata ?? -1;
        const extraAltura = this.props.patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;

        return (this.props.seccionesHorizontales || []).map((cube) => {
            const [rx, ry, rz] = cube.relativePosition;
            const halfWidth = (cube.relativeWidth * actualWidth) / 2;
            const leftEdge = (rx + 0.5) * actualWidth + halfWidth;
            const rightEdge = (rx + 0.5) * actualWidth - halfWidth;
            const tolerance = 0.1;
            const touchesLeftEdge = Math.abs(leftEdge - actualWidth) < tolerance;
            const touchesRightEdge = Math.abs(rightEdge) < tolerance;

            let adjustedWidth = cube.relativeWidth * actualWidth - actualEspesor / 2;
            let adjustedXposition = 0;

            if (!touchesLeftEdge && !touchesRightEdge) {
                adjustedWidth -= actualEspesor / 2;
                adjustedXposition = rx * actualWidth;
            } else if (touchesRightEdge && !touchesLeftEdge) {
                adjustedWidth -= actualEspesor;
                adjustedXposition = rx * actualWidth + actualEspesor / 4;
            } else if (touchesLeftEdge && !touchesRightEdge) {
                adjustedWidth -= actualEspesor;
                adjustedXposition = rx * actualWidth - actualEspesor / 4;
            } else {
                adjustedWidth -= actualEspesor * 1.5;
                adjustedXposition = rx * actualWidth;
            }

            return (
                <Caja
                    parentRef={ref}
                    shape={"box"}
                    key={cube.id}
                    ref={(ref) => {
                        if (ref) this.horizontalSectionsRefs.current![cube.id] = ref;
                    }}
                    position={[
                        adjustedXposition,
                        ry * actualHeight + extraAltura,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                    ]}
                    width={adjustedWidth}
                    height={actualEspesor}
                    depth={cube.relativeDepth * actualDepth - actualRetranqueoTrasero - actualEspesor}
                    material={this.props.materiales.OakWood}
                    espesorBase={actualEspesor}
                />
            );
        });
    }

    renderVerticalSections() {
        const ref = this.props.contextRef || {};
        const actualWidth = ref.width || this.props.width || 2;
        const actualHeight = ref.height || this.props.height || 2;
        const actualDepth = ref.depth || this.props.depth || 2;
        const actualEspesor = ref.espesor || this.props.espesor || 0.1;
        const actualTraseroDentro = ref.traseroDentro ?? this.props.traseroDentro ?? false;
        const actualRetranqueoTrasero = ref.retranqueoTrasero ?? this.props.retranqueoTrasero ?? 0;
        const actualAlturaPatas = ref.alturaPatas || this.props.alturaPatas || 0.5;
        const indiceActualPata = ref.indicePata ?? this.props.indicePata ?? -1;
        const extraAltura = this.props.patas && indiceActualPata !== -1 ? actualAlturaPatas : 0;

        return (this.props.seccionesVerticales || []).map((cube) => {
            const [rx, ry, rz] = cube.relativePosition;
            const touchesTopEdge =
                Math.abs(ry * actualHeight + (cube.relativeHeight * actualHeight) / 2 - actualHeight) < 0.01;
            const touchesBottomEdge = Math.abs(ry * actualHeight - (cube.relativeHeight * actualHeight) / 2) < 0.01;

            let adjustedHeight = cube.relativeHeight * actualHeight - actualEspesor / 2;
            let adjustedYposition = 0;

            if (!touchesTopEdge && !touchesBottomEdge) {
                adjustedHeight -= actualEspesor / 2;
                adjustedYposition = ry * actualHeight + extraAltura;
            } else if (touchesBottomEdge && !touchesTopEdge) {
                adjustedHeight -= actualEspesor;
                adjustedYposition = ry * actualHeight + actualEspesor / 4 + extraAltura;
            } else if (touchesTopEdge && !touchesBottomEdge) {
                adjustedHeight -= actualEspesor;
                adjustedYposition = ry * actualHeight - actualEspesor / 4 + extraAltura;
            } else {
                adjustedHeight -= actualEspesor * 1.5;
                adjustedYposition = ry * actualHeight + extraAltura;
            }

            return (
                <Caja
                    parentRef={ref}
                    shape={"box"}
                    key={cube.id}
                    ref={(ref) => {
                        if (ref) this.verticalSectionsRefs.current![cube.id] = ref;
                    }}
                    position={[
                        rx * actualWidth,
                        adjustedYposition,
                        actualEspesor / 2 + (actualTraseroDentro ? actualRetranqueoTrasero / 2 : 0),
                    ]}
                    width={actualEspesor}
                    height={adjustedHeight}
                    depth={cube.relativeDepth * actualDepth - actualRetranqueoTrasero - actualEspesor}
                    material={this.props.materiales.OakWood}
                    espesorBase={actualEspesor}
                />
            );
        });
    }

    handleClick = (event: React.PointerEvent) => {
        event.stopPropagation(); // Evita que el evento se propague al canvas o a otros objetos
        // Llama al callback que actualiza el contexto pasándole la referencia real
        if (this.props.setContextRef && this.groupRef.current) {
            this.props.setContextRef({
                groupRef: this.groupRef.current,
                // Puedes agregar acá información adicional o userData si lo requieres
            });
        }
    };

    render() {
        const ref = this.props.contextRef || this.groupRef;
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

        return (
            <group ref={this.groupRef} position={position} rotation={rotation} onPointerDown={this.handleClick}  >
                {/* Caja inferior (suelo) */}
                <Caja
                    parentRef={ref}
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

                {/* Caja lado izquierdo */}
                <Caja
                    parentRef={ref}
                    espesorBase={actualEspesor}
                    position={posiciones.izquierda}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.DarkWood}
                    posicionCaja={"left"}
                    shape={actualEsquinaXTriangulada ? "trapezoid" : "box"}
                />

                {/* Caja lado derecho */}
                <Caja
                    parentRef={ref}
                    espesorBase={actualEspesor}
                    position={posiciones.derecha}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.DarkWood}
                    posicionCaja={"right"}
                    shape={actualEsquinaXTriangulada ? "trapezoid" : "box"}
                />

                {/* Caja detrás */}
                <Caja
                    parentRef={ref}
                    espesorBase={actualEspesor}
                    position={posiciones.trasero}
                    width={dimensiones.trasero.width}
                    height={dimensiones.trasero.height}
                    depth={dimensiones.trasero.depth}
                    material={materiales.DarkWood}
                    shape={"box"}
                />

                {/* Caja arriba (techo) */}
                <Caja
                    parentRef={ref}
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

                {/* Renderizar patas */}
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

                {/* Renderizar puertas */}
                {puertas && indiceActualPuerta !== -1 && puertas[indiceActualPuerta] && (
                    <>
                        {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                            parentRef: ref,
                            position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                            width: actualWidth > 2 ? actualWidth / 2 : actualWidth,
                            height: actualHeight,
                            depth: actualEspesor,
                            pivot: "right",
                        })}

                        {actualWidth > 2 && (
                            <>
                                {React.cloneElement(puertas[indiceActualPuerta] as React.ReactElement, {
                                    parentRef: ref,
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

                {/* Renderizar secciones horizontales y verticales */}
                {this.renderHorizontalSections()}
                {this.renderVerticalSections()}
            </group>
        );
    }
}

const CascoWithContext = React.memo((props) => {
    const { refItem, setRefItem } = useSelectedItemProvider();
    const materiales = useMaterial();

    // Only update context when truly necessary
    const updateContextRef = React.useCallback((ref) => {
        if (ref && (!refItem || ref.groupRef !== refItem.groupRef)) {
            setRefItem(ref);
        }
    }, [refItem, setRefItem]);

    return (
        <CascoBase
            {...props}
            contextRef={refItem}
            setContextRef={updateContextRef}
            materiales={materiales}
        />
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Return true if props are equal (don't re-render)
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});

export default CascoWithContext;