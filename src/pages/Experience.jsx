import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useLocation } from "react-router-dom";
import { useDrop } from "react-dnd";
import * as THREE from "three";
import { useSelectedItemProvider } from "../contexts/SelectedItemProvider.jsx";
import { useSelectedPieceProvider } from "../contexts/SelectedPieceProvider.jsx";
import { useActionHistory } from "../contexts/ActionHistoryProvider.jsx";
import { INTERSECTION_TYPES } from "../components/Casco/DraggableIntersection.js";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";
import CascoInterface from "../components/Casco/CascoInterface.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import CascoSimple from "../components/CascoBrr/CascoSimple.js";
import TablaConfigurationInterface from "../components/TablaConfiguratorInterface.jsx";
import TablaConfigContent from "../components/Casco/TablaInterface.jsx";
import SceneContent from "../components/Enviroment/SceneContent.jsx";

export const Experience = () => {
    const transformRef = useRef();
    const glRef = useRef();
    const cameraRef = useRef();
    const sceneRef = useRef(null);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item");

    const { addSceneAction, undoAction, redoAction, sceneState } = useActionHistory();
    const [transformEnabled, setTransformEnabled] = useState(true);
    const [transformMode, setTransformMode] = useState("translate");
    const [cascoInstances, setCascoInstances] = useState({});
    const { refItem, setRefItem, version, setVersion } = useSelectedItemProvider();
    const { refPiece, setRefPiece } = useSelectedPieceProvider();
    const [scaleDimensions, setScaleDimensions] = useState({ x: 2, y: 2, z: 2 });
    const [cascoVersions, setCascoVersions] = useState({});
    const [needsSnapshot, setNeedsSnapshot] = useState(false);
    const [selectedCascoId, setSelectedCascoId] = useState(null);

    // Función para obtener todos los cascos de la escena
    const getCascos = () => {
        const cascos = [];
        if (sceneRef.current) {
            sceneRef.current.traverse((obj) => {
                if (obj.userData.isCasco) {
                    cascos.push(obj);
                }
            });
        }
        return cascos;
    };

    // Capturar el estado cuando needsSnapshot es true
    useEffect(() => {
        if (needsSnapshot && sceneRef.current) {
            const cascos = getCascos();
            const objectsMap = {};
            cascos.forEach((casco) => {
                objectsMap[casco.name] = {
                    name: casco.name,
                    position: casco.position.clone(),
                    rotation: casco.rotation.clone(),
                    scale: casco.scale.clone(),
                    userData: { ...casco.userData },
                };
            });
            console.log("Capturando estado en Experience:", objectsMap);
            addSceneAction(objectsMap);
            setNeedsSnapshot(false);
        }
    }, [needsSnapshot, addSceneAction]);

    // Inicializar cascos
    useEffect(() => {
        setCascoInstances({
            casco1: {
                id: 'casco1',
                name: 'casco1',
                position: [-3, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: { width: 2, height: 2, depth: 2, espesor: 0.3, isCasco: true },
                patas: [<Pata height={1} />],
                puertas: [<Puerta />],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
            casco2: {
                id: 'casco2',
                name: 'casco2',
                position: [3, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: { width: 2, height: 2, depth: 3, espesor: 0.1, isCasco: true },
                patas: [<Pata height={1} />],
                puertas: [<Puerta />],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
            casco3: {
                id: 'casco3',
                name: 'casco3',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: { width: 2, height: 2, depth: 2, espesor: 0.1, isCasco: true },
                patas: [<Pata height={1} />],
                puertas: [<Puerta />],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
        });
    }, []);

    // Manejar cambios de transformación
    useEffect(() => {
        if (transformRef.current && refItem?.groupRef) {
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

                    setScaleDimensions({ x: newWidth, y: newHeight, z: newDepth });
                    refItem.groupRef.userData = { ...refItem.groupRef.userData, width: newWidth, height: newHeight, depth: newDepth };
                    refItem.groupRef.scale.set(1, 1, 1);
                    setVersion(version + 1);
                }
                console.log("Transformación detectada, activando snapshot");
                setNeedsSnapshot(true);
            };
            controls.addEventListener("objectChange", onObjectChange);
            return () => controls.removeEventListener("objectChange", onObjectChange);
        }
    }, [transformMode, refItem, version, setVersion]);

    // Atajos de teclado para deshacer y rehacer
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                console.log("Deshacer activado");
                undoAction();
            } else if ((event.ctrlKey && event.key.toLowerCase() === 'y') ||
                (event.metaKey && event.shiftKey && event.key.toLowerCase() === 'z')) {
                event.preventDefault();
                console.log("Rehacer activado");
                redoAction();
            }
        };
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
    }, [undoAction, redoAction]);

    const handleCascoClick = (selectedObject) => {
        setRefItem(selectedObject);
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            const gl = glRef.current;
            const camera = cameraRef.current;

            if (!clientOffset || !gl || !camera || !refItem) return;

            const cascoKey = refItem.groupRef.name;
            const cascoData = cascoInstances[cascoKey];
            if (!cascoData) return;

            const { x, y } = clientOffset;
            const bounds = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((x - bounds.left) / bounds.width) * 2 - 1,
                -((y - bounds.top) / bounds.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = refItem.detectionRef
                ? raycaster.intersectObject(refItem.detectionRef, true)
                : [];
            if (intersects.length === 0) return;

            const point = intersects[0].point;
            const worldPosition = new THREE.Vector3(point.x, point.y, point.z);
            refItem.groupRef.updateMatrixWorld(true);
            const localPosition = refItem.groupRef.worldToLocal(worldPosition.clone());

            const { width: cascoWidth, height: cascoHeight, depth: cascoDepth, espesor } = refItem.groupRef.userData;

            let adjustedWidth = cascoWidth;
            let adjustedHeight = cascoHeight;
            let adjustedPosition = [localPosition.x, localPosition.y, localPosition.z];

            const horizontalCubes = cascoData.seccionesHorizontales || [];
            const verticalCubes = cascoData.seccionesVerticales || [];

            if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                const relevantVerticals = verticalCubes.filter((cube) => {
                    const cubeMinY = cube.relativePosition[1] * cascoHeight - (cube.relativeHeight * cascoHeight) / 2;
                    const cubeMaxY = cube.relativePosition[1] * cascoHeight + (cube.relativeHeight * cascoHeight) / 2;
                    return localPosition.y >= cubeMinY && localPosition.y <= cubeMaxY;
                });

                const verticalSections = relevantVerticals
                    .map((cube) => cube.relativePosition[0] * cascoWidth)
                    .sort((a, b) => a - b);

                const boundaries = [-cascoWidth / 2, ...verticalSections, cascoWidth / 2];
                const leftBoundary = boundaries.filter((pos) => pos < localPosition.x).sort((a, b) => b - a)[0] || -cascoWidth / 2;
                const rightBoundary = boundaries.filter((pos) => pos > localPosition.x).sort((a, b) => a - b)[0] || cascoWidth / 2;

                adjustedWidth = rightBoundary - leftBoundary;
                adjustedPosition[0] = (leftBoundary + rightBoundary) / 2;

                const exists = horizontalCubes.some((cube) => {
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

                if (exists) {
                    console.warn("Ya existe una sección horizontal en esta posición Y");
                    return;
                }
            }

            if (item.type === INTERSECTION_TYPES.VERTICAL) {
                const relevantHorizontals = horizontalCubes.filter((cube) => {
                    const cubeX = cube.relativePosition[0] * cascoWidth;
                    const cubeWidth = cube.relativeWidth * cascoWidth;
                    const cubeMinX = cubeX - cubeWidth / 2;
                    const cubeMaxX = cubeX + cubeWidth / 2;
                    return localPosition.x >= cubeMinX && localPosition.x <= cubeMaxX;
                });

                const horizontalSections = relevantHorizontals
                    .map((cube) => cube.relativePosition[1] * cascoHeight)
                    .sort((a, b) => a - b);

                const boundaries = [0, ...horizontalSections, cascoHeight];
                const bottomBoundary = boundaries.filter((pos) => pos < localPosition.y).sort((a, b) => b - a)[0] || 0;
                const topBoundary = boundaries.filter((pos) => pos > localPosition.y).sort((a, b) => a - b)[0] || cascoHeight;

                adjustedHeight = topBoundary - bottomBoundary;
                adjustedPosition[1] = (bottomBoundary + topBoundary) / 2;

                const exists = verticalCubes.some((cube) => {
                    const cubeX = cube.relativePosition[0] * cascoWidth;
                    const cubeY = cube.relativePosition[1] * cascoHeight;
                    const cubeHeight = cube.relativeHeight * cascoHeight;
                    const cubeMinY = cubeY - cubeHeight / 2;
                    const cubeMaxY = cubeY + cubeHeight / 2;
                    const newMinY = adjustedPosition[1] - adjustedHeight / 2;
                    const newMaxY = adjustedPosition[1] - adjustedHeight / 2;
                    const sameX = Math.abs(cubeX - localPosition.x) < 0.1;
                    const overlapsY = !(newMaxY <= cubeMinY || newMinY >= cubeMaxY);
                    return sameX && overlapsY;
                });

                if (exists) {
                    console.warn("Ya existe una sección vertical en esta posición X");
                    return;
                }
            }

            const newCube = {
                id: Date.now(),
                relativePosition: [
                    adjustedPosition[0] / cascoWidth,
                    adjustedPosition[1] / cascoHeight,
                    adjustedPosition[2] / cascoDepth,
                ],
                relativeWidth: (item.type === INTERSECTION_TYPES.HORIZONTAL ? adjustedWidth : espesor) / cascoWidth,
                relativeHeight: (item.type === INTERSECTION_TYPES.VERTICAL ? adjustedHeight : espesor) / cascoHeight,
                relativeDepth: (cascoDepth - (refItem.userData?.traseroDentro ? refItem.userData?.retranqueoTrasero || 0 : 0)) / cascoDepth,
                color: item.color || "#8B4513",
            };

            setCascoInstances((prev) => {
                const updated = { ...prev };
                const updatedCasco = { ...updated[cascoKey] };

                if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                    updatedCasco.seccionesHorizontales = [...horizontalCubes, newCube];
                } else if (item.type === INTERSECTION_TYPES.VERTICAL) {
                    updatedCasco.seccionesVerticales = [...verticalCubes, newCube];
                }

                updated[cascoKey] = updatedCasco;
                console.log("Nueva intersección añadida, activando snapshot");
                setNeedsSnapshot(true);
                return updated;
            });
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [refItem, cascoInstances]);

    const interfaceComponents = {
        "Casco": (
            <CascoInterface
                key={refItem?.groupRef?.uuid || "default"}
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                setNeedsSnapshot={setNeedsSnapshot}
            />
        ),
        "Casco Secciones": (
            <CascoInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                setNeedsSnapshot={setNeedsSnapshot}
            />
        ),
        "Casco brr": (
            <CascoInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                setNeedsSnapshot={setNeedsSnapshot}
            />
        ),
    };

    const itemComponents = {
        "Casco": (
            <>
                {Object.values(cascoInstances).map((casco) => (
                    <group key={casco.id}>
                        <Casco
                            key={casco.id}
                            id={casco.id}
                            position={casco.position}
                            rotation={casco.rotation}
                            {...casco.userData}
                            patas={casco.patas}
                            puertas={casco.puertas}
                            onClick={handleCascoClick}
                            version={cascoVersions[casco.id] || 0}
                            seccionesHorizontales={casco.seccionesHorizontales}
                            seccionesVerticales={casco.seccionesVerticales}
                        />
                    </group>
                ))}
            </>
        ),
        "Casco brr": (
            <>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <group
                    onPointerMissed={(e) => {
                        if (selectedItem === "Casco brr") {
                            e.stopPropagation();
                            setSelectedCascoId(null);
                        }
                    }}
                >
                    <CascoSimple
                        id="casco1"
                        position={[0, 0, 0]}
                        isSelected={selectedCascoId === "casco1"}
                        onClick={() => setSelectedCascoId("casco1")}
                    />
                    <CascoSimple
                        id="casco2"
                        position={[10, 0, 0]}
                        isSelected={selectedCascoId === "casco2"}
                        onClick={() => setSelectedCascoId("casco2")}
                    />
                    <CascoSimple
                        id="casco3"
                        position={[-10, 0, 0]}
                        isSelected={selectedCascoId === "casco3"}
                        onClick={() => setSelectedCascoId("casco3")}
                    />
                </group>
            </>
        ),
    };

    const handleUndoClick = () => {
        console.log("Botón Deshacer clicado");
        undoAction();
    };

    const handleRedoClick = () => {
        console.log("Botón Rehacer clicado");
        redoAction();
    };

    const handleSceneUpdate = (scene) => {
        console.log("handleSceneUpdate - sceneRef:", sceneRef);
        console.log("handleSceneUpdate - scene:", scene);
        if (!sceneRef || typeof sceneRef !== 'object' || !('current' in sceneRef)) {
            console.error("sceneRef no es un useRef válido:", sceneRef);
            return;
        }
        sceneRef.current = scene;
    };

    return (
        <>
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{ position: [4, 4, -12], fov: 35 }} tabIndex={0}>
                <SceneContent
                    transformRef={transformRef}
                    glRef={glRef}
                    cameraRef={cameraRef}
                    selectedItem={selectedItem}
                    cascoInstances={cascoInstances}
                    refItem={refItem}
                    refPiece={refPiece}
                    sceneRef={sceneRef}
                    transformEnabled={transformEnabled}
                    transformMode={transformMode}
                    setNeedsSnapshot={setNeedsSnapshot}
                    itemComponents={itemComponents}
                    handleCascoClick={handleCascoClick}
                    cascoVersions={cascoVersions}
                    setCascoVersions={setCascoVersions}
                    addSceneAction={addSceneAction}
                    sceneState={sceneState}
                    onSceneUpdate={handleSceneUpdate}
                />
            </Canvas>
            {interfaceComponents[selectedItem]}
            {refPiece && (
                <TablaConfigurationInterface
                    title="Tabla Configurator"
                    show={true}
                    setShow={true}
                    mode={transformMode}
                    setMode={setTransformMode}
                >
                    <TablaConfigContent setNeedsSnapshot={setNeedsSnapshot} />
                </TablaConfigurationInterface>
            )}
            <RoomConfigPanel />
            <div style={{ position: "absolute", top: 10, left: 10 }}>
                <button onClick={handleUndoClick}>Deshacer</button>
                <button onClick={handleRedoClick} style={{ marginLeft: 10 }}>Rehacer</button>
            </div>
        </>
    );
};

export default Experience;