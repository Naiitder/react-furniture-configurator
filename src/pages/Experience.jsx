import {useRef, useState, useEffect} from "react";
import {Canvas, useThree} from "@react-three/fiber";
import {TransformControls, OrbitControls, Environment, Stage, OrthographicCamera} from "@react-three/drei";
import {useLocation} from "react-router-dom";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";
import CascoInterface from "../components/Casco/CascoInterface.jsx";
import CascoSeccionesAutomaticas from "../components/Casco/CascoSeccionesAutomaticas.tsx";
import {Room} from "../components/Enviroment/Room.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import TransformControlPanel from "./TransformControlPanel";
import {useDrop} from "react-dnd";
import * as THREE from "three";
import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx";
import {INTERSECTION_TYPES} from "../components/Casco/DraggableIntersection.js";
import {useSelectedPieceProvider} from "../contexts/SelectedPieceProvider.jsx";
import CascoWithContext from "../components/Casco/Casco.js";
import CascoSeccionesAutomaticasWithContext from "../components/Casco/CascoSeccionesAutomaticas.tsx";

const RaycastClickLogger = ({glRef, cameraRef}) => {
    const {camera, gl} = useThree();
    const {ref} = useSelectedItemProvider();
    const {refPiece} = useSelectedPieceProvider();

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

    const {ref: selectedItemProps, setRef} = useSelectedItemProvider();

    const [originalScale] = useState({x: 1, y: 1, z: 1});
    const [scaleDimensions, setScaleDimensions] = useState(originalScale)

    // Guarda el estado actual del objeto
    const saveTransformState = () => {
        const obj = groupRef.current;
        if (!obj || !selectedItemProps) return;

        const state = {
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone(),
            dimensions: {
                width: selectedItemProps.width,
                height: selectedItemProps.height,
                depth: selectedItemProps.depth
            }
        };

        setUndoStack(prev => [...prev, state]);
    };

    useEffect(() => {
        if (groupRef.current) saveTransformState();
    }, [groupRef.current]);

    // Capturar cambios en la escala cuando se usa TransformControls
    useEffect(() => {
        if (transformRef.current && groupRef.current) {
            const controls = transformRef.current;

            const onObjectChange = () => {
                if (groupRef.current && transformMode === 'scale' && selectedItemProps) {
                    // Obtener la escala actual
                    const newScale = groupRef.current.scale;

                    // Calcular nuevas dimensiones basadas en la escala relativa
                    const width = selectedItemProps.width || 1;
                    const height = selectedItemProps.height || 1;
                    const depth = selectedItemProps.depth || 1;

                    const newWidth = Math.min(5, Math.max(1, width * (newScale.x / originalScale.x)));
                    const newHeight = Math.min(6, Math.max(1, height * (newScale.y / originalScale.y)));
                    const newDepth = Math.min(4, Math.max(1, depth * (newScale.z / originalScale.z)));

                    setScaleDimensions({x: newWidth, y: newHeight, z: newDepth});

                    // Actualizar el objeto seleccionado con las nuevas dimensiones
                    setRef({
                        ...selectedItemProps,
                        width: newWidth,
                        height: newHeight,
                        depth: newDepth
                    });

                    // Restaurar la escala original
                    groupRef.current.scale.set(originalScale.x, originalScale.y, originalScale.z);
                }
            };

            controls.addEventListener('objectChange', onObjectChange);
            return () => controls.removeEventListener('objectChange', onObjectChange);
        }
    }, [transformMode, selectedItemProps, setRef]);

    // Escucha eventos del teclado
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
                    newStack.pop(); // Elimina el actual
                    const last = newStack[newStack.length - 1];
                    if (groupRef.current) {
                        groupRef.current.position.copy(last.position);
                        groupRef.current.rotation.copy(last.rotation);


                        setRef({
                            ...selectedItemProps,
                            width: last.dimensions.width,
                            height: last.dimensions.height,
                            depth: last.dimensions.depth
                        });

                        setScaleDimensions({
                            x: last.dimensions.width,
                            y: last.dimensions.height,
                            z: last.dimensions.depth
                        });
                    }
                    return newStack;
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const {ref} = useSelectedItemProvider();

    const [{isOver}, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            const gl = glRef.current;
            const camera = cameraRef.current;

            if (!clientOffset || !gl || !camera || !ref?.groupRef) return;

            const {x, y} = clientOffset;
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

                let adjustedWidth = cascoWidth;
                let adjustedHeight = cascoHeight;
                let adjustedPosition = [localPosition.x, localPosition.y, localPosition.z];

                if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                    const relevantVerticals = droppedVerticalCubes.filter((cube) => {
                        const cubeMinY = cube.relativePosition[1] * cascoHeight - (cube.relativeHeight * cascoHeight) / 2;
                        const cubeMaxY = cube.relativePosition[1] * cascoHeight + (cube.relativeHeight * cascoHeight) / 2;
                        return localPosition.y >= cubeMinY && localPosition.y <= cubeMaxY;
                    });

                    const verticalSections = relevantVerticals
                        .map((cube) => cube.relativePosition[0] * cascoWidth)
                        .sort((a, b) => a - b);

                    const boundaries = [
                        (-cascoWidth) / 2,
                        ...verticalSections,
                        (cascoWidth) / 2,
                    ];

                    // Determinar los límites
                    let leftBoundary = boundaries
                        .filter((pos) => pos < localPosition.x)
                        .sort((a, b) => b - a)[0] || -cascoWidth / 2;
                    let rightBoundary = boundaries
                        .filter((pos) => pos > localPosition.x)
                        .sort((a, b) => a - b)[0] || cascoWidth / 2;

                    // Calcular el ancho y la posición sin ajustes adicionales
                    adjustedWidth = (rightBoundary - leftBoundary); // Simplemente la distancia entre los límites
                    adjustedPosition[0] = (leftBoundary + rightBoundary) / 2; // Punto medio entre los límites

                    console.log("Horizontal Pos Y", localPosition.y, "Adjusted Position Y", adjustedPosition[1]);

                    // Verificar si ya existe una sección en esta posición
                    const existingSection = droppedHorizontalCubes.find((cube) => {
                        const cubeX = cube.relativePosition[0] * cascoWidth;
                        const cubeY = cube.relativePosition[1] * cascoHeight;
                        const cubeWidth = cube.relativeWidth * cascoWidth;

                        const cubeMinX = cubeX - cubeWidth / 2;
                        const cubeMaxX = cubeX + cubeWidth / 2;

                        const newMinX = adjustedPosition[0] - adjustedWidth / 2;
                        const newMaxX = adjustedPosition[0] + adjustedWidth / 2;

                        const sameY = Math.abs(cubeY - localPosition.y) < 0.1;
                        const overlapsX = !(newMaxX <= cubeMinX || newMinX >= cubeMaxX);

                        return sameY && overlapsX;
                    });

                    if (existingSection) {
                        console.warn("Ya existe una sección horizontal en esta posición Y");
                        return;
                    }
                } else if (item.type === INTERSECTION_TYPES.VERTICAL) {
                    const relevantHorizontals = droppedHorizontalCubes.filter((cube) => {
                        const cubeX = cube.relativePosition[0] * cascoWidth;
                        const cubeWidth = cube.relativeWidth * cascoWidth;
                        const cubeMinX = cubeX - cubeWidth / 2;
                        const cubeMaxX = cubeX + cubeWidth / 2;
                        return localPosition.x >= cubeMinX && localPosition.x <= cubeMaxX;
                    });

                    const horizontalSections = relevantHorizontals
                        .map((cube) => cube.relativePosition[1] * cascoHeight)
                        .sort((a, b) => a - b);

                    const boundaries = [
                        0,
                        ...horizontalSections,
                        cascoHeight,
                    ];

                    let bottomBoundary = boundaries
                        .filter((pos) => pos < localPosition.y)
                        .sort((a, b) => b - a)[0] || 0;
                    let topBoundary = boundaries
                        .filter((pos) => pos > localPosition.y)
                        .sort((a, b) => a - b)[0] || cascoHeight ;

                    adjustedHeight = (topBoundary - bottomBoundary);
                    adjustedPosition[1] = (bottomBoundary + topBoundary) / 2;

                    const existingSection = droppedVerticalCubes.find((cube) => {
                        const cubeX = cube.relativePosition[0] * cascoWidth;
                        const cubeY = cube.relativePosition[1] * cascoHeight;
                        const cubeHeight = cube.relativeHeight * cascoHeight;

                        const cubeMinY = cubeY - cubeHeight / 2;
                        const cubeMaxY = cubeY + cubeHeight / 2;

                        const newMinY = adjustedPosition[1] - adjustedHeight / 2;
                        const newMaxY = adjustedPosition[1] + adjustedHeight / 2;

                        const sameX = Math.abs(cubeX - localPosition.x) < 0.1;
                        const overlapsY = !(newMaxY <= cubeMinY || newMinY >= cubeMaxY);

                        return sameX && overlapsY;
                    });

                    if (existingSection) {
                        console.warn("Ya existe una sección vertical en esta posición X");
                        return;
                    }
                }

                const newCube = {
                    id: Date.now(),
                    relativePosition: [
                        adjustedPosition[0] / cascoWidth,
                        adjustedPosition[1] / cascoHeight,
                        adjustedPosition[2] / cascoDepth
                    ],
                    relativeWidth: (item.type === INTERSECTION_TYPES.HORIZONTAL ? adjustedWidth : espesor) / cascoWidth,
                    relativeHeight: (item.type === INTERSECTION_TYPES.VERTICAL ? adjustedHeight : espesor) / cascoHeight,
                    relativeDepth: (cascoDepth - (ref?.traseroDentro ? ref?.retranqueoTrasero || 0 : 0)) / cascoDepth,
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
                scaleDimensions={scaleDimensions}
            />
        ),
        "Casco Secciones": (
            <CascoInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                scaleDimensions={scaleDimensions}

            />
        ),
    };

    const itemComponents = {
        "Casco": (
            <group ref={groupRef}>
                <CascoWithContext rotation={[0, Math.PI, 0]} patas={[<Pata height={1}/>]} puertas={[<Puerta/>]}
                       seccionesHorizontales={droppedHorizontalCubes} seccionesVerticales={droppedVerticalCubes}/>
            </group>
        ),
        "Casco Secciones": (
            <group ref={groupRef}>
                <CascoSeccionesAutomaticasWithContext rotation={[0, Math.PI, 0]} patas={[<Pata height={1}/>]}
                                           puertas={[<Puerta/>]}/>
            </group>
        ),
    };

    return (
        <>
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}}>
                <RaycastClickLogger glRef={glRef} cameraRef={cameraRef}/>
                <Room positionY={3.5}/>
                <Stage intensity={5} environment={null} shadows="contact" adjustCamera={false}>
                    <Environment files={"/images/poly_haven_studio_4k.hdr"}/>
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
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>
            </Canvas>
            {interfaceComponents[selectedItem]}
            <RoomConfigPanel/>
        </>
    );
};