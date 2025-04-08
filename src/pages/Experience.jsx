import { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { TransformControls, OrbitControls, Environment, Stage } from "@react-three/drei";
import { useLocation } from "react-router-dom";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";
import CascoInterface from "../components/Casco/CascoInterface.jsx";
import CascoSeccionesAutomaticas from "../components/Casco/CascoSeccionesAutomaticas.tsx";
import { Room } from "../components/Enviroment/Room.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import TransformControlPanel from "./TransformControlPanel";
import { useDrop } from "react-dnd";
import * as THREE from "three";
import { useSelectedItemProvider } from "../contexts/SelectedItemProvider.jsx";
import {INTERSECTION_TYPES} from "../components/Casco/DraggableIntersection.js";

const RaycastClickLogger = ({ glRef, cameraRef }) => {
    const { camera, gl } = useThree();
    const { ref } = useSelectedItemProvider();

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

            console.log("REF", ref)
            if (ref?.groupRef) {
                console.log(ref.groupRef);
                const intersects = raycaster.intersectObject(ref.groupRef, true);
                if (intersects.length > 0) {
                    console.log("👉 Intersección con Casco en:", intersects[0].point);
                }
            }
        };

        gl.domElement.addEventListener("mouseup", onClick);
        return () => gl.domElement.removeEventListener("mouseup", onClick);
    }, [camera, gl, ref?.transparentBoxRef]);

    return null;
};

export const Experience = () => {
    const groupRef = useRef();
    const transformRef = useRef();
    const glRef = useRef();
    const cameraRef = useRef();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item");

    const [transformEnabled, setTransformEnabled] = useState(true);
    const [transformMode, setTransformMode] = useState("translate");
    const [undoStack, setUndoStack] = useState([]);
    const [droppedHorizontalCubes, setDroppedHorizontalCubes] = useState([]);
    const [droppedVerticalCubes, setDroppedVerticalCubes] = useState([]);

    useEffect(() => {
        let saved = false;
        const checkAndSave = () => {
            if (groupRef.current && !saved) {
                saveTransformState();
                saved = true;
            } else {
                requestAnimationFrame(checkAndSave);
            }
        };
        requestAnimationFrame(checkAndSave);
    }, []);

    const saveTransformState = () => {
        const obj = groupRef.current;
        if (!obj) return;
        const state = {
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone()
        };
        setUndoStack(prev => [...prev, state]);
    };

    useEffect(() => {
        if (groupRef.current) saveTransformState();
    }, [groupRef.current]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setTransformEnabled(false);
            } else if (e.key.toLowerCase() === 'e') {
                setTransformMode('rotate');
                setTransformEnabled(true);
            } else if (e.key.toLowerCase() === 'r') {
                setTransformMode('scale');
                setTransformEnabled(true);
            } else if (e.key.toLowerCase() === 'w') {
                setTransformMode('translate');
                setTransformEnabled(true);
            } else if (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey)) {
                setUndoStack(prev => {
                    if (prev.length < 2) return prev;
                    const newStack = [...prev];
                    newStack.pop();
                    const last = newStack[newStack.length - 1];
                    if (groupRef.current) {
                        groupRef.current.position.copy(last.position);
                        groupRef.current.rotation.copy(last.rotation);
                        groupRef.current.scale.copy(last.scale);
                    }
                    return newStack;
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const { ref } = useSelectedItemProvider();

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            const gl = glRef.current;
            const camera = cameraRef.current;

            if (!clientOffset || !gl || !camera || !ref?.groupRef) return;

            const { x, y } = clientOffset;
            const bounds = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((x - bounds.left) / bounds.width) * 2 - 1,
                -((y - bounds.top) / bounds.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(ref.groupRef, true);

            if (intersects.length > 0) {
                const point = intersects[0].point;
                const worldPosition = new THREE.Vector3(point.x, point.y, point.z);

                ref.groupRef.updateMatrixWorld(true);
                const localPosition = ref.groupRef.worldToLocal(worldPosition.clone());

                const cascoWidth = ref?.width || 2;
                const cascoHeight = ref?.height || 2;
                const cascoDepth = ref?.depth || 2;
                const espesor = ref?.espesor || 0.1;

                let adjustedWidth = cascoWidth - espesor * 2;
                let adjustedHeight = cascoHeight - espesor * 2;
                let adjustedPosition = [localPosition.x, localPosition.y, localPosition.z];

                if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                    const verticalSections = droppedVerticalCubes
                        .map((cube) => cube.position[0])
                        .sort((a, b) => a - b);

                    const boundaries = [
                        -cascoWidth / 2 + espesor,
                        ...verticalSections,
                        cascoWidth / 2 - espesor,
                    ];

                    let leftBoundary = boundaries
                        .filter((pos) => pos < localPosition.x)
                        .sort((a, b) => b - a)[0] || -cascoWidth / 2 + espesor;
                    let rightBoundary = boundaries
                        .filter((pos) => pos > localPosition.x)
                        .sort((a, b) => a - b)[0] || cascoWidth / 2 - espesor;

                    adjustedWidth = rightBoundary - leftBoundary;
                    adjustedPosition[0] = (leftBoundary + rightBoundary) / 2;

                    const existingSection = droppedHorizontalCubes.find(
                        (cube) => Math.abs(cube.position[1] - localPosition.y) < 0.1
                    );

                    if (existingSection) {
                        console.warn("Ya existe una sección horizontal en esta posición Y");
                        return;
                    }
                } else if (item.type === INTERSECTION_TYPES.VERTICAL) {
                    const horizontalSections = droppedHorizontalCubes
                        .map((cube) => cube.position[1])
                        .sort((a, b) => a - b);

                    const boundaries = [
                        espesor / 2,
                        ...horizontalSections,
                        cascoHeight - espesor / 2,
                    ];

                    let bottomBoundary = boundaries
                        .filter((pos) => pos < localPosition.y)
                        .sort((a, b) => b - a)[0] || espesor / 2;
                    let topBoundary = boundaries
                        .filter((pos) => pos > localPosition.y)
                        .sort((a, b) => a - b)[0] || cascoHeight - espesor / 2;

                    adjustedHeight = topBoundary - bottomBoundary;
                    adjustedPosition[1] = (bottomBoundary + topBoundary) / 2;

                    const existingSection = droppedVerticalCubes.find(
                        (cube) => Math.abs(cube.position[0] - localPosition.x) < 0.1
                    );

                    if (existingSection) {
                        console.warn("Ya existe una sección vertical en esta posición X");
                        return;
                    }
                }

                const newCube = {
                    id: Date.now(),
                    position: adjustedPosition,
                    width: item.type === INTERSECTION_TYPES.HORIZONTAL ? adjustedWidth : espesor,
                    height: item.type === INTERSECTION_TYPES.VERTICAL ? adjustedHeight : espesor,
                    depth: cascoDepth - espesor - (ref?.traseroDentro ? ref?.retranqueoTrasero || 0 : 0),
                    color: item.color || "#8B4513",
                };

                if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                    setDroppedHorizontalCubes((prev) => [...prev, newCube]);
                } else if (item.type === INTERSECTION_TYPES.VERTICAL) {
                    setDroppedVerticalCubes((prev) => [...prev, newCube]);
                }
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [ref, droppedHorizontalCubes, droppedVerticalCubes]);


    const interfaceComponents = {
        "Casco": (
            <CascoInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
            />
        ),
        "Casco Secciones": (
            <CascoInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
            />
        ),
    };

    const itemComponents = {
        "Casco": (
            <group ref={groupRef}>
                <Casco rotation={[0, Math.PI, 0]} patas={[<Pata height={1} />]} puertas={[<Puerta />]} seccionesHorizontales={droppedHorizontalCubes} seccionesVerticales={droppedVerticalCubes} />
            </group>
        ),
        "Casco Secciones": (
            <group ref={groupRef}>
                <CascoSeccionesAutomaticas rotation={[0, Math.PI, 0]} patas={[<Pata height={1} />]} puertas={[<Puerta />]} />
            </group>
        ),
    };

    return (
        <>
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{ position: [4, 4, -12], fov: 35 }}>
                <RaycastClickLogger glRef={glRef} cameraRef={cameraRef} />
                <Room positionY={3.5} />
                <Stage intensity={5} environment={null} shadows="contact" adjustCamera={false}>
                    <Environment files={"/images/poly_haven_studio_4k.hdr"} />
                    {itemComponents[selectedItem]}
                </Stage>
                {transformEnabled && (
                    <TransformControls
                        ref={transformRef}
                        object={groupRef}
                        mode={transformMode}
                        onMouseUp={saveTransformState}
                    />
                )}
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
            </Canvas>
            {interfaceComponents[selectedItem]}
            <RoomConfigPanel />
        </>
    );
};