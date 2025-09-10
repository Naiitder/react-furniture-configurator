// utils/useIntersectionSizing.ts
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AnyRef } from "./useMeshUserData";

export type Orientation = "horizontal" | "vertical";

export interface Neighbors {
    left: any | null;
    right: any | null;
    top: any | null;
    bottom: any | null;
}

export function useIntersectionSizing(opts: {
    meshRef: AnyRef;
    parentRef: AnyRef;
    scene: THREE.Scene;
    orientation: Orientation;
    espesor: number;
    uv?: { x: number; y: number };
}) {
    const { meshRef, parentRef, scene, orientation, espesor } = opts;

    const [interPos, setInterPos] = useState<[number, number, number] | null>(null);
    const [interDims, setInterDims] = useState<{ width?: number; height?: number }>({});
    const [neighbors, setNeighbors] = useState<Neighbors>({
        left: null,
        right: null,
        top: null,
        bottom: null
    });

    const placedOnceRef = useRef(false);
    const raycasterRef = useRef(new THREE.Raycaster());

    useEffect(() => {
        const me = meshRef.current as unknown as THREE.Object3D | null;
        if (!me) return;

        const parent = me.parent as THREE.Object3D | null;

        const isUnderSameRoot = (obj: THREE.Object3D, rootUuid?: string) => {
            if (!rootUuid) return false;
            let p: THREE.Object3D | null = obj;
            while (p) {
                if ((p as any).uuid === rootUuid) return true;
                p = p.parent;
            }
            return false;
        };

        const collectAllTablas = (rootUuid?: string) => {
            const list: THREE.Object3D[] = [];
            scene.traverse((o) => {
                const isMesh = (o as any).isMesh === true;
                if (
                    isMesh &&
                    o !== me &&
                    !(o as any).userData?.ignoreRaycast &&
                    (o as any).userData?.isTabla === true &&
                    isUnderSameRoot(o, rootUuid)
                ) {
                    list.push(o);
                }
            });
            return list;
        };

        const cast = (
            from: THREE.Vector3,
            dir: THREE.Vector3,
            targets: THREE.Object3D[],
            parentForLocal?: THREE.Object3D | null
        ) => {
            const rc = raycasterRef.current;
            rc.set(from, dir);
            const res = rc.intersectObjects(targets, true);
            if (!res.length) return null as any;

            const h = res[0];
            const worldPoint = h.point.clone();
            const localPoint = parentForLocal
                ? parentForLocal.worldToLocal(worldPoint.clone())
                : worldPoint.clone();

            return {
                distance: h.distance,
                point: worldPoint,
                uuid: h.object.uuid,
                name: h.object.name,
                localPoint,
            };
        };

        const avg = (a?: number, b?: number, fb?: number) => {
            const xs = [a, b].filter((n) => typeof n === "number" && isFinite(n)) as number[];
            if (xs.length === 2) return (xs[0] + xs[1]) / 2;
            if (xs.length === 1 && typeof fb === "number") return (xs[0] + fb) / 2;
            return fb!;
        };

        const compute = () => {
            scene.updateMatrixWorld(true);

            const origin = me.getWorldPosition(new THREE.Vector3());
            const eps = 0.001;

            const allTargets = collectAllTablas((parentRef.current as any)?.uuid);
            const targetsLR = allTargets.filter((o) => (o as any).userData?.rayOrientation === "vertical");
            const targetsUD = allTargets.filter((o) => (o as any).userData?.rayOrientation === "horizontal");

            const left  = cast(origin.clone().addScaledVector(new THREE.Vector3(-1, 0, 0), eps), new THREE.Vector3(-1, 0, 0), targetsLR, parent);
            const right = cast(origin.clone().addScaledVector(new THREE.Vector3( 1, 0, 0), eps), new THREE.Vector3( 1, 0, 0), targetsLR, parent);
            const down  = cast(origin.clone().addScaledVector(new THREE.Vector3(0,-1, 0), eps), new THREE.Vector3(0,-1, 0), targetsUD, parent);
            const up    = cast(origin.clone().addScaledVector(new THREE.Vector3(0, 1, 0), eps), new THREE.Vector3(0, 1, 0), targetsUD, parent);

            setNeighbors({ left, right, top: up, bottom: down });

            // --- DIMENSIONES (igual que tenías) ---
            if (orientation === "horizontal" && left?.localPoint && right?.localPoint) {
                const wLocal = Math.abs(right.localPoint.x - left.localPoint.x);
                if (wLocal > 0 && isFinite(wLocal)) setInterDims({ width: wLocal, height: espesor });
            } else if (orientation === "vertical" && down?.localPoint && up?.localPoint) {
                const hLocal = Math.abs(up.localPoint.y - down.localPoint.y);
                if (hLocal > 0 && isFinite(hLocal)) setInterDims({ height: hLocal, width: espesor });
            }

            // --- POSICIÓN: SIEMPRE CENTRO ENTRE PARES ---
            const toLocal = (v: THREE.Vector3) => (parent ? parent.worldToLocal(v.clone()) : v);

            // X = centro entre L/R (si existen), con fallback razonable
            const cxWorld = avg(left?.point?.x, right?.point?.x, origin.x);
            // Y = centro entre D/U (si existen), con fallback razonable
            const cyWorld = avg(down?.point?.y, up?.point?.y, origin.y);

            // Convertimos ambos al mismo espacio local del padre
            const cxLocal = toLocal(new THREE.Vector3(cxWorld, origin.y, origin.z)).x;
            const cyLocal = toLocal(new THREE.Vector3(origin.x, cyWorld, origin.z)).y;

            setInterPos([cxLocal, cyLocal, origin.z]);

            // userData informativo (como hacías)
            if (meshRef.current) {
                meshRef.current.userData.positionX = cxLocal;
                meshRef.current.userData.positionY = cyLocal;
                meshRef.current.userData.orientation = orientation;
                meshRef.current.userData.isInterseccion = true;
            }

            placedOnceRef.current = true;
        };

        // triple pasada, como en tu original
        compute();
        requestAnimationFrame(() => {
            compute();
            requestAnimationFrame(() => {
                compute();
            });
        });
    }, [scene, orientation, espesor, parentRef, meshRef]);

    return { interPos, setInterPos, interDims, neighbors, placedOnceRef };
}