import { createContext, useState, useContext } from "react";

const CascoConfiguratorContext = createContext();

export const CascoConfiguratorProvider = ({children}) => {
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(100);
    const [depth, setDepth] = useState(100);
    const [texture, setTexture] = useState("./textures/oak.jpg");

    return <CascoConfiguratorContext.Provider value={{
        width,
        setWidth,
        height,
        setHeight,
        depth,
        setDepth,
        texture,
        setTexture
    }}>
        {children}
    </CascoConfiguratorContext.Provider>
}

export const useCascoConfigurator = () => {
    return useContext(CascoConfiguratorContext);
}