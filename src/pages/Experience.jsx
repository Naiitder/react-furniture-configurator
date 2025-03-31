import { useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Environment, Stage, OrbitControls } from '@react-three/drei';
import { Room } from "../components/Enviroment/Room.jsx";
import { Mesa } from "../components/Mesa/Mesa.jsx";
import { Armario } from "../components/Armario/Armario.jsx";
import { ArmarioStep } from "../components/Armario/Armario-Step.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import Interface from "../components/Mesa/Interface.jsx";
import React from "react";

const itemComponents = {
    "Mesa de centro": <Mesa rotation={[0, Math.PI, 0]} />,
    "Armario": <Armario rotation={[0,Math.PI,0]}/>,
    "Armario Step": <ArmarioStep rotation={[0, Math.PI, 0]} />
};

export const Experience = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item"); // Obtiene el valor de "item" en la URL
    const selectedComponent = itemComponents[selectedItem] || null;

    return (
        <>
            <Canvas shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}}>
                <Room positionY={1}/>
                <Stage intensity={5} environment="city"
                       shadows="contact" adjustCamera={false}>
                    {selectedComponent}
                </Stage>
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>
            </Canvas>
            {/* Esta interfaz solo funciona con Mesa2, habria que cambiarlo */}
            <Interface/>
            <RoomConfigPanel/>
        </>
    );
};