import {useRef, useState, useEffect} from "react";
import {Canvas} from "@react-three/fiber";
import {useLocation} from "react-router-dom";
import {useDrop} from "react-dnd";
import * as THREE from "three";
import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx";
import {useSelectedPieceProvider} from "../contexts/SelectedPieceProvider.jsx";
import {useActionHistory} from "../contexts/ActionHistoryProvider.jsx";
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

    const {addSceneAction, undoAction, redoAction, sceneState} = useActionHistory();
    const [transformEnabled, setTransformEnabled] = useState(true);
    const [transformMode, setTransformMode] = useState("translate");
    const [cascoInstances, setCascoInstances] = useState({});
    const {refItem, setRefItem, version, setVersion} = useSelectedItemProvider();
    const {refPiece, setRefPiece} = useSelectedPieceProvider();
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

    // En Experience.jsx
    useEffect(() => {
        if (sceneState && Object.keys(sceneState).length > 0 && refItem?.groupRef && sceneRef.current) {
            const updatedCasco = sceneRef.current.getObjectByName(refItem.groupRef.name);
            if (updatedCasco) {
                setRefItem({
                    ...refItem,
                    groupRef: updatedCasco,
                    userData: { ...updatedCasco.userData },
                });
                console.log("refItem actualizado después de sceneState:", updatedCasco.userData);
            }
        }
    }, [sceneState, refItem, setRefItem, sceneRef]);

    // Capturar el estado cuando needsSnapshot es true
    useEffect(() => {
        if (needsSnapshot && sceneRef.current) {
            console.log("Intentando capturar snapshot con sceneRef:", sceneRef.current);

            const cascos = getCascos();
            const objectsMap = {};

            cascos.forEach((casco) => {
                objectsMap[casco.name] = {
                    name: casco.name,
                    position: casco.position.clone(),
                    rotation: casco.rotation.clone(),
                    scale: casco.scale.clone(),
                    userData: JSON.parse(JSON.stringify(casco.userData)), // Deep copy
                };
            });

            console.log("Capturando estado en Experience:", objectsMap);
            if (Object.keys(objectsMap).length > 0) {
                addSceneAction(objectsMap);
            } else {
                console.warn("No se encontraron cascos para capturar en el snapshot");
            }

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
                userData: {width: 2, height: 2, depth: 2, espesor: 0.3, isCasco: true},
                patas: [<Pata height={1}/>],
                puertas: [<Puerta/>],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
            casco2: {
                id: 'casco2',
                name: 'casco2',
                position: [3, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: {width: 2, height: 2, depth: 3, espesor: 0.1, isCasco: true},
                patas: [<Pata height={1}/>],
                puertas: [<Puerta/>],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
            casco3: {
                id: 'casco3',
                name: 'casco3',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: {width: 2, height: 2, depth: 2, espesor: 0.1, isCasco: true},
                patas: [<Pata height={1}/>],
                puertas: [<Puerta/>],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
        });
    }, []);

    // Manejar cambios de transformación
    useEffect(() => {
        setTimeout( () => {
            if (!transformRef.current || !refItem?.groupRef) {
                console.warn("transformRef o refItem.groupRef no están definidos");
                return;
            }
            if (transformRef.current && refItem?.groupRef) {
                const controls = transformRef.current;
                let isDragging = false;

                const onDragStart = () => {
                    isDragging = true;
                    console.log("Comenzó la transformación");
                };

                // Detectar cuando termina el arrastre
                const onMouseUp = () => {
                    isDragging = false;
                    console.log("Terminó la transformación, activando snapshot");
                    setNeedsSnapshot(true);
                };

                const onObjectChange = () => {
                    if (transformMode === "scale") {
                        const newScale = refItem.groupRef.scale;
                        const width = refItem.groupRef.userData.width || 2;
                        const height = refItem.groupRef.userData.height || 2;
                        const depth = refItem.groupRef.userData.depth || 2;

                        const newWidth = Math.min(5, Math.max(1, width * newScale.x));
                        const newHeight = Math.min(6, Math.max(1, height * newScale.y));
                        const newDepth = Math.min(4, Math.max(1, depth * newScale.z));

                        refItem.groupRef.userData = {
                            ...refItem.groupRef.userData,
                            width: newWidth,
                            height: newHeight,
                            depth: newDepth
                        };
                        refItem.groupRef.scale.set(1, 1, 1);
                        setVersion(version + 1);
                    }
                };
                controls.addEventListener("mouseUp", onMouseUp);
                controls.addEventListener("mouseDown", onDragStart);
                controls.addEventListener("objectChange", onObjectChange);
                return () => {
                    controls.removeEventListener("mouseUp", onMouseUp);
                    controls.removeEventListener("mouseDown", onDragStart);
                    controls.removeEventListener("objectChange", onObjectChange);
                };
            }
        }, 200);
    }, [transformMode, refItem, version, setVersion]);

    // Atajos de teclado para deshacer y rehacer
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
                event.preventDefault();
                console.log("Deshacer activado");
                undoAction();
                setVersion(version + 1);
            } else if ((event.ctrlKey && event.key.toLowerCase() === 'y') ||
                (event.metaKey && event.shiftKey && event.key.toLowerCase() === 'z')) {
                event.preventDefault();
                console.log("Rehacer activado");
                redoAction();
                setVersion(version + 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown, {capture: true});
        return () => window.removeEventListener('keydown', handleKeyDown, {capture: true});
    }, [undoAction, redoAction]);

    const handleCascoClick = (selectedObject) => {
        setRefItem(selectedObject);
    };

    const [{isOver}, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            const gl = glRef.current;
            const camera = cameraRef.current;

            if (!clientOffset || !gl || !camera || !refItem || !refItem.groupRef) {
                console.warn("Missing required references for drop:", {
                    clientOffset,
                    gl: !!gl,
                    camera: !!camera,
                    refItem: !!refItem,
                    groupRef: refItem ? !!refItem.groupRef : false
                });
                return;
            }

            const cascoKey = refItem.groupRef.name;
            const cascoData = cascoInstances[cascoKey];
            if (!cascoData) {
                console.warn(`No casco data found for key: ${cascoKey}`);
                return;
            }

            const {x, y} = clientOffset;
            const bounds = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((x - bounds.left) / bounds.width) * 2 - 1,
                -((y - bounds.top) / bounds.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            // Ensure detectionRef exists before attempting to intersect
            if (!refItem.detectionRef) {
                console.warn("No detection reference available for intersection test");
                return;
            }

            const intersects = raycaster.intersectObject(refItem.detectionRef, true);
            if (intersects.length === 0) {
                console.warn("No intersection found");
                return;
            }

            const point = intersects[0].point;
            const worldPosition = new THREE.Vector3(point.x, point.y, point.z);
            refItem.groupRef.updateMatrixWorld(true);
            const localPosition = refItem.groupRef.worldToLocal(worldPosition.clone());

            const {width: cascoWidth, height: cascoHeight, depth: cascoDepth, espesor} = refItem.groupRef.userData;

            // Rest of your drop logic remains the same
            // ...

            // Ensure needsSnapshot is set to true at the end of the function
            console.log(`Drop successful in ${cascoKey}, requesting snapshot.`);
            setNeedsSnapshot(true);

            // Force a re-render of the specific casco if needed
            setCascoVersions(prev => ({ ...prev, [cascoKey]: (prev[cascoKey] || 0) + 1 }));
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [refItem, cascoInstances, cameraRef, glRef, addSceneAction, setCascoInstances, setNeedsSnapshot, setCascoVersions]); // Añadir dependencias nuevas

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
                <ambientLight intensity={0.5}/>
                <pointLight position={[10, 10, 10]}/>
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
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}} tabIndex={0}>
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
                >
                    <TablaConfigContent setNeedsSnapshot={setNeedsSnapshot}/>
                </TablaConfigurationInterface>
            )}
            <RoomConfigPanel/>
        </>
    );
};

export default Experience;