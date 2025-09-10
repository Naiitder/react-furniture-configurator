import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import Tabla, { TablaProps } from "./Tabla";
import { useIntersectionSizing } from "../../utils/useIntersectionSizing";
import { useMeshUserData } from "../../utils/useMeshUserData";
import InterseccionMueble from "../Interseccion";
import { useSelectedPieceProvider } from "../../contexts/SelectedPieceProvider"; // 👈 nuevo

export type InterseccionTablaProps = Omit<TablaProps, "shape"> & {
    orientation: "horizontal" | "vertical";
    uv?: { x: number; y: number };
    interseccion?: InterseccionMueble;
};

export default function InterseccionTabla(props: InterseccionTablaProps) {
    const { orientation, parentRef, espesorBase, position, uv, interseccion } = props;
    const meshRef = useRef<THREE.Mesh | null>(null);
    const { scene } = useThree();
    const { version } = useSelectedPieceProvider(); // 👈 escucha cambios de sliders

    useMeshUserData(
        meshRef,
        {
            isTabla: true,
            isInterseccion: true,
            orientation,
            groupRootUuid: (parentRef as any).current?.uuid,
            rayOrientation: orientation,
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
                    localPoint: h.localPoint.toArray() as [number, number, number],
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

        if (interseccion) Object.assign(interseccion, data);
    }, [neighbors, interseccion]);

    // 👉 El slider marca la posición REAL: usamos esos valores tal cual (con clamp).
    const finalPos: [number, number, number] = useMemo(() => {
        const ud = meshRef.current?.userData || {};

        const Lx = neighbors.left?.localPoint?.[0];
        const Rx = neighbors.right?.localPoint?.[0];
        const By = neighbors.bottom?.localPoint?.[1];
        const Ty = neighbors.top?.localPoint?.[1];

        const clamp = (v: number | undefined, a?: number, b?: number) => {
            if (typeof v !== "number") return v as any;
            if (a == null || b == null) return v;
            const lo = Math.min(a, b);
            const hi = Math.max(a, b);
            return Math.min(Math.max(v, lo), hi);
        };

        const desiredX = (typeof ud.positionX === "number" ? ud.positionX : ud.positionExtra?.[0]);
        const desiredY = (typeof ud.positionY === "number" ? ud.positionY : ud.positionExtra?.[1]);

        const baseX = interPos ? interPos[0] : position[0];
        const baseY = interPos ? interPos[1] : position[1];

        const x = (typeof desiredX === "number") ? clamp(desiredX, Lx, Rx) : baseX;
        const y = (typeof desiredY === "number") ? clamp(desiredY, By, Ty) : baseY;

        // (opcional) reflejar el clamp en userData para que la UI siempre coincida
        if (meshRef.current) {
            if (typeof x === "number") meshRef.current.userData.positionX = x;
            if (typeof y === "number") meshRef.current.userData.positionY = y;
        }

        return [x, y, position[2]] as [number, number, number];
        // Re-render cuando cambian sliders (version), límites o la posición base del hook
    }, [version, neighbors.left?.localPoint, neighbors.right?.localPoint, neighbors.top?.localPoint, neighbors.bottom?.localPoint, interPos?.[0], interPos?.[1], position[0], position[1], position[2]]);

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