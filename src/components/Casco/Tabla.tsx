import * as React from "react";
import * as THREE from "three";
import '@react-three/fiber';
import BordeTriangular from "./BordeTriangular";
import {useMaterial} from "../../assets/materials";
import {useEffect, useRef, useState, useCallback} from "react";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider"
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider"

//TODO Si hay tanto borde eje Z y eje X hacer que solo se ponga los bordes en el lado frontal del mueble

// Componente para una caja individual
type TablaProps = {
    parentRef: React.Ref<any>;
    ref?: React.Ref<any>;
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    material: THREE.Material;
    stopPropagation?: boolean;
    version?: number

    shape: "box" | "trapezoid";
    taperAmount?: number; // Nueva propiedad para controlar cuánto se estrecha

    disableAdjustedWidth?: boolean;
    espesorBase: number;
    posicionCaja?: "top" | "bottom" | "left" | "right" | "back" | "interior";
    bordeEjeY?: boolean;
    bordeEjeZ?: boolean;
    orientacionBordeZ?: "vertical" | "front";
}

const Tabla: React.FC<TablaProps> = ({
                                         parentRef,
                                         ref = useRef<any>(null),
                                         position,
                                         rotation = [0, 0, 0],
                                         version = 0,
                                         espesorBase,
                                         width,
                                         height,
                                         depth,
                                         material,
                                         shape = "box",
                                         bordeEjeY = true,
                                         bordeEjeZ = false,
                                         posicionCaja = "interior",
                                         orientacionBordeZ = "front",
                                         disableAdjustedWidth = false,
                                         stopPropagation = true
                                     }) => {
    const {refItem, setRefItem} = useSelectedItemProvider();
    const {refPiece, setRefPiece} = useSelectedPieceProvider();

    const initialData = {
        width,
        height,
        depth,
        espesor: espesorBase,
        posicionCaja,
    };

    const [dimensions, setDimensions] = useState({
        width,
        height,
        depth,
        espesor: espesorBase,
    });

    useEffect(() => {
        if (ref.current && Object.keys(ref.current.userData).length === 0) {
            ref.current.userData = {...initialData};
        }
    }, []);

    useEffect(() => {
        if (ref.current) {
            ref.current.userData = {
                ...initialData,
                width: dimensions.width,
                height: dimensions.height,
                depth: dimensions.depth,
                espesor: dimensions.espesor
            };
        }
    }, [dimensions.width, dimensions.height, dimensions.depth, dimensions.espesor]);


    useEffect(() => {
        if (refPiece && refPiece === ref.current && refPiece.userData) {
            setDimensions({
                width: refPiece.userData.width,
                height: refPiece.userData.height,
                depth: refPiece.userData.depth,
                espesor: refPiece.userData.espesor,
            });
        }
    }, [refPiece, version]);

    useEffect(() => {
        if (refItem == parentRef.current) {
            const parentDimensions = {
                height: refItem.userData.height,
                width: refItem.userData.width,
                depth: refItem.userData.depth,
            }

            const minCascoHeight = parentDimensions.height - (dimensions.espesor * 2)
            const minCascoWidth = parentDimensions.width - (dimensions.espesor * 2)
            const minCascoDepth = parentDimensions.depth - (dimensions.espesor * 2)

            setDimensions({
                    ...dimensions,
                    height: (height) < minCascoHeight && (
                        posicionCaja !== "top" && posicionCaja !== "bottom"
                    ) ? minCascoHeight : height,
                    width: (width) < minCascoWidth && (
                        posicionCaja !== "left" && posicionCaja !== "right"
                    ) ? minCascoWidth : width,
                    depth: depth < minCascoDepth && (
                        posicionCaja === "left" || posicionCaja === "right"
                    ) ? minCascoDepth : depth,

                }
            )
        }

    }, [refItem?.userData]);

    useEffect(() => {
        setDimensions({
            ...dimensions,
            espesor: espesorBase,
        })
    }, [espesorBase]);

    const adjustedWidth = (!disableAdjustedWidth && shape === "trapezoid" && !bordeEjeY) ? dimensions.width - (dimensions.espesor * 2) : dimensions.width;
    // Solo para frontal
    const adjustedHeight = shape === "trapezoid" && bordeEjeY && bordeEjeZ && orientacionBordeZ === "vertical" ? dimensions.height - (dimensions.espesor) : dimensions.height;
    const adjustedDepth = shape === "trapezoid" && !bordeEjeY && bordeEjeZ && orientacionBordeZ === "front" ? dimensions.depth - (dimensions.espesor) : dimensions.depth;

    const triangleZ = position[2] - adjustedDepth / 2;
    const triangleY = (bordeEjeY) ? (position[1] - dimensions.espesor / 2) + (adjustedHeight / 2) + dimensions.espesor / 2 : position[1] - adjustedHeight / 2;

    const firstTriangleShape = (posicionCaja === "bottom" ? "topToRight" : (posicionCaja === "top") ? "bottomToRight" : (posicionCaja === "right" ? "topToRight" : "topToLeft"))
    const secondTriangleShape = (posicionCaja === "bottom" ? "topToLeft" : (posicionCaja === "left" ? "bottomToLeft" : (posicionCaja === "right" ? "bottomToRight" : "bottomToLeft")));

    // Función mejorada para crear geometría de trapezoide
    const createTrapezoidGeometry = () => {
        const halfW = (adjustedWidth + ((posicionCaja !== "right" && posicionCaja !== "left") ? dimensions.espesor : 0)) / 2;
        const halfH = adjustedHeight / 2;
        const halfD = adjustedDepth / 2;

        // Taper hace que la parte superior sea más angosta
        const topW = (posicionCaja === "bottom" ? halfW - (dimensions.espesor / 2) : (posicionCaja === "top" ? halfW + (dimensions.espesor / 2) : halfW - dimensions.espesor));
        const bottomW = (posicionCaja === "bottom" ? halfW + (dimensions.espesor / 2) : (posicionCaja === "top" ? halfW - (dimensions.espesor / 2) : halfW));

        // Crear una geometría de buffer
        const geometry = new THREE.BufferGeometry();

        // Definir los vértices del trapezoide (8 puntos)
        const vertices = new Float32Array([
            // Frontal (cara Z+)
            -bottomW, -halfH, halfD,  // 0: abajo-izquierda
            bottomW, -halfH, halfD,   // 1: abajo-derecha
            topW, halfH, halfD,       // 2: arriba-derecha
            -topW, halfH, halfD,      // 3: arriba-izquierda

            // Posterior (cara Z-)
            -bottomW, -halfH, -halfD, // 4: abajo-izquierda
            bottomW, -halfH, -halfD,  // 5: abajo-derecha
            topW, halfH, -halfD,      // 6: arriba-derecha
            -topW, halfH, -halfD,     // 7: arriba-izquierda
        ]);

        // Definir las caras (triángulos) usando los índices de los vértices
        const indices = [
            // Frontal
            0, 1, 2,
            0, 2, 3,

            // Posterior
            5, 4, 7,
            5, 7, 6,

            // Superior
            3, 2, 6,
            3, 6, 7,

            // Inferior
            4, 5, 1,
            4, 1, 0,

            // Izquierda
            4, 0, 3,
            4, 3, 7,

            // Derecha
            1, 5, 6,
            1, 6, 2
        ];

        // Asignar vértices y caras a la geometría
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);

        // Calcular normales para una iluminación correcta
        geometry.computeVertexNormals();

        return geometry;
    };

    // Efecto para aplicar transformaciones al mesh
    React.useEffect(() => {
        if (ref.current && shape === "trapezoid") {
            ref.current.position.set(position[0], position[1], position[2]);
            ref.current.rotation.set(rotation[0], rotation[1], rotation[2]);
        }
    }, [position, rotation, shape]);


    return (
        <>
            {(shape === "box" || shape === "trapezoid") && (
                <mesh
                    ref={ref}
                    position={position}
                    material={material}
                    rotation={rotation}
                    onClick={(event) => {
                        if (stopPropagation) event.stopPropagation();
                        if (refItem !== parentRef.current) {
                            setRefItem(parentRef.current);
                            setRefPiece(null);
                        } else {
                            setRefPiece(ref.current);
                        }
                    }}
                >
                    <boxGeometry args={[adjustedWidth, adjustedHeight, adjustedDepth]}/>
                </mesh>
            )}

            {/*{shape === "trapezoid" && (
                <mesh
                    ref={ref}
                    geometry={createTrapezoidGeometry()}
                    material={material}
                    onClick={(event) => event.stopPropagation()}
                />
            )}*/}

            {(shape === "trapezoid" && !bordeEjeZ) && (
                <>
                    <BordeTriangular position={[position[0] - dimensions.width / 2, triangleY, triangleZ]}
                                     rotation={[0, 0, 0]} espesor={dimensions.espesor} depth={dimensions.depth}
                                     color={material}
                                     shapeType={firstTriangleShape}
                    />
                    <BordeTriangular
                        position={[(position[0] + dimensions.width / 2) - dimensions.espesor, (triangleY - adjustedHeight) - (bordeEjeY ? dimensions.espesor : -dimensions.espesor), triangleZ]}
                        rotation={[0, 0, 0]} espesor={dimensions.espesor} depth={dimensions.depth} color={material}
                        shapeType={secondTriangleShape}
                    />
                </>
            )}

            {/* Aquí irían los bordes triangulares si fuera necesario */}
        </>
    );
};

export default Tabla;
