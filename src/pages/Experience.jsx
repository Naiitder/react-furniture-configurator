import {useRef, useState, useEffect} from "react";
import {Canvas} from "@react-three/fiber";
import {TransformControls, OrbitControls, Environment, Stage} from "@react-three/drei";
import {useLocation} from "react-router-dom";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";
import CascoInterface from "../components/Casco/CascoInterface.jsx";
import CascoSeccionesAutomaticas from "../components/Casco/CascoSeccionesAutomaticas.tsx";
import {Room} from "../components/Enviroment/Room.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import TransformControlPanel from "./TransformControlPanel";
import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx"; // ajusta la ruta
import {useDrop} from "react-dnd"; // ajusta la ruta

export const Experience = () => {
    const groupRef = useRef();

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

    const [droppedCubes, setDroppedCubes] = useState([]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            if (clientOffset) {
                const newCube = {
                    id: Date.now(),
                    position: [0, 1, 0], // Posición inicial. Podrías calcularlo con raycaster más adelante
                    color: item.color || "#8B4513",
                };
                setDroppedCubes((prev) => [...prev, newCube]);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const transformRef = useRef();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item");
    const {ref: selectedItemProps, setRef} = useSelectedItemProvider();

    const [originalScale] = useState({x: 1, y: 1, z: 1});
    const [transformEnabled, setTransformEnabled] = useState(true);
    const [transformMode, setTransformMode] = useState("translate");
    const [undoStack, setUndoStack] = useState([]);
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

    // Inicial: guarda el estado inicial una vez el objeto está montado
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
                // Ctrl+Z: Deshacer
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

    const interfaceComponents = {
        "Casco": <CascoInterface show={transformEnabled}
                                 setShow={setTransformEnabled}
                                 mode={transformMode}
                                 setMode={setTransformMode}
                                 scaleDimensions={scaleDimensions}
        />,
        "Casco Secciones": <CascoInterface show={transformEnabled}
                                           setShow={setTransformEnabled}
                                           mode={transformMode}
                                           setMode={setTransformMode}
                                           scaleDimensions={scaleDimensions}
        />,
    };

    const itemComponents = {
        "Casco": (
            <group ref={groupRef}>
                <Casco rotation={[0, Math.PI, 0]} patas={[<Pata height={1}/>]} puertas={[<Puerta/>]}/>
            </group>
        ),
        "Casco Secciones": (
            <group ref={groupRef}>
                <CascoSeccionesAutomaticas rotation={[0, Math.PI, 0]} patas={[<Pata height={1}/>]}
                                           puertas={[<Puerta/>]}/>
            </group>
        ),
    };

    return (
        <>
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{ position: [4, 4, -12], fov: 35 }}>
                <Room positionY={3.5} />
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
                {droppedCubes.map(cube => (
                    <mesh key={cube.id} position={cube.position}>
                        <boxGeometry args={[0.5, 0.5, 0.5]} />
                        <meshStandardMaterial color={cube.color} />
                    </mesh>
                ))}
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
            </Canvas>
            {interfaceComponents[selectedItem]}
            <RoomConfigPanel />
        </>
    );
};