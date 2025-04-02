import {useLocation} from "react-router-dom";
import {Canvas} from "@react-three/fiber";
import {Environment, Stage, OrbitControls} from '@react-three/drei';
import {Room} from "../components/Enviroment/Room.jsx";
import {Mesa} from "../components/OLD/Mesa/Mesa.jsx";
import {Armario} from "../components/OLD/Armario/Armario.jsx";
import {ArmarioStep} from "../components/OLD/Armario/ArmarioStep.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import MesaInterface from "../components/OLD/Mesa/MesaInterface.jsx";
import React from "react";
import ArmarioInterface from "../components/OLD/Armario/ArmarioInterface.jsx";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";


import {useCascoConfigurator} from '../contexts/useCascoConfigurator.jsx';
import CascoInterface from "../components/Casco/CascoInterface.jsx";



const interfaceComponents = {
    "Mesa de centro": <MesaInterface/>,
    "Armario": <ArmarioInterface/>,
    "Armario Step": <ArmarioInterface/>,
    "Casco": <CascoInterface/>,

};

export const Experience = () => {
    
    const {width, height, depth, texture, esquinaXTriangulada, esquinaZTriangulada, espesor,
        sueloDentro,
        techoDentro,
        traseroDentro,
        offsetTrasero,
        pataHeight} = useCascoConfigurator();

    const itemComponents = {
        "Mesa de centro": <Mesa rotation={[0, Math.PI, 0]}/>,
        "Armario": <Armario rotation={[0, Math.PI, 0]}/>,
        "Armario Step": <ArmarioStep rotation={[0, Math.PI, 0]}/>,

        "Casco": <Casco
            width={width/100}
            height={height/100}
            depth={depth/100}
            esquinaXTriangulada={esquinaXTriangulada}
            esquinaZTriangulada={esquinaZTriangulada}
            espesor={espesor}
            position={[0, 0, 0]}
            rotation={[0, Math.PI , 0]}
            sueloDentro={sueloDentro}
            techoDentro={techoDentro}
            traseroDentro={traseroDentro}
            offsetTrasero={offsetTrasero/100}
            pata={<Pata height={pataHeight/100}/>}
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