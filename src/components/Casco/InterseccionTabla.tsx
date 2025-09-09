import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import Tabla, { TablaProps } from "./Tabla";
import { useIntersectionSizing } from "../../utils/useIntersectionSizing";
import { useMeshUserData } from "../../utils/useMeshUserData";
import InterseccionMueble from "../Interseccion";

export type InterseccionTablaProps = Omit<TablaProps, "shape"> & {
    orientation: "horizontal" | "vertical";
    boundsKey?: string | number;
    uv?: { x: number; y: number };
    interseccion?: InterseccionMueble; // 👈 nuevo
};

export default function InterseccionTabla(props: InterseccionTablaProps) {
    const { orientation, parentRef, espesorBase, position, boundsKey, uv, interseccion } = props;
    const meshRef = useRef<THREE.Mesh | null>(null);
    const { scene } = useThree();

    useMeshUserData(
        meshRef,
        {
            isTabla: true,
            isInterseccion: true,
            orientation,
            groupRootUuid: (parentRef as any).current?.uuid,
            rayOrientation: orientation, // 👈 lo fijamos aquí
        },
        [orientation, (parentRef as any).current?.uuid]
    );

    const { interPos, interDims, neighbors } = useIntersectionSizing({
        meshRef: meshRef as any,
        parentRef: parentRef as any,
        scene: scene as any,
        orientation,
        espesor: espesorBase,
        uv,
    });

    const { width, height } = useMemo(() => {
        if (orientation === "horizontal") return { width: interDims.width ?? props.width, height: espesorBase };
        return { width: espesorBase, height: interDims.height ?? props.height };
    }, [interDims.width, interDims.height, orientation, props.width, props.height, espesorBase]);

    useEffect(() => {
        if (meshRef.current && interseccion && !interseccion.uuid) {
            interseccion.uuid = meshRef.current.uuid;
        }
    }, [interseccion]);

    useEffect(() => {
        if (!meshRef.current) return;
        const norm = (h: any) =>
            h
                ? {
                    uuid: h.uuid,
                    name: h.name,
                    point: h.point.toArray() as [number, number, number],
                    distance: h.distance,
                }
                : null;

        const data = {
            adyacentLeft: norm(neighbors.left),
            adyacentRight: norm(neighbors.right),
            adyacentTop: norm(neighbors.top),
            adyacentBottom: norm(neighbors.bottom),
        };

        meshRef.current.userData.interseccion = {
            ...(meshRef.current.userData.interseccion || {}),
            ...data,
        };

        if (interseccion) {
            Object.assign(interseccion, data);
        }
    }, [neighbors, interseccion]);

    const finalPos: [number, number, number] = interPos
        ? [interPos[0], interPos[1], position[2]]
        : position;

    return (
        <Tabla
            {...props}
            ref={meshRef}
            position={finalPos}
            width={width}
            height={height}
            shape="box"
        />
    );
}