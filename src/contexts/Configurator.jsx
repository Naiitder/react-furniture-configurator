import { createContext, useState, useContext } from "react";

const ConfiguratorContext = createContext();

export const ConfiguratorProvider = ({children}) => {
    const [legs, setLegs] = useState(0);
    const [legsColor, setLegsColor] = useState("#777777");
    const [tableWidth, setTableWidth] = useState(100);
    const [tableHeight, setTableHeight] = useState(100);
    const [tableDepth, setTableDepth] = useState(100);

    return <ConfiguratorContext.Provider value={{
        legs,
        setLegs,
        legsColor,
        setLegsColor,
        tableWidth,
        setTableWidth,
        tableHeight,
        setTableHeight,
        tableDepth,
        setTableDepth,
    }}>
        {children}
    </ConfiguratorContext.Provider>
}

export const useConfigurator = () => {
    return useContext(ConfiguratorContext);
}