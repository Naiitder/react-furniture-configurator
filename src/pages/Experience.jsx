import React, {useEffect, useRef, useState} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {OrbitControls, Stage, TransformControls,} from "@react-three/drei";
import {useLocation} from "react-router-dom";
import {Room} from "../components/Enviroment/Room.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import {useDrop} from "react-dnd";
import * as THREE from "three";
import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx";
import {INTERSECTION_TYPES} from "../components/Casco/DraggableIntersection.js";
import ChildItemConfigurationInterface from "../components/ChildItemConfigurationInterface.jsx";
import TablaConfigContent from "../components/Casco/TablaInterface.jsx";
import {useSelectedPieceProvider} from "../contexts/SelectedPieceProvider.jsx";
import {useSelectedCajonProvider} from "../contexts/SelectedCajonProvider.jsx";
import CajonConfigContent from "../components/Aparador/CajonInterface.jsx";
import InterseccionMueble, {Orientacion} from "../components/Interseccion";
import IntersectionOverlay from "../components/InterseccionOverlay.js";
import ErrorBoundary from "antd/lib/alert/ErrorBoundary.js";
import InterseccionConfigContent from "../components/Casco/InterseccionInterface.jsx";
import {useCascoInstances} from "../components/cascoInstances.jsx";
import {getItemComponents} from "../utils/itemComponents.jsx";
import {getInterfaceComponents} from "../utils/interfaceComponents";


const RaycastClickLogger = ({glRef, cameraRef}) => {
    const {camera, gl} = useThree();
    const {refItem} = useSelectedItemProvider();

    useEffect(() => {
        if (glRef) glRef.current = gl;
        if (cameraRef) cameraRef.current = camera;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onClick = (event) => {
            const bounds = gl.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            if (refItem) {
                const intersects = raycaster.intersectObject(refItem.groupRef, true);
                if (intersects.length > 0) {
                }
            }
        };

        gl.domElement.addEventListener("mouseup", onClick);
        return () => gl.domElement.removeEventListener("mouseup", onClick);
    }, [camera, gl, refItem]); // Añadimos refItem como dependencia

    return null;
};

export const Experience = () => {
    const orbitRef = useRef();
    const transformRef = useRef();
    const glRef = useRef();
    const cameraRef = useRef();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item");

    const [transformEnabled, setTransformEnabled] = useState(false);
    const [transformMode, setTransformMode] = useState("");// Almacenar instancias de cascos
    const {refItem, setRefItem, version, setVersion} = useSelectedItemProvider();
    const {refPiece, setRefPiece} = useSelectedPieceProvider();
    const {refCajon, setRefCajon} = useSelectedCajonProvider();
    const [scaleDimensions, setScaleDimensions] = useState({x: 2, y: 2, z: 2});
    const [cascoInstances, setCascoInstances] = useCascoInstances();

    const handleCascoClick = (selectedObject) => {
        setRefItem(selectedObject);
    };

    useEffect(() => {
        if (
            transformRef.current &&
            refItem &&
            refItem.groupRef
        ) {
            const controls = transformRef.current;

            const onObjectChange = () => {
                if (transformMode === "scale") {
                    const newScale = refItem.groupRef.scale;
                    const width = refItem.groupRef.userData.width || 2;
                    const height = refItem.groupRef.userData.height || 2;
                    const depth = refItem.groupRef.userData.depth || 2;

                    const newWidth = Math.min(5, Math.max(1, width * newScale.x));
                    const newHeight = Math.min(6, Math.max(1, height * newScale.y));
                    const newDepth = Math.min(4, Math.max(1, depth * newScale.z));

                    setScaleDimensions({x: newWidth, y: newHeight, z: newDepth});
                    refItem.groupRef.userData = {
                        ...refItem.groupRef.userData,
                        width: newWidth,
                        height: newHeight,
                        depth: newDepth
                    };
                    refItem.groupRef.scale.set(1, 1, 1); // Resetear escala para evitar acumulaciones
                    setVersion((v) => v + 1);
                } else if (transformMode === "translate") {
                    console.log("MOVIENDO INTERSECCION")
                }
            };

            controls.addEventListener("objectChange", onObjectChange);
            return () => controls.removeEventListener("objectChange", onObjectChange);
        }
    }, [transformMode, refItem, version, setVersion]);


    const hoverTimeout = useRef(null);
    const lastClientOffset = useRef(null);

    function revertPreviewIntersections() {
        setCascoInstances(prev => {
            const updated = {};
            for (const key in prev) {
                const casco = prev[key];
                const inters = casco.intersecciones ?? [];
                // Generamos un nuevo array para forzar re-render
                const newInters = inters.map(i => {
                    if (i.previsualization) {
                        // Creamos un nuevo objeto con el mismo createdAt
                        return new InterseccionMueble(
                            {x: i.position.x, y: i.position.y},
                            i.orientation,
                            false,            // previsualization -> false
                            i.createdAt       // conservamos la fecha original
                        );
                    }
                    return i;
                });
                updated[key] = {
                    ...casco,
                    intersecciones: newInters,
                };
            }
            setVersion(v => v + 1);
            return updated;
        });

        // Sincronizamos userData del mueble seleccionado
        if (refItem?.groupRef) {
            const ud = refItem.groupRef.userData;
            ud.intersecciones = (ud.intersecciones ?? []).map(i => {
                if (i.previsualization) {
                    i.previsualization = false;
                    return i;
                }
                return i;
            });
        }
    }

    function clearPreviewIntersections() {
        setCascoInstances(prev => {
            const updated = {};
            for (const key in prev) {
                const casco = prev[key];
                const inters = casco.intersecciones ?? [];
                updated[key] = {
                    ...casco,
                    intersecciones: inters.filter(i => !i.previsualization),
                };
            }
            return updated;
        });

        if (refItem?.groupRef) {
            const ud = refItem.groupRef.userData;
            // <-- mismo fallback aquí
            ud.intersecciones = (ud.intersecciones ?? []).filter(i => !i.previsualization);
        }
        setVersion(v => v + 1);
    }




    const idleTimeRef = useRef(0);
    const lastTimestampRef = useRef(null);
    const previewCreatedRef = useRef(false);

    const [{isOver}, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        hover(item, monitor) {
            if (!refItem?.groupRef) return;

            if (!monitor.isOver({shallow: true})) {
                if (hoverTimeout.current) {
                    clearTimeout(hoverTimeout.current);
                    hoverTimeout.current = null;
                    clearPreviewIntersections();
                    previewCreatedRef.current = false;
                    idleTimeRef.current = 0;
                    lastTimestampRef.current = null;
                }
                lastClientOffset.current = null;
                return;
            }

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const prev = lastClientOffset.current;
            if (
                !prev ||
                prev.x !== clientOffset.x ||
                prev.y !== clientOffset.y
            ) {
                clearPreviewIntersections();
                previewCreatedRef.current = false;
                idleTimeRef.current = 0;
                lastTimestampRef.current = null;
                lastClientOffset.current = clientOffset;
            } else {
                const now = performance.now();
                if (lastTimestampRef.current == null) {
                    lastTimestampRef.current = now;
                }
                const deltaTime = (now - lastTimestampRef.current) / 1000;
                idleTimeRef.current += deltaTime;
                lastTimestampRef.current = now;

                if (idleTimeRef.current >= .01 && !previewCreatedRef.current) {
                    previewCreatedRef.current = true;
                    createIntersect(item, monitor, true)
                }
            }

            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
                clearPreviewIntersections();
                previewCreatedRef.current = false;
                idleTimeRef.current = 0;
                lastTimestampRef.current = null;
            }


        },
        drop: (item, monitor) => {

            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
                hoverTimeout.current = null;
            }
            if (!previewCreatedRef.current) {
                createIntersect(item, monitor);
            } else {
                revertPreviewIntersections();
            }
            previewCreatedRef.current = false;
            idleTimeRef.current = 0;
            lastTimestampRef.current = null;


        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [refItem, cascoInstances]);


    function createIntersect(item, monitor, previsualization = false) {
        // 1) Coordenadas del ratón + raycast UV
        const offset = monitor.getClientOffset();
        const gl = glRef.current;
        const camera = cameraRef.current;
        const ref = refItem?.groupRef;
        if (!offset || !gl || !camera || !ref) return;

        const bounds = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((offset.x - bounds.left) / bounds.width) * 2 - 1,
            -((offset.y - bounds.top) / bounds.height) * 2 + 1
        );
        const ray = new THREE.Raycaster();
        ray.setFromCamera(mouse, camera);
        const hit = ray.intersectObject(ref, true)[0];
        if (!hit?.uv) return;
        const rawX = hit.uv.x;
        const rawY = hit.uv.y;

        // 2) Ordenar cronológicamente las previas
        const prev = cascoInstances[ref.name]?.intersecciones || [];
        const sorted = prev
            .map((i, idx) => ({i, idx}))
            .sort((a, b) => {
                const tA = a.i.createdAt.getTime(),
                    tB = b.i.createdAt.getTime();
                return tA !== tB ? tA - tB : a.idx - b.idx;
            })
            .map(o => o.i);

        const isHoriz = item.type === INTERSECTION_TYPES.HORIZONTAL;
        const orient = isHoriz
            ? Orientacion.Horizontal
            : Orientacion.Vertical;

        const nueva = new InterseccionMueble(
            {x: rawX, y: rawY},
            orient,
            previsualization,
            undefined
        );

        // 7) Actualizar estado y userData
        setCascoInstances(prev => ({
            ...prev,
            [ref.name]: {
                ...prev[ref.name],
                intersecciones: [...(prev[ref.name].intersecciones || []), nueva]
            }
        }));
        ref.userData.intersecciones = [
            ...(ref.userData.intersecciones || []),
            nueva
        ];
        setVersion(v => v + 1);

    }


    function IntersectionOverlayController({overlayData, setOverlayData}) {
        const {refPiece} = useSelectedPieceProvider();
        const {camera, size} = useThree();
        const lastUpdateTime = useRef(0);
        const lastPosition = useRef({x: 0, y: 0});
        const lastPieceId = useRef(null);

        useFrame((state) => {
            const now = state.clock.elapsedTime;
            const currentPieceId = refPiece?.uuid || null;
            const shouldBeVisible = refPiece != null && refPiece.userData.isInterseccion;

            const pieceChanged = currentPieceId !== lastPieceId.current;

            if (pieceChanged) {
                lastPieceId.current = currentPieceId;
                lastUpdateTime.current = 0; // Reset throttling
            }

            if (!shouldBeVisible) {
                if (overlayData.isVisible) {
                    setOverlayData(prevData => ({...prevData, isVisible: false}));
                }
                return;
            }

            if (overlayData.isVisible && !pieceChanged && (now - lastUpdateTime.current < 0.05)) {
                return;
            }

            const worldPos = new THREE.Vector3();
            refPiece.getWorldPosition(worldPos);
            const ndc = worldPos.clone().project(camera);
            const x = (ndc.x * 0.5 + 0.5) * size.width;
            const y = (-ndc.y * 0.5 + 0.5) * size.height;

            const threshold = 3;
            if (
                overlayData.isVisible &&
                !pieceChanged &&
                Math.abs(x - lastPosition.current.x) < threshold &&
                Math.abs(y - lastPosition.current.y) < threshold
            ) {
                return;
            }

            lastPosition.current = {x, y};
            lastUpdateTime.current = now;

            const orientation = refPiece.userData.orientation;
            const isVertical = orientation === "vertical";

            const newData = {
                isVisible: true,
                overlayPositions: {
                    primary: {
                        x: Math.round(x - (!isVertical ? 0 : 24)),
                        y: Math.round(y - (isVertical ? 0 : 24)),
                        placement: isVertical ? 'left' : 'top'
                    },
                    secondary: {
                        x: Math.round(x + (!isVertical ? 0 : 24)),
                        y: Math.round(y + (isVertical ? 0 : 24)),
                        placement: isVertical ? 'right' : 'bottom'
                    }
                },
                intersectionData: {
                    id: refPiece.uuid,
                    originalIndex: refPiece.userData.originalIndex ?? 0,
                    position: {
                        x: refPiece.userData.positionX ?? worldPos.x,
                        y: refPiece.userData.positionY ?? worldPos.y
                    },
                    orientation: orientation || 'horizontal',
                    createdAt: refPiece.userData.createdAt ?? new Date(),
                    dimensions: {
                        width: refPiece.userData.widthExtra ?? 0,
                        height: refPiece.userData.heightExtra ?? 0,
                        depth: refPiece.userData.depthExtra ?? 0
                    },
                }
            };

            setOverlayData(newData);
        });

        return null;
    }

    const [overlayData, setOverlayData] = useState({
        isVisible: false,
        overlayPositions: null,
        intersectionData: null
    });

    return (
        <>
            <ErrorBoundary>
                <Canvas ref={drop} shadows dpr={[1, 2]} camera={{position: [0, 2, 5], fov: 35}}
                        onPointerMissed={(event) => {
                            if (event.button === 2) return;
                            setRefPiece(null);
                            setRefCajon(null);
                            setRefItem(null);
                        }}>
                    <RaycastClickLogger glRef={glRef} cameraRef={cameraRef}/>
                    <Room positionY={3.5}/>
                    <Stage intensity={.1} environment={"warehouse"} shadows={"contact"} adjustCamera={0}>

                        {getItemComponents(cascoInstances, handleCascoClick, version)[selectedItem]}

                    </Stage>
                    {transformEnabled && refItem && (
                        <TransformControls ref={transformRef} object={refPiece ? refPiece : refItem.groupRef}
                                           mode={transformMode} onMouseDown={() => orbitRef.current.enabled = false}
                                           onMouseUp={() => orbitRef.current.enabled = true}/>
                    )}

                    <OrbitControls
                        ref={orbitRef}
                        makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>

                    <IntersectionOverlayController
                        overlayData={overlayData}
                        setOverlayData={setOverlayData}
                    />
                </Canvas>
            </ErrorBoundary>
            {getInterfaceComponents(transformEnabled, setTransformEnabled, transformMode, setTransformMode, scaleDimensions)[selectedItem]}

            <IntersectionOverlay
                isVisible={overlayData.isVisible}
                overlayPositions={overlayData.overlayPositions}
                intersectionData={overlayData.intersectionData}
            />

            {refPiece && !refPiece.userData.isInterseccion && (
                <ChildItemConfigurationInterface
                    title={refPiece.uuid}
                    show={true}
                    setShow={true}
                    mode={transformMode}
                    setMode={setTransformMode}
                >
                    <TablaConfigContent/>
                </ChildItemConfigurationInterface>
            )}

            {refPiece && refPiece.userData.isInterseccion && (

                <ChildItemConfigurationInterface
                    title={refPiece.uuid}
                    show={true}
                    setShow={true}
                    mode={transformMode}
                    setMode={setTransformMode}
                >
                    <InterseccionConfigContent/>
                </ChildItemConfigurationInterface>
            )}


            {refCajon && (
                <ChildItemConfigurationInterface title="Cajon Configurator">
                    <CajonConfigContent/>
                </ChildItemConfigurationInterface>
            )}


            <RoomConfigPanel/>
        </>
    );
};