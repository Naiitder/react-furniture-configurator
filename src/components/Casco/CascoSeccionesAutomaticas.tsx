import * as React from "react";
import * as THREE from 'three';
import Caja from "./Caja";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";
import {useMaterial} from "../../assets/materials";
import CascoWithContext from "./Casco"; // Importamos el componente base

// Props para el componente CascoSeccionesAutomaticas
type CascoSeccionesAutomaticasProps = {
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
    patas?: React.ReactNode[]; // Array de componentes
    alturaPatas?: number;
    indicePata?: number;
    puertas?: React.ReactNode[];
    indicePuerta?: number;
    // Propiedades específicas para secciones automáticas
    numSecciones?: number; // Número fijo de secciones, si se proporciona
    materialSecciones?: any; // Material para las secciones
}

// Clase base que extiende de React.Component para CascoSeccionesAutomaticas
class CascoSeccionesAutomaticasBase extends React.Component<CascoSeccionesAutomaticasProps & {
    contextRef: any;
    setContextRef: (ref: any) => void;
    materiales: any;
}> {
    private groupRef: React.RefObject<THREE.Group>;
    private secciones: number;
    private posicionXsecciones: number[];

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
        numSecciones: 0, // Por defecto, cálculo automático
        materialSecciones: null // Se usará un material por defecto si no se especifica
    };

    constructor(props: CascoSeccionesAutomaticasProps & { contextRef: any; setContextRef: (ref: any) => void; materiales: any }) {
        super(props);
        this.groupRef = React.createRef<THREE.Group>();
        // Inicializamos con valores por defecto
        this.secciones = 2;
        this.posicionXsecciones = [-0.5, 0.5];

        // Calculamos las secciones iniciales
        this.calcularSecciones();
    }

    componentDidMount() {
        this.updateContextRef();
        this.calcularSecciones();
    }

    componentDidUpdate(prevProps: CascoSeccionesAutomaticasProps & { contextRef: any; setContextRef: (ref: any) => void; materiales: any }) {
        this.updateContextRef();

        // Si cambian las dimensiones, recalculamos las secciones
        const ref = this.props.contextRef || {};
        const prevRef = prevProps.contextRef || {};

        const actualWidth = ref.width || this.props.width;
        const prevWidth = prevRef.width || prevProps.width;
        const actualEspesor = ref.espesor || this.props.espesor;
        const prevEspesor = prevRef.espesor || prevProps.espesor;

        if (actualWidth !== prevWidth || actualEspesor !== prevEspesor) {
            this.calcularSecciones();
        }
    }

    updateContextRef() {
        if (this.groupRef.current && this.props.contextRef) {
            // Actualizar la referencia en el contexto
            this.props.setContextRef({
                ...this.props.contextRef,
                groupRef: this.groupRef.current
            });
        }
    }

    calcularSecciones() {
        const ref = this.props.contextRef || {};
        const actualWidth = ref.width || this.props.width || 2;
        const actualEspesor = ref.espesor || this.props.espesor || 0.1;
        const numSeccionesProps = ref.numSecciones || this.props.numSecciones || 0;

        // Si se proporciona un número fijo de secciones, lo usamos
        if (numSeccionesProps > 0) {
            this.secciones = numSeccionesProps;
        } else {
            // Cálculo automático basado en el ancho
            this.secciones = Math.max(2, Math.ceil((actualWidth - actualEspesor * 2) * 100 / 100));
        }

        const anchoUtil = actualWidth - actualEspesor * 2;
        const distanciaEntre = anchoUtil / this.secciones;
        const inicio = -anchoUtil / 2 + distanciaEntre / 2;

        this.posicionXsecciones = Array.from({ length: this.secciones }, (_, i) => inicio + i * distanciaEntre);
    }

    calcularDimensiones() {
        // Usando la misma lógica que CascoBase
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

        const offsetDepthTraseroDentro = actualTraseroDentro ? actualDepth : actualDepth - (actualEspesor);

        return {
            suelo: {
                width: actualSueloDentro ? actualWidth - (actualEspesor * 2) : actualWidth,
                height: actualEspesor,
                depth: (actualSueloDentro ? offsetDepthTraseroDentro : actualDepth) - (actualRetranquearSuelo ? ((actualRetranqueoTrasero - actualEspesor) + (actualEspesor % 2)) : 0),
            },
            techo: {
                width: actualTechoDentro ? actualWidth - (actualEspesor * 2) : actualWidth,
                height: actualEspesor,
                depth: actualTechoDentro ? offsetDepthTraseroDentro : actualDepth
            },
            lateral: {
                width: actualEspesor,
                height: actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor) - (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor : 0),
                depth: offsetDepthTraseroDentro
            },
            trasero: {
                width: actualTraseroDentro ? actualWidth - (actualEspesor * 2) : actualWidth,
                height: actualHeight - (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor) - (actualTechoDentro ? (actualTechoDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor),
                depth: actualEspesor
            },
            seccion: {
                width: actualEspesor,
                height: actualHeight - (actualEspesor * 2),
                depth: actualDepth - (actualEspesor)
            }
        };
    }

    calcularPosiciones() {
        // Usando la misma lógica que CascoBase
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

        const extraAltura = this.props.patas && indiceActualPata != -1 ? actualAlturaPatas : 0;

        const alturaLaterales = (actualHeight - (actualSueloDentro ? 0 : actualEspesor) - (actualTechoDentro ? 0 : actualEspesor)) / 2 + (actualSueloDentro ? 0 : actualEspesor) - (actualEsquinaZTriangulada && actualEsquinaXTriangulada ? actualEspesor / 2 : 0)

        return {
            suelo: [
                0,
                (actualEspesor / 2) + extraAltura,
                (actualSueloDentro && !actualTraseroDentro ? actualEspesor / 2 : 0) + (actualRetranquearSuelo ? actualRetranqueoTrasero / 2 : 0),
            ] as [number, number, number],

            techo: [
                0,
                (actualHeight - actualEspesor / 2) + extraAltura,
                (actualTechoDentro && actualEsquinaZTriangulada ? 0 : (actualTechoDentro && !actualTraseroDentro) ? actualEspesor / 2 : 0) - (actualEsquinaZTriangulada && actualTraseroDentro ? actualEspesor / 2 : 0)
            ] as [number, number, number],

            izquierda: [
                -mitadAncho + actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0
            ] as [number, number, number],

            derecha: [
                mitadAncho - actualEspesor / 2,
                alturaLaterales + extraAltura,
                !actualTraseroDentro ? actualEspesor / 2 : 0
            ] as [number, number, number],

            trasero: [
                0,
                (actualHeight - (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor) - (actualTechoDentro ? (actualTechoDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor)) / 2 + (actualSueloDentro ? (actualSueloDentro && !actualTraseroDentro) ? 0 : actualEspesor : actualEspesor) + extraAltura,
                (-mitadProfundidad + actualEspesor / 2) + (actualTraseroDentro ? actualRetranqueoTrasero : 0)
            ] as [number, number, number],

            puerta: [
                actualWidth / 2,
                (actualHeight - actualEspesor - actualEspesor) / 2 + actualEspesor + extraAltura,
                (actualDepth / 2) + actualEspesor / 2
            ] as [number, number, number],

            seccion: (xPos: number): [number, number, number] => [
                xPos,
                (actualHeight / 2) + extraAltura,
                actualEspesor / 2
            ]
        };
    }

    render() {
        const ref = this.props.contextRef || {};
        const { materiales, position = [0, 0, 0], rotation = [0, 0, 0], patas = [], puertas = [] } = this.props;

        // Usar valores del contexto si están disponibles, o los props como respaldo
        const actualWidth = ref.width || this.props.width || 2;
        const actualHeight = ref.height || this.props.height || 2;
        const actualDepth = ref.depth || this.props.depth || 2;
        const actualEspesor = ref.espesor || this.props.espesor || 0.1;
        const actualEsquinaXTriangulada = ref.esquinaXTriangulada ?? this.props.esquinaXTriangulada ?? false;
        const actualEsquinaZTriangulada = ref.esquinaZTriangulada ?? this.props.esquinaZTriangulada ?? false;
        const actualAlturaPatas = ref.alturaPatas || this.props.alturaPatas || 0.5;
        const materialSecciones = this.props.materialSecciones || materiales.WoodWorn;

        // Ajustes para los índices de pata y puerta
        let indiceActualPata : number = ref.indicePata ?? this.props.indicePata ?? -1;
        if (indiceActualPata > 0) {
            indiceActualPata--;
        }

        let indiceActualPuerta : number = ref.indicePuerta ?? this.props.indicePuerta ?? -1;
        if (indiceActualPuerta > 0) {
            indiceActualPuerta--;
        }

        const dimensiones = this.calcularDimensiones();
        const posiciones = this.calcularPosiciones();

        return (
            <group ref={this.groupRef} position={position} rotation={rotation}>
                {/* Caja inferior (suelo) */}
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.suelo}
                    width={dimensiones.suelo.width}
                    height={dimensiones.suelo.height}
                    depth={dimensiones.suelo.depth}
                    material={materiales.OakWood}
                    posicionCaja={"bottom"}
                    bordesTriangulados={actualEsquinaXTriangulada}
                    bordeEjeY={false}
                />

                {/* Caja lado izquierdo */}
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.izquierda}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.DarkWood}
                    posicionCaja={"left"}
                    bordesTriangulados={actualEsquinaXTriangulada}
                />

                {/* Caja lado derecho */}
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.derecha}
                    width={dimensiones.lateral.width}
                    height={dimensiones.lateral.height}
                    depth={dimensiones.lateral.depth}
                    material={materiales.DarkWood}
                    posicionCaja={"right"}
                    bordesTriangulados={actualEsquinaXTriangulada}
                />

                {/* Caja detrás */}
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.trasero}
                    width={dimensiones.trasero.width}
                    height={dimensiones.trasero.height}
                    depth={dimensiones.trasero.depth}
                    material={materiales.DarkWood}
                    bordesTriangulados={false}
                />

                {/* Caja arriba (techo) */}
                <Caja
                    espesorBase={actualEspesor}
                    position={posiciones.techo}
                    width={dimensiones.techo.width}
                    height={dimensiones.techo.height}
                    depth={dimensiones.techo.depth}
                    material={materiales.OakWood}
                    posicionCaja={"top"}
                    bordesTriangulados={actualEsquinaXTriangulada || actualEsquinaZTriangulada}
                    bordeEjeY={false}
                    bordeEjeZ={actualEsquinaZTriangulada}
                    disableAdjustedWidth={actualEsquinaZTriangulada || (actualEsquinaZTriangulada && actualEsquinaXTriangulada)}
                />

                {/* Renderizar 4 patas en las esquinas */}
                {(patas && indiceActualPata !== -1 && patas[indiceActualPata]) && (
                    <group>
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [-actualWidth / 2 + 0.1, position[1], -actualDepth / 2 + 0.1],
                            height: actualAlturaPatas
                        })}
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [actualWidth / 2 - 0.1, position[1], -actualDepth / 2 + 0.1],
                            height: actualAlturaPatas
                        })}
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [-actualWidth / 2 + 0.1, position[1], actualDepth / 2 - 0.1],
                            height: actualAlturaPatas
                        })}
                        {React.cloneElement(patas[indiceActualPata], {
                            position: [actualWidth / 2 - 0.1, position[1], actualDepth / 2 - 0.1],
                            height: actualAlturaPatas
                        })}
                    </group>
                )}

                {/* Renderizar puerta en la parte frontal */}
                {puertas && indiceActualPuerta !== -1 && puertas[indiceActualPuerta] && (
                    <>
                        {React.cloneElement(puertas[indiceActualPuerta], {
                            position: [posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                            width: actualWidth > 2 ? actualWidth / 2 : actualWidth,
                            height: actualHeight,
                            depth: actualEspesor,
                            pivot: "right" // Define el pivote en el borde derecho
                        })}

                        {actualWidth > 2 && (
                            <>
                                {React.cloneElement(puertas[indiceActualPuerta], {
                                    position: [-posiciones.puerta[0], posiciones.puerta[1], posiciones.puerta[2]],
                                    width: actualWidth / 2,
                                    height: actualHeight,
                                    depth: actualEspesor,
                                    pivot: "left" // Define el pivote en el borde izquierdo
                                })}
                            </>
                        )}
                    </>
                )}

                {/* Renderizar secciones automáticas */}
                {this.secciones > 0 && (
                    <group>
                        {this.posicionXsecciones.map((xPos, index) => (
                            <Caja
                                key={index}
                                espesorBase={actualEspesor}
                                position={posiciones.seccion(xPos)}
                                width={dimensiones.seccion.width}
                                height={dimensiones.seccion.height}
                                depth={dimensiones.seccion.depth}
                                material={materialSecciones}
                                posicionCaja={"bottom"}
                                bordesTriangulados={false}
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
const CascoSeccionesAutomaticas: React.FC<CascoSeccionesAutomaticasProps> = (props) => {
    const { ref, setRef } = useSelectedItemProvider();
    const materiales = useMaterial();

    // Importante: usamos React.useRef para mantener una referencia consistente
    // del objeto props a través de renderizados y así evitar renderizados innecesarios
    const cascoProps = React.useRef(props);

    // Actualizar las props guardadas solo cuando cambian
    React.useEffect(() => {
        cascoProps.current = props;
    }, [props]);

    // Renderizamos el componente base pasando el contexto
    return (
        <CascoSeccionesAutomaticasBase
            {...props}
            contextRef={ref}
            setContextRef={setRef}
            materiales={materiales}
        />
    );
}

export default CascoSeccionesAutomaticas;