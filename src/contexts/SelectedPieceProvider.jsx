import React, { createContext, useContext, useState } from 'react';

export const SelectedPieceContext = createContext();

export function SelectedPieceProvider({ children }) {
    const [refPiece, setPiece] = useState([]);

    return (
        <SelectedPieceContext.Provider value={{ refPiece, setPiece }}>
            {children}
        </SelectedPieceContext.Provider>
    );
}

export function useSelectedPieceProvider() {
    return useContext(SelectedPieceContext);
}