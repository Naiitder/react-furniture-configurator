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

    const transformRef = useRef();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item");

    const [transformEnabled, setTransformEnabled] = useState(true);
    const [transformMode, setTransformMode] = useState("translate");
    const [undoStack, setUndoStack] = useState([]);

    // Guarda el estado actual del objeto
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

    // Inicial: guarda el estado inicial una vez el objeto está montado
    useEffect(() => {
        if (groupRef.current) saveTransformState();
    }, [groupRef.current]);

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
                        groupRef.current.scale.copy(last.scale);
                    }
                    return newStack;
                });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const interfaceComponents = {
        "Casco": <CascoInterface/>,
        "Casco Secciones": <CascoInterface/>,
    };

    const itemComponents = {
        "Casco": (
            <group ref={groupRef}>
                <Casco rotation={[0, Math.PI, 0]} patas={[<Pata height={1}/>]} puerta={<Puerta/>}/>
            </group>
        ),
        "Casco Secciones": (
            <group ref={groupRef}>
                <CascoSeccionesAutomaticas rotation={[0, Math.PI, 0]} patas={[<Pata height={1}/>]} puerta={<Puerta/>}/>
            </group>
        ),
    };

    return (
        <>
            <Canvas shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}}>
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