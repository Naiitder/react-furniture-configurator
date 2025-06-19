import React from "react";
import CascoInterface from "../components/Casco/CascoInterface.jsx"
import AparadorInterface from "../components/Aparador/AparadorInterface.jsx";
import ArmarioInterface from "../components/Armario/ArmarioInterface.jsx";

export const getInterfaceComponents = (refItem, version) => ({
    "Casco": <CascoInterface refItem={refItem} version={version} />,
    "Aparador": <AparadorInterface refItem={refItem} version={version} />,
    "Armario": <ArmarioInterface refItem={refItem} version={version} />,
    "Bodeguero": <ArmarioInterface refItem={refItem} version={version} />,
});
