import React, { createContext, useState, useContext } from "react";
import Pata from "../components/Casco/Pata.js";

const CascoConfiguratorContext = createContext();

export const CascoConfiguratorProvider = ({children}) => {
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);
    const [depth, setDepth] = useState(100);
    const [texture, setTexture] = useState("./textures/oak.jpg");
    const [esquinaXTriangulada, setEsquinaXTriangulada] = useState(false);
    const [esquinaZTriangulada, setEsquinaZTriangulada] = useState(false);
    const [espesor, setEspesor] = useState(0.1);
    const [sueloDentro, setSueloDentro] = useState(false);
    const [techoDentro, setTechoDentro] = useState(false);
    const [traseroDentro, setTraseroDentro] = useState(false);
    const [offsetTrasero, setOffsetTrasero] = useState(0);
    const [pataHeight, setPataHeight] = useState(0);

    return <CascoConfiguratorContext.Provider value={{
        width,
        setWidth,
        height,
        setHeight,
        depth,
        setDepth,
        texture,
        setTexture,
        esquinaXTriangulada,
        setEsquinaXTriangulada,
        esquinaZTriangulada,
        setEsquinaZTriangulada,
        espesor,
        setEspesor,
        sueloDentro,
        setSueloDentro,
        techoDentro,
        setTechoDentro,
        traseroDentro,
        setTraseroDentro,
        offsetTrasero,
        setOffsetTrasero,
        pataHeight,
        setPataHeight,
    }}>
        {children}
    </CascoConfiguratorContext.Provider>
}

export const useCascoConfigurator = () => {
    return useContext(CascoConfiguratorContext);
}