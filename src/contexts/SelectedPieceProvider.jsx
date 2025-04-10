// En tu SelectedItemProvider.jsx
import React, { createContext, useContext, useState } from 'react';

export const SelectedPieceContext = createContext();

export function SelectedPieceProvider({ children }) {
    const [refPiece, setRefPiece] = useState(null);


    return (
        <SelectedPieceContext.Provider value={{ refPiece, setRefPiece }}>
            {children}
        </SelectedPieceContext.Provider>
    );
}

export function useSelectedPieceProvider() {
    return useContext(SelectedPieceContext);
}