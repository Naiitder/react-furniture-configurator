import React from "react";
import CascoInterface from "../components/Casco/CascoInterface.jsx"
import AparadorInterface from "../components/Aparador/AparadorInterface.jsx";
import ArmarioInterface from "../components/Armario/ArmarioInterface.jsx";

export const getInterfaceComponents = (show, setShow, mode, setMode, scaleDimensions) => ({
    "Casco": <CascoInterface show={show} setShow={setShow} mode={mode} setMode={setMode}
                             scaleDimensions={scaleDimensions}/>,
    "Aparador": <AparadorInterface show={show} setShow={setShow} mode={mode} setMode={setMode}
                                   scaleDimensions={scaleDimensions}/>,
    "Armario": <ArmarioInterface show={show} setShow={setShow} mode={mode} setMode={setMode}
                                 scaleDimensions={scaleDimensions}/>,
    "Bodeguero": <ArmarioInterface show={show} setShow={setShow} mode={mode} setMode={setMode}
                                   scaleDimensions={scaleDimensions}/>,
});
