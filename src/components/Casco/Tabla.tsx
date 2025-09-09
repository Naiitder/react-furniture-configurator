import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider";
import { useSelectedPieceProvider } from "../../contexts/SelectedPieceProvider";
import { useSelectedCajonProvider } from "../../contexts/SelectedCajonProvider";
import BordeTriangular from "./BordeTriangular";

export type TablaProps = {
    parentRef: React.Ref<any>;
    insideRef: React.Ref<any>;
    ref?: React.Ref<any>;
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    material: THREE.Material;
    shape?: "box" | "trapezoid";
    espesorBase: number;
    posicionCaja?: "top" | "bottom" | "left" | "right";
    bordeEjeY?: boolean;
    bordeEjeZ?: boolean;
    orientacionBordeZ?: "vertical" | "front";
    disableAdjustedWidth?: boolean;
    stopPropagation?: boolean;
};

// ---------- Helpers ----------
function rayOrientationFor(posicionCaja?: "top" | "bottom" | "left" | "right") {
    if (posicionCaja === "left" || posicionCaja === "right") return "vertical";
    if (posicionCaja === "top" || posicionCaja === "bottom") return "horizontal";
    return undefined;
}

function createTablaFinaGeometry(width: number, height: number, depth: number) {
    const geometry = new THREE.BufferGeometry();
    const hw = width / 2, hh = height / 2, hd = depth / 2;

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

    const indices: number[] = [];
    for (let i = 0; i < 6; i++) {
        const o = i * 4;
        indices.push(o, o + 1, o + 2, o, o + 2, o + 3);
    }

    const faceDims: [number, number][] = [
        [width, height], // front
        [width, height], // back
        [width, depth],  // top
        [width, depth],  // bottom
        [depth, height], // right
        [depth, height], // left
    ];

    const uvs: number[] = [];
    for (let i = 0; i < 6; i++) {
        const [u, v] = faceDims[i];
        uvs.push(0, 0, u, 0, u, v, 0, v);
    }

    geometry.setIndex(indices);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geometry.computeVertexNormals();
    return geometry;
}

function createTrapezoidGeometry(
    width: number,
    height: number,
    depth: number,
    espesorBase: number,
    posicionCaja: "top" | "bottom" | "left" | "right"
) {
    const adjustedWidth = width;
    const adjustedHeight = height;
    const adjustedDepth = depth;

    const halfW = (adjustedWidth + (posicionCaja !== "right" && posicionCaja !== "left" ? espesorBase : 0)) / 2;
    const halfH = adjustedHeight / 2;
    const halfD = adjustedDepth / 2;

    const topW = posicionCaja === "bottom" ? halfW - espesorBase / 2 : posicionCaja === "top" ? halfW + espesorBase / 2 : halfW - espesorBase;
    const bottomW = posicionCaja === "bottom" ? halfW + espesorBase / 2 : posicionCaja === "top" ? halfW - espesorBase / 2 : halfW;

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        // Front Z+
        -bottomW, -halfH, halfD,
        bottomW, -halfH, halfD,
        topW, halfH, halfD,
        -topW, halfH, halfD,
        // Back Z-
        -bottomW, -halfH, -halfD,
        bottomW, -halfH, -halfD,
        topW, halfH, -halfD,
        -topW, halfH, -halfD,
    ]);

    const indices = [
        0, 1, 2, 0, 2, 3, // front
        5, 4, 7, 5, 7, 6, // back
        3, 2, 6, 3, 6, 7, // top
        4, 5, 1, 4, 1, 0, // bottom
        4, 0, 3, 4, 3, 7, // left
        1, 5, 6, 1, 6, 2, // right
    ];

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

const Tabla: React.FC<TablaProps> = ({
                                         parentRef,
                                         insideRef,
                                         ref: extRef,
                                         position,
                                         rotation = [0, 0, 0],
                                         width,
                                         height,
                                         depth,
                                         material,
                                         shape = "box",
                                         espesorBase,
                                         posicionCaja = "top",
                                         bordeEjeY = true,
                                         bordeEjeZ = false,
                                         orientacionBordeZ = "front",
                                         disableAdjustedWidth = false,
                                         stopPropagation = true,
                                     }) => {
    const localRef = useRef<THREE.Mesh | null>(null);
    const ref = (extRef as React.MutableRefObject<THREE.Mesh | null>) ?? localRef;

    const { refItem, setRefItem } = useSelectedItemProvider();
    const { setRefPiece } = useSelectedPieceProvider();
    const { setRefCajon } = useSelectedCajonProvider();

    useEffect(() => {
        if (!ref.current) return;
        ref.current.userData.isTabla = true;
        ref.current.userData.groupRootUuid = (parentRef as any).current?.uuid;
        const prev = ref.current.userData?.rayOrientation;
        ref.current.userData.rayOrientation = prev ?? rayOrientationFor(posicionCaja);
    }, [parentRef, posicionCaja]);

    const adjustedWidth = useMemo(() => {
        if (shape !== "trapezoid" || bordeEjeY) return width;
        return disableAdjustedWidth ? width : width - espesorBase * 2;
    }, [shape, bordeEjeY, width, espesorBase, disableAdjustedWidth]);

    const adjustedHeight = useMemo(() => {
        if (shape === "trapezoid" && bordeEjeY && bordeEjeZ && orientacionBordeZ === "vertical") return height - espesorBase;
        return height;
    }, [shape, bordeEjeY, bordeEjeZ, orientacionBordeZ, height, espesorBase]);

    const adjustedDepth = useMemo(() => {
        if (shape === "trapezoid" && !bordeEjeY && bordeEjeZ && orientacionBordeZ === "front") return depth - espesorBase;
        return depth;
    }, [shape, bordeEjeY, bordeEjeZ, orientacionBordeZ, depth, espesorBase]);

    const geometry = useMemo(() => {
        return shape === "trapezoid"
            ? createTrapezoidGeometry(adjustedWidth, adjustedHeight, adjustedDepth, espesorBase, posicionCaja)
            : createTablaFinaGeometry(adjustedWidth, adjustedHeight, adjustedDepth);
    }, [shape, adjustedWidth, adjustedHeight, adjustedDepth, espesorBase, posicionCaja]);

    const triangleZ = position[2] - depth / 2;
    const triangleY = bordeEjeY ? position[1] - espesorBase / 2 + adjustedHeight / 2 + espesorBase / 2 : position[1] - adjustedHeight / 2;

    const firstTriangleShape = posicionCaja === "bottom" ? "topToRight" : posicionCaja === "top" ? "bottomToRight" : posicionCaja === "right" ? "topToRight" : "topToLeft";
    const secondTriangleShape = posicionCaja === "bottom" ? "topToLeft" : posicionCaja === "left" ? "bottomToLeft" : posicionCaja === "right" ? "bottomToRight" : "bottomToLeft";

    if (!position || position.some(isNaN) || !width || isNaN(width) || !height || isNaN(height) || !depth || isNaN(depth)) {
        console.error("❌ Tabla con props inválidas", { position, width, height, depth });
        return null;
    }

    return (
        <>
            <mesh
                castShadow
                receiveShadow
                ref={ref as any}
                position={position}
                rotation={rotation}
                material={material}
                geometry={geometry}
                onClick={(event) => {
                    if (stopPropagation) event.stopPropagation();
                    if (refItem?.groupRef !== (parentRef as any).current) {
                        setRefPiece(null);
                        setRefCajon(null);
                        setRefItem({ groupRef: (parentRef as any).current, detectionRef: (insideRef as any).current });
                    } else {
                        setRefPiece(ref.current as any);
                        setRefCajon(null);
                    }
                }}
            >
                <Edges threshold={15} color={"black"} linewidth={1} />
            </mesh>

            {shape === "trapezoid" && !bordeEjeZ && (
                <>
                    <BordeTriangular
                        position={[position[0] - width / 2, triangleY, triangleZ] as [number, number, number]}
                        rotation={[0, 0, 0]}
                        espesor={espesorBase}
                        depth={depth}
                        color={material}
                        shapeType={firstTriangleShape as any}
                    />
                    <BordeTriangular
                        position={[(position[0] + width / 2) - espesorBase, triangleY - adjustedHeight - (bordeEjeY ? espesorBase : -espesorBase), triangleZ] as [number, number, number]}
                        rotation={[0, 0, 0]}
                        espesor={espesorBase}
                        depth={depth}
                        color={material}
                        shapeType={secondTriangleShape as any}
                    />
                </>
            )}
        </>
    );
};

export default Tabla;