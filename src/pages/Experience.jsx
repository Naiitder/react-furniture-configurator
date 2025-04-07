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

            if (ref?.transparentBoxRef) {
                console.log(ref.transparentBoxRef);
                const intersects = raycaster.intersectObject(ref.transparentBoxRef, true);
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

            if (!clientOffset || !gl || !camera) return;

            if(ref?.transparentBoxRef) {
                const { x, y } = clientOffset;
                const bounds = gl.domElement.getBoundingClientRect();
                const mouse = new THREE.Vector2(
                    ((x - bounds.left) / bounds.width) * 2 - 1,
                    -((y - bounds.top) / bounds.height) * 2 + 1
                );

                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObject(ref.transparentBoxRef, true);

                if (intersects.length > 0) {
                    const point = intersects[0].point;
                    const newCube = {
                        id: Date.now(),
                        position: [point.x, point.y, point.z],
                        color: item.color || "#8B4513",
                    };
                    if (item.type === INTERSECTION_TYPES.HORIZONTAL){
                        setDroppedHorizontalCubes((prev) => [...prev, newCube]);
                    }
                    if (item.type === INTERSECTION_TYPES.VERTICAL){
                        setDroppedVerticalCubes((prev) => [...prev, newCube]);
                    }
                }
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }),[ref]);

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