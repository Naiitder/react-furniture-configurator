import * as React from "react";
import * as THREE from "three";
import '@react-three/fiber';
import BordeTriangular from "./BordeTriangular";
import {useEffect, useRef, useState} from "react";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider"
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider"
import {useSelectedCajonProvider} from "../../contexts/SelectedCajonProvider"
import {Edges} from "@react-three/drei";

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

    isInterseccion?: boolean;
    orientation?: "vertical" | "horizontal";
}

const Tabla: React.FC<TablaProps> = ({
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
                                         stopPropagation = true,
                                         isInterseccion = false,
                                         orientation
                                     }) => {
    const {refItem, setRefItem} = useSelectedItemProvider();
    const {refPiece, setRefPiece, version} = useSelectedPieceProvider();
    const {refCajon, setRefCajon} = useSelectedCajonProvider();

    const shootRaycasts = (): {
        arriba?: THREE.Object3D;
        abajo?: THREE.Object3D;
        derecha?: THREE.Object3D;
        izquierda?: THREE.Object3D;
    } | undefined => {
        if (!ref.current || !parentRef.current) return;
        if (ref.current.userData?.isInterseccion === false) return;

        const objectsToIntersect: THREE.Object3D[] = [];
        parentRef.current.traverse(child => {
            if (child.isMesh && child !== ref.current && child.userData.espesor !== undefined) {
                objectsToIntersect.push(child);
            }
        });

        if (objectsToIntersect.length === 0) return;

        const worldPosition = new THREE.Vector3();
        ref.current.getWorldPosition(worldPosition);

        const epsilon = 0.001;

        const originUp = new THREE.Vector3(worldPosition.x, worldPosition.y + adjustedHeight / 2 + epsilon, worldPosition.z);
        const originDown = new THREE.Vector3(worldPosition.x, worldPosition.y - adjustedHeight / 2 - epsilon, worldPosition.z);
        const originRight = new THREE.Vector3(worldPosition.x + adjustedWidth / 2 + epsilon, worldPosition.y, worldPosition.z);
        const originLeft = new THREE.Vector3(worldPosition.x - adjustedWidth / 2 - epsilon, worldPosition.y, worldPosition.z);

        const upRay = new THREE.Raycaster(originUp, new THREE.Vector3(0, 1, 0));
        const downRay = new THREE.Raycaster(originDown, new THREE.Vector3(0, -1, 0));
        const rightRay = new THREE.Raycaster(originRight, new THREE.Vector3(1, 0, 0));
        const leftRay = new THREE.Raycaster(originLeft, new THREE.Vector3(-1, 0, 0));

        const upHits = upRay.intersectObjects(objectsToIntersect);
        const downHits = downRay.intersectObjects(objectsToIntersect);
        const rightHits = rightRay.intersectObjects(objectsToIntersect);
        const leftHits = leftRay.intersectObjects(objectsToIntersect);

        // Deduplicate hits by object uuid
        const uniqueUpHits = upHits.reduce((acc, hit) => {
            if (!acc.some(h => h.object.uuid === hit.object.uuid)) {
                acc.push(hit);
            }
            return acc;
        }, []);
        const uniqueDownHits = downHits.reduce((acc, hit) => {
            if (!acc.some(h => h.object.uuid === hit.object.uuid)) {
                acc.push(hit);
            }
            return acc;
        }, []);
        const uniqueRightHits = rightHits.reduce((acc, hit) => {
            if (!acc.some(h => h.object.uuid === hit.object.uuid)) {
                acc.push(hit);
            }
            return acc;
        }, []);
        const uniqueLeftHits = leftHits.reduce((acc, hit) => {
            if (!acc.some(h => h.object.uuid === hit.object.uuid)) {
                acc.push(hit);
            }
            return acc;
        }, []);

        const result = {
            arriba: uniqueUpHits[0]?.object,
            abajo: uniqueDownHits[0]?.object,
            derecha: uniqueRightHits[0]?.object,
            izquierda: uniqueLeftHits[0]?.object
        };

        console.log(`--- Raycast Results for: ${ref.current.uuid} ---`);
        console.log(result);
        console.log("ALL HITS TO ABOVE:", uniqueUpHits);
        console.log("ALL HITS TO BELOW:", uniqueDownHits);
        console.log("ALL HITS TO RIGHT:", uniqueRightHits);
        console.log("ALL HITS TO LEFT:", uniqueLeftHits);
        console.log("-----------------------------------------");

        return result;
    };

    const initialData = {
        widthExtra,
        heightExtra,
        depthExtra,
        espesor: espesorBase,
        isInterseccion: isInterseccion,
        orientation: orientation,
        shootRaycasts
    };


    useEffect(() => {
        if (ref.current && Object.keys(ref.current.userData).length === 0) {
            ref.current.userData = {...initialData};
        }
    }, []);

    useEffect(() => {
        if (ref.current) {
            ref.current.userData = {
                widthExtra,
                heightExtra,
                depthExtra,
                espesor: espesorBase,
                ...ref.current.userData
            };
        }
    }, [widthExtra, heightExtra, depthExtra, espesorBase]);

    const [extra, setExtra] = useState({
        widthExtra: 0,
        heightExtra: 0,
        depthExtra: 0,
        espesor: espesorBase,
        isinterseccion: isInterseccion,
        orientation: orientation,
        shootRaycasts
    });

    useEffect(() => {
        if (refPiece && refPiece === ref.current && refPiece.userData) {
            setExtra({
                widthExtra: refPiece.userData.widthExtra || 0,
                heightExtra: refPiece.userData.heightExtra || 0,
                depthExtra: refPiece.userData.depthExtra || 0,
                espesor: refPiece.userData.espesor || espesorBase,
                isinterseccion: refPiece.userData.isinterseccion || isInterseccion,
                orientation: refPiece.userData.orientation || orientation,
                shootRaycasts
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

    // Función mejorada para crear geometría de trapezoide
    const createTrapezoidGeometry = () => {
        const halfW = (adjustedWidth + ((posicionCaja !== "right" && posicionCaja !== "left") ? espesorBase : 0)) / 2;
        const halfH = adjustedHeight / 2;
        const halfD = adjustedDepth / 2;

        // Taper hace que la parte superior sea más angosta
        const topW = (posicionCaja === "bottom" ? halfW - (espesorBase / 2) : (posicionCaja === "top" ? halfW + (espesorBase / 2) : halfW - espesorBase));
        const bottomW = (posicionCaja === "bottom" ? halfW + (espesorBase / 2) : (posicionCaja === "top" ? halfW - (espesorBase / 2) : halfW));

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


    const createTablaFinaGeometry = (width: number, height: number, depth: number) => {
        const geometry = new THREE.BufferGeometry();
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;

        const positions = new Float32Array([
            // Front
            -hw, -hh, hd, hw, -hh, hd, hw, hh, hd, -hw, hh, hd,
            // Back
            hw, -hh, -hd, -hw, -hh, -hd, -hw, hh, -hd, hw, hh, -hd,
            // Top
            -hw, hh, hd, hw, hh, hd, hw, hh, -hd, -hw, hh, -hd,
            // Bottom
            -hw, -hh, -hd, hw, -hh, -hd, hw, -hh, hd, -hw, -hh, hd,
            // Right
            hw, -hh, hd, hw, -hh, -hd, hw, hh, -hd, hw, hh, hd,
            // Left
            -hw, -hh, -hd, -hw, -hh, hd, -hw, hh, hd, -hw, hh, -hd,
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
                    castShadow={true}
                    receiveShadow={true}
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
                            setRefItem({groupRef: parentRef.current, detectionRef: insideRef.current});
                        } else {
                            setRefPiece(ref.current);
                            setRefCajon(null);
                        }
                    }}
                >
                    <Edges threshold={15} color={"black"} linewidth={0.5}/>

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

            {/* Aquí irían los bordes triangulares si fuera necesario */}
        </>
    );
};

export default Tabla;
