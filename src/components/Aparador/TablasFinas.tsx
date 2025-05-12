import * as React from "react";
import * as THREE from "three";
import '@react-three/fiber';
import BordeTriangular from "../Casco/BordeTriangular";
import {useMaterial} from "../../assets/materials";
import {useEffect, useRef, useState} from "react";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider"
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider"
import {useSelectedCajonProvider} from "../../contexts/SelectedCajonProvider"

//TODO Si hay tanto borde eje Z y eje X hacer que solo se ponga los bordes en el lado frontal del mueble

// Componente para una caja individual
type TablaProps = {
    parentRef: React.Ref<any>;
    insideRef: React.Ref<any>;
    ref?: React.Ref<any>;
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    widthExtra?: number;
    height: number;
    heightExtra?: number;
    depth: number;
    depthExtra?: number;
    material: THREE.Material;
    stopPropagation?: boolean;
    shape: "box" | "trapezoid";
    taperAmount?: number; // Nueva propiedad para controlar cuánto se estrecha

    disableAdjustedWidth?: boolean;
    espesorBase: number;
    posicionCaja?: "top" | "bottom" | "left" | "right";
    bordeEjeY?: boolean;
    bordeEjeZ?: boolean;
    orientacionBordeZ?: "vertical" | "front";
}

const TablaFina: React.FC<TablaProps> = ({
                                         parentRef,
                                         insideRef,
                                         ref = useRef<any>(null),
                                         position,
                                         rotation = [0, 0, 0],
                                         espesorBase,
                                         width,
                                         widthExtra = 0,
                                         height,
                                         heightExtra = 0,
                                         depth,
                                         depthExtra = 0,
                                         material,
                                         shape = "box",
                                         bordeEjeY = true,
                                         bordeEjeZ = false,
                                         posicionCaja = "top",
                                         orientacionBordeZ = "front",
                                         disableAdjustedWidth = false,
                                         stopPropagation = true
                                     }) => {
    const {refItem, setRefItem} = useSelectedItemProvider();
    const {refPiece, setRefPiece, version} = useSelectedPieceProvider();
    const {refCajon, setRefCajon} = useSelectedCajonProvider();

    const initialData = {
        widthExtra,
        heightExtra,
        depthExtra,
        espesor: espesorBase,
    };

    useEffect(() => {
        if (ref.current && Object.keys(ref.current.userData).length === 0) {
            ref.current.userData = { ...initialData };
        }
    }, []);

    useEffect(() => {
        if (ref.current) {
            ref.current.userData = {
                widthExtra,
                heightExtra,
                depthExtra,
                espesor: espesorBase
            };
        }
    }, [widthExtra, heightExtra, depthExtra, espesorBase]);

    const [extra, setExtra] = useState({
        widthExtra: 0,
        heightExtra: 0,
        depthExtra: 0,
        espesor: espesorBase
    });

    useEffect(() => {
        if (refPiece && refPiece === ref.current && refPiece.userData) {
            setExtra({
                widthExtra: refPiece.userData.widthExtra || 0,
                heightExtra: refPiece.userData.heightExtra || 0,
                depthExtra: refPiece.userData.depthExtra || 0,
                espesor: refPiece.userData.espesor || espesorBase
            });
        }
    }, [refPiece, version]);

    width = width + extra.widthExtra;
    height = height + extra.heightExtra;
    depth = depth + extra.depthExtra;
    espesorBase = extra.espesor;

    const adjustedWidth = (!disableAdjustedWidth && shape === "trapezoid" && !bordeEjeY) ? width - (espesorBase * 2) : width;
    // Solo para frontal
    const adjustedHeight = shape === "trapezoid" && bordeEjeY && bordeEjeZ && orientacionBordeZ === "vertical" ? height - (espesorBase) : height;
    const adjustedDepth = shape === "trapezoid" && !bordeEjeY && bordeEjeZ && orientacionBordeZ === "front" ? depth - (espesorBase) : depth;

    const triangleZ = position[2] - depth / 2;
    const triangleY = (bordeEjeY) ? (position[1] - espesorBase / 2) + (adjustedHeight / 2) + espesorBase / 2 : position[1] - adjustedHeight / 2;

    const firstTriangleShape = (posicionCaja === "bottom" ? "topToRight" : (posicionCaja === "top") ? "bottomToRight" : (posicionCaja === "right" ? "topToRight" : "topToLeft"))
    const secondTriangleShape = (posicionCaja === "bottom" ? "topToLeft" : (posicionCaja === "left" ? "bottomToLeft" : (posicionCaja === "right" ? "bottomToRight" : "bottomToLeft")));

    // Efecto para aplicar transformaciones al mesh
    React.useEffect(() => {
        if (ref.current && shape === "trapezoid") {
            ref.current.position.set(position[0], position[1], position[2]);
            ref.current.rotation.set(rotation[0], rotation[1], rotation[2]);
        }
    }, [position, rotation, shape]);

    const createTablaFinaGeometry = (width: number, height: number, depth: number) => {
        const geometry = new THREE.BufferGeometry();
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;

        const positions = new Float32Array([
            // Front
            -hw, -hh,  hd,   hw, -hh,  hd,   hw,  hh,  hd,  -hw,  hh,  hd,
            // Back
            hw, -hh, -hd,  -hw, -hh, -hd,  -hw,  hh, -hd,   hw,  hh, -hd,
            // Top
            -hw,  hh,  hd,   hw,  hh,  hd,   hw,  hh, -hd,  -hw,  hh, -hd,
            // Bottom
            -hw, -hh, -hd,   hw, -hh, -hd,   hw, -hh,  hd,  -hw, -hh,  hd,
            // Right
            hw, -hh,  hd,   hw, -hh, -hd,   hw,  hh, -hd,   hw,  hh,  hd,
            // Left
            -hw, -hh, -hd,  -hw, -hh,  hd,  -hw,  hh,  hd,  -hw,  hh, -hd,
        ]);

        const indices = [];
        for (let i = 0; i < 6; i++) {
            const offset = i * 4;
            indices.push(
                offset, offset + 1, offset + 2,
                offset, offset + 2, offset + 3
            );
        }

        const faceDims = [
            [width, height], // front
            [width, height], // back
            [width, depth],  // top
            [width, depth],  // bottom
            [depth, height], // right
            [depth, height], // left
        ];

        const uvs = [];

        for (let i = 0; i < 6; i++) {
            const [u, v] = faceDims[i];
            uvs.push(
                0, 0,
                u, 0,
                u, v,
                0, v
            );
        }

        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs.flat()), 2));
        geometry.computeVertexNormals();

        return geometry;
    };

    return (
        <>
            {(shape === "box" || shape === "trapezoid") && (
                <mesh
                    ref={ref}
                    position={position}
                    material={material}
                    rotation={rotation}
                    geometry={createTablaFinaGeometry(adjustedWidth, adjustedHeight, adjustedDepth)}
                    onClick={(event) => {
                        if (stopPropagation) event.stopPropagation();
                        if (refItem?.groupRef !== parentRef.current) {
                            setRefPiece(null);
                            setRefCajon(null);
                            setRefItem({ groupRef: parentRef.current, detectionRef: insideRef.current });
                        }
                        else {
                            setRefPiece(ref.current);
                            setRefCajon(null);
                        }
                    }}
                >
                </mesh>
            )}

            {(shape === "trapezoid" && !bordeEjeZ) && (
                <>
                    <BordeTriangular position={[position[0] - width / 2, triangleY, triangleZ]}
                                     rotation={[0, 0, 0]} espesor={espesorBase} depth={depth} color={material}
                                     shapeType={firstTriangleShape}
                    />
                    <BordeTriangular
                        position={[(position[0] + width / 2) - espesorBase, (triangleY - adjustedHeight) - (bordeEjeY ? espesorBase : -espesorBase), triangleZ]}
                        rotation={[0, 0, 0]} espesor={espesorBase} depth={depth} color={material}
                        shapeType={secondTriangleShape}
                    />
                </>
            )}
        </>
    );
};

export default TablaFina;
