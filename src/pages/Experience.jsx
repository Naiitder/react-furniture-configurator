import {useLocation} from "react-router-dom";
import {Canvas} from "@react-three/fiber";
import {Environment, Stage, OrbitControls} from '@react-three/drei';
import {Room} from "../components/Enviroment/Room.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import React from "react";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";
import CascoInterface from "../components/Casco/CascoInterface.jsx";


const interfaceComponents = {
    "Casco": <CascoInterface/>,

};

export const Experience = () => {

    const itemComponents = {
        "Casco": <Casco
            rotation={[0, Math.PI, 0]}
            pata={<Pata height={1}/>}
            puerta={<Puerta />}
        />,
    };

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item"); // Obtiene el valor de "item" en la URL
    const selectedComponent = itemComponents[selectedItem] || null;
    const selectedInterface = interfaceComponents[selectedItem] || null;

    

    return (
        <>
            <Canvas shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}}>
                <Room positionY={1}/>
                <Stage intensity={5} environment={"city"}
                       shadows="contact" adjustCamera={false}>
                    {selectedComponent}
                    </Stage>
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>
            </Canvas>
            {selectedInterface}
            <RoomConfigPanel/>
        </>
    );
};