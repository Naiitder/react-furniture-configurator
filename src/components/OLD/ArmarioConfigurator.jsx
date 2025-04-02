import { createContext, useState, useContext } from "react";

const ArmarioConfiguratorContext = createContext();

export const ArmarioConfiguratorProvider = ({children}) => {
    const [closetWidth, setClosetWidth] = useState(100);
    const [closetHeight, setClosetHeight] = useState(100);
    const [closetDepth, setClosetDepth] = useState(100);
    const [texture, setTexture] = useState("./textures/oak.jpg");

    return <ArmarioConfiguratorContext.Provider value={{
        closetWidth,
        setClosetWidth,
        closetHeight,
        setClosetHeight,
        closetDepth,
        setClosetDepth,
        texture,
        setTexture
    }}>
        {children}
    </ArmarioConfiguratorContext.Provider>
}

export const useArmarioConfigurator = () => {
    return useContext(ArmarioConfiguratorContext);
}