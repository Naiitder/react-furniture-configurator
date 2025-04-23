import React, { createContext, useContext, useState } from 'react';

export const SelectedCajonContext = createContext();

export function SelectedCajonProvider({ children }) {
    const [refCajon, setRefCajon] = useState(null);
    const [versionCajon, setVersionCajon] = useState(0);


    return (
        <SelectedCajonContext.Provider value={{ refCajon, setRefCajon, versionCajon, setVersionCajon }}>
            {children}
        </SelectedCajonContext.Provider>
    );
}

export function useSelectedCajonProvider() {
    return useContext(SelectedCajonContext);
}