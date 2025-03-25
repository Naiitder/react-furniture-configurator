import { createContext, useState, useContext } from "react";

const RoomConfiguratorContext = createContext();

export const RoomConfiguratorProvider = ({ children }) => {
    const [roomWidth, setRoomWidth] = useState(30);  // Ancho de la habitación
    const [roomHeight, setRoomHeight] = useState(10); // Altura de la habitación
    const [opacity, setOpacity] = useState(100); // Opacidad paredes

    return (
        <RoomConfiguratorContext.Provider value={{
            roomWidth,
            setRoomWidth,
            roomHeight,
            setRoomHeight,
            opacity,
            setOpacity,
        }}>
            {children}
        </RoomConfiguratorContext.Provider>
    );
}

export const useRoomConfigurator = () => {
    return useContext(RoomConfiguratorContext);
}