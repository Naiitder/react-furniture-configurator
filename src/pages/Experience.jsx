import {useLocation} from "react-router-dom";
import {Canvas} from "@react-three/fiber";
import {Environment, Stage, OrbitControls} from '@react-three/drei';
import {Room} from "../components/Enviroment/Room.jsx";
import {Mesa} from "../components/Mesa/Mesa.jsx";
import {Armario} from "../components/Armario/Armario.jsx";
import {ArmarioStep} from "../components/Armario/ArmarioStep.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import MesaInterface from "../components/Mesa/MesaInterface.jsx";
import React from "react";
import ArmarioInterface from "../components/Armario/ArmarioInterface.jsx";

const itemComponents = {
    "Mesa de centro": <Mesa rotation={[0, Math.PI, 0]}/>,
    "Armario": <Armario rotation={[0, Math.PI, 0]}/>,
    "Armario Step": <ArmarioStep rotation={[0, Math.PI, 0]}/>
};

const interfaceComponents = {
    "Mesa de centro": <MesaInterface/>,
    "Armario": <ArmarioInterface/>,
    "Armario Step": <ArmarioInterface/>
};

export const Experience = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item"); // Obtiene el valor de "item" en la URL
    const selectedComponent = itemComponents[selectedItem] || null;
    const selectedInterface = interfaceComponents[selectedItem] || null;

    return (
        <>
            <Canvas shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}}>
                <Room positionY={1}/>
                <Stage intensity={5} environment={null}
                       shadows="contact" adjustCamera={false}>
                        <Environment files={"/images/poly_haven_studio_4k.hdr"}/>
                    {selectedComponent}
                </Stage>
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>
            </Canvas>
            {selectedInterface}
            <RoomConfigPanel/>
        </>
    );
};