import {useRef, useState, useEffect} from "react";
import {Canvas, useThree} from "@react-three/fiber";
import {TransformControls, OrbitControls, Environment, Stage} from "@react-three/drei";
import {useLocation} from "react-router-dom";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";
import CascoInterface from "../components/Casco/CascoInterface.jsx";
import CascoSeccionesAutomaticas from "../components/Casco/CascoSeccionesAutomaticas.tsx";
import {Room} from "../components/Enviroment/Room.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import {useDrop} from "react-dnd";
import * as THREE from "three";
import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx";
import {INTERSECTION_TYPES} from "../components/Casco/DraggableIntersection.js";
import {useSelectedPieceProvider} from "../contexts/SelectedPieceProvider.jsx";
import CascoWithContext from "../components/Casco/Casco.js";
import CascoSeccionesAutomaticasWithContext from "../components/Casco/CascoSeccionesAutomaticas.tsx";
import {Group, Object3D} from "three";

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
    // Use a parent group for the entire scene
    const parentGroupRef = useRef(new Group());

    // Separate refs for each Casco
    const casco1Ref = useRef(null);
    const casco2Ref = useRef(null);

    const {refPiece} = useSelectedPieceProvider();
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
    const [selectedCasco, setSelectedCasco] = useState('casco1');

    const selectionGroupRef = useRef(new Group());

    // Mantén un mapeo de objetos originales a sus proxies
    const objectToProxyMap = useRef(new Map());

    // Handle initial setup
    useEffect(() => {
        // Make sure our parent group is initialized
        if (!parentGroupRef.current) {
            parentGroupRef.current = new Group();
        }
        // Make sure selection group is initialized
        if (!selectionGroupRef.current) {
            selectionGroupRef.current = new Group();
            parentGroupRef.current.add(selectionGroupRef.current);
        }
    }, []);

    // Update the TransformControls attachment logic
    useEffect(() => {
        if (!transformRef.current) return;

        // Clean up selection group before reconfiguring
        while (selectionGroupRef.current.children.length > 0) {
            selectionGroupRef.current.remove(selectionGroupRef.current.children[0]);
        }
        objectToProxyMap.current.clear();

        if (refPiece.length > 0) {
            // Create proxies for selected pieces
            refPiece.forEach((piece) => {
                if (piece) {
                    const proxy = new Object3D();
                    proxy.position.copy(piece.position);
                    proxy.rotation.copy(piece.rotation);
                    proxy.scale.copy(piece.scale);
                    selectionGroupRef.current.add(proxy);
                    objectToProxyMap.current.set(piece, proxy);
                }
            });

            // Attach to TransformControls
            if (refPiece.length === 1) {
                transformRef.current.attach(refPiece[0]);
            } else if (refPiece.length > 1) {
                transformRef.current.attach(selectionGroupRef.current);
            }
        } else {
            // Attach to the selected Casco or parent group
            const targetRef = selectedCasco === 'casco1' ? casco1Ref.current :
                (selectedCasco === 'casco2' ? casco2Ref.current : parentGroupRef.current);

            if (targetRef && typeof targetRef.updateMatrixWorld === 'function') {
                transformRef.current.attach(targetRef);
            } else {
                console.warn("Invalid object reference for TransformControls", targetRef);
                transformRef.current.attach(parentGroupRef.current);
            }
        }
    }, [refPiece, selectedCasco]);

    // Sync TransformControls changes with original objects
    useEffect(() => {
        if (!transformRef.current) return;

        const onObjectChange = () => {
            if (
                transformRef.current.object === selectionGroupRef.current &&
                refPiece.length > 1
            ) {
                // Update selection group world matrix
                selectionGroupRef.current.updateWorldMatrix(true, false);

                objectToProxyMap.current.forEach((proxy, original) => {
                    proxy.updateWorldMatrix(true, false);
                    const worldMatrix = proxy.matrixWorld.clone();
                    original.position.setFromMatrixPosition(worldMatrix);
                    const rotation = new THREE.Euler();
                    rotation.setFromRotationMatrix(worldMatrix);
                    original.rotation.copy(rotation);
                    const scale = new THREE.Vector3();
                    scale.setFromMatrixScale(worldMatrix);
                    original.scale.copy(scale);
                });
            }
        };

        const controls = transformRef.current;
        controls.addEventListener("objectChange", onObjectChange);
        return () => controls.removeEventListener("objectChange", onObjectChange);
    }, [refPiece]);

    const {ref: selectedItemProps, setRef} = useSelectedItemProvider();

    const [originalScale] = useState({x: 1, y: 1, z: 1});
    const [scaleDimensions, setScaleDimensions] = useState(originalScale);

    // Save the current transform state
    const saveTransformState = () => {
        if (refPiece.length > 0) {
            // For selected pieces, save state of each one
            const states = refPiece.map(piece => ({
                id: piece.id || Math.random().toString(36).substr(2, 9),
                position: piece.position.clone(),
                rotation: piece.rotation.clone(),
                scale: piece.scale.clone()
            }));
            setUndoStack(prev => [...prev, states]);
        } else {
            // Global state of the furniture container
            let obj;
            if (selectedCasco === 'casco1') {
                obj = casco1Ref.current;
            } else if (selectedCasco === 'casco2') {
                obj = casco2Ref.current;
            } else {
                obj = parentGroupRef.current;
            }

            if (!obj || !selectedItemProps) return;

            const state = {
                position: obj.position.clone(),
                rotation: obj.rotation.clone(),
                scale: obj.scale.clone(),
                dimensions: {
                    width: selectedItemProps.width || 1,
                    height: selectedItemProps.height || 1,
                    depth: selectedItemProps.depth || 1
                }
            };
            setUndoStack(prev => [...prev, state]);
        }
    };

    // Save initial state
    useEffect(() => {
        const timer = setTimeout(() => {
            if (casco1Ref.current || casco2Ref.current) {
                saveTransformState();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Handle scale changes via TransformControls
    useEffect(() => {
        if (transformRef.current) {
            const controls = transformRef.current;
            const targetRef = selectedCasco === 'casco1' ? casco1Ref.current :
                (selectedCasco === 'casco2' ? casco2Ref.current : null);

            const onObjectChange = () => {
                if (targetRef && transformMode === "scale" && selectedItemProps) {
                    const newScale = targetRef.scale;
                    const width = selectedItemProps.width || 1;
                    const height = selectedItemProps.height || 1;
                    const depth = selectedItemProps.depth || 1;

                    const newWidth = Math.min(5, Math.max(1, width * (newScale.x / originalScale.x)));
                    const newHeight = Math.min(6, Math.max(1, height * (newScale.y / originalScale.y)));
                    const newDepth = Math.min(4, Math.max(1, depth * (newScale.z / originalScale.z)));

                    setScaleDimensions({x: newWidth, y: newHeight, z: newDepth});
                    setRef({
                        ...selectedItemProps,
                        width: newWidth,
                        height: newHeight,
                        depth: newDepth
                    });
                    // Restore original scale to prevent accumulation
                    targetRef.scale.set(originalScale.x, originalScale.y, originalScale.z);
                }
            };

            controls.addEventListener("objectChange", onObjectChange);
            return () => controls.removeEventListener("objectChange", onObjectChange);
        }
    }, [transformMode, selectedItemProps, setRef, selectedCasco]);

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setTransformEnabled(false);
            } else if (e.key.toLowerCase() === "e") {
                setTransformMode("rotate");
                setTransformEnabled(true);
            } else if (e.key.toLowerCase() === "r") {
                setTransformMode("scale");
                setTransformEnabled(true);
            } else if (e.key.toLowerCase() === "w") {
                setTransformMode("translate");
                setTransformEnabled(true);
            } else if (e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey)) {
                // Perform undo
                setUndoStack(prev => {
                    if (prev.length < 2) return prev;
                    const newStack = [...prev];
                    newStack.pop();
                    const last = newStack[newStack.length - 1];

                    if (refPiece.length > 0) {
                        // Update each piece according to saved state
                        last.forEach(state => {
                            const piece = refPiece.find(p => p.id === state.id);
                            if (piece) {
                                piece.position.copy(state.position);
                                piece.rotation.copy(state.rotation);
                                piece.scale.copy(state.scale);
                            }
                        });
                    } else {
                        // Update selected Casco
                        let targetRef;
                        if (selectedCasco === 'casco1') {
                            targetRef = casco1Ref.current;
                        } else if (selectedCasco === 'casco2') {
                            targetRef = casco2Ref.current;
                        } else {
                            targetRef = parentGroupRef.current;
                        }

                        if (targetRef) {
                            targetRef.position.copy(last.position);
                            targetRef.rotation.copy(last.rotation);
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
                    }
                    return newStack;
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [refPiece, selectedItemProps, setRef, selectedCasco]);

    const {ref} = useSelectedItemProvider();

    // Handle drag and drop of intersections
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
                        .sort((a, b) => a - b)[0] || cascoHeight;

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

    // Handle Casco selection on click
    const handleCascoClick = (cascoId, event) => {
        // Stop event propagation
        event.stopPropagation();
        setSelectedCasco(cascoId);
    };

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
            <group ref={parentGroupRef}>
                <CascoWithContext
                    ref={casco1Ref}
                    rotation={[0, Math.PI, 0]}
                    patas={[<Pata height={1}/>]}
                    puertas={[<Puerta/>]}
                    seccionesHorizontales={droppedHorizontalCubes}
                    seccionesVerticales={droppedVerticalCubes}
                    onClick={(e) => handleCascoClick('casco1', e)}
                />
                <Casco
                    ref={casco2Ref}
                    position={[5, 0, 0]}
                    rotation={[0, Math.PI, 0]}
                    patas={[<Pata height={1}/>]}
                    puertas={[<Puerta/>]}
                    seccionesHorizontales={droppedHorizontalCubes}
                    seccionesVerticales={droppedVerticalCubes}
                    onClick={(e) => handleCascoClick('casco2', e)}
                />
            </group>
        ),
        "Casco Secciones": (
            <group ref={parentGroupRef}>
                <CascoSeccionesAutomaticasWithContext
                    ref={casco1Ref}
                    rotation={[0, Math.PI, 0]}
                    patas={[<Pata height={1}/>]}
                    puertas={[<Puerta/>]}
                />
            </group>
        ),
    };

    // Get the currently active transform object
    const getActiveTransformObject = () => {
        if (refPiece.length > 1) {
            return selectionGroupRef.current;
        } else if (refPiece.length === 1) {
            return refPiece[0];
        } else {
            const targetRef = selectedCasco === 'casco1' ? casco1Ref.current :
                (selectedCasco === 'casco2' ? casco2Ref.current : null);
            return targetRef || parentGroupRef.current;
        }
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
                        mode={transformMode}
                        onMouseUp={saveTransformState}
                    />
                )}
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>
            </Canvas>
            {interfaceComponents[selectedItem]}
            <RoomConfigPanel/>
            {/* UI indicator para mostrar cuál Casco está seleccionado */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px'
            }}>
                Seleccionado: {selectedCasco === 'casco1' ? 'Primer Casco' : 'Segundo Casco'}
            </div>
        </>
    );
};