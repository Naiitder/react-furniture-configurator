import * as React from "react";
import * as THREE from "three";
import '@react-three/fiber';
import BordeTriangular from "./BordeTriangular";
import {useEffect, useRef, useState} from "react";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider"
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider"
import {useSelectedCajonProvider} from "../../contexts/SelectedCajonProvider"
import {Edges} from "@react-three/drei";
import InterseccionMueble from "../Interseccion";
import { useThree } from '@react-three/fiber';
import { MathUtils } from 'three';

//TODO Si hay tanto borde eje Z y eje X hacer que solo se ponga los bordes en el lado frontal del mueble

// Componente para una caja individual
type TablaProps = {
    parentRef: React.Ref<any>;
    insideRef: React.Ref<any>;
    ref?: React.Ref<any>;
    position: [number, number, number];
    positionExtra?: [number, number, number];
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
    interseccion?: InterseccionMueble;
    orientation?: "vertical" | "horizontal";
    boundsKey?: string;
    followAbsolutePosition?: boolean;
}

const Tabla: React.FC<TablaProps> = ({
                                         parentRef,
                                         insideRef,
                                         ref = useRef<any>(null),
                                         position,
                                         positionExtra,
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
                                         orientation,
                                         interseccion,
                                         boundsKey,
                                         followAbsolutePosition = !isInterseccion,
                                     }) => {
    const {refItem, setRefItem} = useSelectedItemProvider();
    const {refPiece, setRefPiece, version} = useSelectedPieceProvider();
    const {refCajon, setRefCajon} = useSelectedCajonProvider();
    const { scene } = useThree();


    const initialData = {
        positionExtra: isInterseccion ? [0.5, 0.5, position[2]] : position,
        widthExtra,
        heightExtra,
        depthExtra,
        espesor: espesorBase,
        isInterseccion: isInterseccion,
        interseccion: interseccion,
        orientation: orientation,
    };



    useEffect(() => {
        if (ref.current && Object.keys(ref.current.userData).length === 0) {
            ref.current.userData = {...initialData};
        }
    }, []);

    useEffect(() => {
        if (ref.current && interseccion) {
            interseccion.uuid = ref.current.uuid;
        }
    }, []);


    useEffect(() => {
        if (!ref.current) return;
        ref.current.userData = {
            ...ref.current.userData,
            ...(isInterseccion ? {} : { positionExtra: position }),
            widthExtra,
            heightExtra,
            depthExtra,
            espesor: espesorBase,
        };
    }, [isInterseccion, position, widthExtra, heightExtra, depthExtra, espesorBase]);

    const [extra, setExtra] = useState({
        positionExtra: isInterseccion ? [0.5, 0.5, position[2]] : position,
        widthExtra: 0,
        heightExtra: 0,
        depthExtra: 0,
        espesor: espesorBase,
        isinterseccion: isInterseccion,
        interseccion: interseccion,
        orientation: orientation,
    });

    useEffect(() => {
        if (refPiece && refPiece === ref.current && refPiece.userData) {
            setExtra({
                positionExtra: refPiece.userData.positionExtra || position,
                widthExtra: refPiece.userData.widthExtra || 0,
                heightExtra: refPiece.userData.heightExtra || 0,
                depthExtra: refPiece.userData.depthExtra || 0,
                espesor: refPiece.userData.espesor || espesorBase,
                isinterseccion: refPiece.userData.isinterseccion || isInterseccion,
                interseccion: refPiece.userData.interseccion || interseccion,
                orientation: refPiece.userData.orientation || orientation,
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

    if (
        !position || position.some(isNaN) ||
        !width || isNaN(width) ||
        !height || isNaN(height) ||
        !depth || isNaN(depth)
    ) {
        console.log(position);
        console.error("❌ Tabla con props inválidas", {position, width, height, depth});
        return null;
    }

    const [interPos, setInterPos] = useState<[number, number, number] | null>(null);
    const [interDims, setInterDims] = useState<{ width?: number; height?: number }>({});
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const placedOnceRef = useRef(false);

    const rayOrientation =
        isInterseccion
            ? orientation
            : (posicionCaja === "left" || posicionCaja === "right")
                ? "vertical"
                : (posicionCaja === "top" || posicionCaja === "bottom")
                    ? "horizontal"
                    : undefined;

    useEffect(() => {
        if (!ref.current) return;
        ref.current.userData.isTabla = true;
        ref.current.userData.groupRootUuid = parentRef.current?.uuid;
        ref.current.userData.rayOrientation = rayOrientation;
    }, [parentRef, rayOrientation]);

    useEffect(() => {
        if (!isInterseccion || !ref.current) return;

        const me = ref.current as THREE.Mesh;
        const parent = me.parent as THREE.Object3D | null;

        me.userData.isTabla = true;

        const isUnderSameRoot = (obj: THREE.Object3D, rootUuid?: string) => {
            if (!rootUuid) return false;
            let p: THREE.Object3D | null = obj;
            while (p) { if ((p as any).uuid === rootUuid) return true; p = p.parent; }
            return false;
        };

        const collectAllTablas = (me: THREE.Object3D) => {
            const list: THREE.Object3D[] = [];
            scene.traverse((o) => {
                const isMesh = (o as any).isMesh === true;
                if (
                    isMesh &&
                    o !== me &&
                    !(o as any).userData?.ignoreRaycast &&
                    (o as any).userData?.isTabla === true &&
                    isUnderSameRoot(o, parentRef.current?.uuid)
                ) list.push(o);
            });
            return list;
        };


        const cast = (from: THREE.Vector3, dir: THREE.Vector3, targets: THREE.Object3D[]) => {
            let value = {};
            const rc = raycasterRef.current;
            rc.set(from, dir);
            const res = rc.intersectObjects(targets, true);
            if (res.length) {
                const h = res[0];
                value = {
                    distance: h.distance,
                    point: h.point,
                    uuid: h.object.uuid,
                    name: h.object.name,
                };
            } else {
                value = null;
            }
            return value;
        };

        const computeAndApply = () => {
            scene.updateMatrixWorld(true);

            const origin = me.getWorldPosition(new THREE.Vector3());
            const epsilon = 0.001;

            const allTargets = collectAllTablas(me);

            const targetsLR = allTargets.filter(o => (o as any).userData?.rayOrientation === "vertical");
            const targetsUD = allTargets.filter(o => (o as any).userData?.rayOrientation === "horizontal");

            const resLeft  = cast(origin.clone().addScaledVector(new THREE.Vector3(-1,0,0), epsilon), new THREE.Vector3(-1,0,0), targetsLR);
            const resRight = cast(origin.clone().addScaledVector(new THREE.Vector3( 1,0,0), epsilon), new THREE.Vector3( 1,0,0), targetsLR);
            const resDown  = cast(origin.clone().addScaledVector(new THREE.Vector3(0,-1,0), epsilon), new THREE.Vector3(0,-1,0), targetsUD);
            const resUp    = cast(origin.clone().addScaledVector(new THREE.Vector3(0, 1,0), epsilon), new THREE.Vector3(0, 1,0), targetsUD);

            const avg = (a?: number, b?: number, fb?: number) => {
                const xs = [a, b].filter(n => typeof n === "number" && isFinite(n)) as number[];
                if (xs.length === 2) return (xs[0] + xs[1]) / 2;
                if (xs.length === 1 && typeof fb === "number") return (xs[0] + fb) / 2;
                return fb!;
            };

            const centerXWorld = avg(resLeft?.point?.x,  resRight?.point?.x, origin.x);
            const centerYWorld = avg(resDown?.point?.y,  resUp?.point?.y,   origin.y);
            const centerWorld  = new THREE.Vector3(centerXWorld, centerYWorld, origin.z);
            const centerLocal  = parent ? parent.worldToLocal(centerWorld.clone()) : centerWorld;

            if(!placedOnceRef.current) setInterPos([centerLocal.x, centerLocal.y, position[2]]);
            console.log("a");

            interseccion.adyacentRight = resRight;
            interseccion.adyacentTop = resUp;
            interseccion.adyacentLeft = resLeft;
            interseccion.adyacentBottom = resDown;

            const norm = (h:any) => h ? {
                uuid: h.uuid,
                name: h.name,
                point: h.point.toArray() as [number, number, number],
                distance: h.distance,
            } : null;

            (me.userData as any).interseccion = {
                ...(me.userData as any).interseccion,
                adyacentLeft:  norm(resLeft),
                adyacentRight: norm(resRight),
                adyacentTop:   norm(resUp),
                adyacentBottom:norm(resDown),
            };

            setExtra(e => ({
                ...e,
                interseccion: (me.userData as any).interseccion
            }));

            if (orientation === "horizontal") {
                const pL = resLeft?.point;
                const pR = resRight?.point;
                if (pL && pR) {
                    const pLlocal = parent ? parent.worldToLocal(pL.clone()) : pL;
                    const pRlocal = parent ? parent.worldToLocal(pR.clone()) : pR;
                    const wLocal = Math.abs(pRlocal.x - pLlocal.x);
                    if (wLocal > 0 && isFinite(wLocal)) setInterDims(d => ({ ...d, width: wLocal, height: espesorBase }));
                }
            } else if (orientation === "vertical") {
                const pD = resDown?.point;
                const pU = resUp?.point;
                if (pD && pU) {
                    const pDlocal = parent ? parent.worldToLocal(pD.clone()) : pD;
                    const pUlocal = parent ? parent.worldToLocal(pU.clone()) : pU;
                    const hLocal = Math.abs(pUlocal.y - pDlocal.y);
                    if (hLocal > 0 && isFinite(hLocal)) setInterDims(d => ({ ...d, height: hLocal, width: espesorBase }));
                }
            }
        };

            computeAndApply();
            requestAnimationFrame(() => {
                computeAndApply();
                requestAnimationFrame(() => {
                    computeAndApply();
                });
        });
    }, [isInterseccion, parentRef, scene, orientation, boundsKey]);

    let effWidth  = adjustedWidth;
    let effHeight = adjustedHeight;

    if (isInterseccion) {
        if (orientation === "horizontal") {
            effWidth = interDims.width ?? effWidth;
            effHeight = espesorBase;
        } else if (orientation === "vertical") {
            effHeight = interDims.height ?? effHeight;
            effWidth = espesorBase;
        }
    }

    const almostEqual = (a:number,b:number) => Math.abs(a-b) < 1e-6;

    useEffect(() => {
        if (!isInterseccion || !ref.current) return;

        const t = extra.positionExtra; // [tx, ty, tz?] normalizado 0..1 para X/Y
        if (!t) return;

        const L = interseccion?.adyacentLeft?.point;
        const R = interseccion?.adyacentRight?.point;
        const B = interseccion?.adyacentBottom?.point;
        const T = interseccion?.adyacentTop?.point;
        if (!L || !R || !B || !T) return; // aún no hay límites

        const parent = ref.current.parent as THREE.Object3D | null;
        const toLocal = (v: THREE.Vector3) => parent ? parent.worldToLocal(v.clone()) : v;

        const Lx = toLocal(L.clone()).x;
        const Rx = toLocal(R.clone()).x;
        const By = toLocal(B.clone()).y;
        const Ty = toLocal(T.clone()).y;

        const tx = MathUtils.clamp(t[0], 0, 1);
        const ty = MathUtils.clamp(t[1], 0, 1);

        const x = MathUtils.lerp(Lx, Rx, tx);
        const y = MathUtils.lerp(By, Ty, ty);
        const z = position[2];

        setInterPos(prev => {
            const next: [number, number, number] = [x, y, z];
            if (prev && almostEqual(prev[0], next[0]) && almostEqual(prev[1], next[1]) && almostEqual(prev[2], next[2])) return prev;
            return next;
        });

        // Desde ahora, control manual
        placedOnceRef.current = true;
    }, [
        isInterseccion,
        extra.positionExtra,                // si cambian sliders
        interseccion?.adyacentLeft,
        interseccion?.adyacentRight,
        interseccion?.adyacentBottom,
        interseccion?.adyacentTop
    ]);


// DESPUÉS
    useEffect(() => {
        if (!isInterseccion) return;
        if (!followAbsolutePosition) return; // 👈 evita pisar el cálculo
        if (!position) return;
        setInterPos(position);
    }, [isInterseccion, followAbsolutePosition, position?.[0], position?.[1], position?.[2]]);

    useEffect(() => {
        if (!isInterseccion || !ref.current) return;
        if (interseccion?.position && !placedOnceRef.current) {
            const t: [number, number, number] = [
                interseccion.position.x,
                interseccion.position.y,
                position[2],
            ];
            ref.current.userData.positionExtra = t;
            setExtra(e => ({ ...e, positionExtra: t }));
        }
    }, [isInterseccion, interseccion?.position?.x, interseccion?.position?.y]);

    return (
        <>

            {(shape === "box" || shape === "trapezoid") && (
                <mesh
                    castShadow={true}
                    receiveShadow={true}
                    ref={ref}
                    position={isInterseccion && interPos ? interPos : position}
                    material={material}
                    rotation={rotation}
                    geometry={createTablaFinaGeometry(effWidth, effHeight, adjustedDepth)}
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
                    <Edges threshold={15} color={"black"} linewidth={1}/>

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