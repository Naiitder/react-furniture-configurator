// En tu SelectedItemProvider.jsx
import React, { createContext, useContext, useState } from 'react';

export const SelectedPieceContext = createContext();

export function SelectedPieceProvider({ children }) {
    const [refPiece, setRefPiece] = useState(null);
    const [version, setVersion] = useState(0);


    return (
        <SelectedPieceContext.Provider value={{ refPiece, setRefPiece, version, setVersion }}>
            {children}
        </SelectedPieceContext.Provider>
    );
}

export function useSelectedPieceProvider() {
    return useContext(SelectedPieceContext);
}