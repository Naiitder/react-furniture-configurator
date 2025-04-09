// En tu SelectedItemProvider.jsx
import React, { createContext, useContext, useState, useRef } from 'react';

export const SelectedPieceContext = createContext();

export function SelectedPieceProvider({ children }) {
    const [refPiece, setRefInternal] = useState(null);

    const setRef = (newRef) => {
        // Extrae cualquier componente React antes de guardarlo en el estado
        const { ...serializableProps } = newRef;

        // Guarda las propiedades serializables en el estado
        setRefInternal(serializableProps);
    };

    // Función para obtener tanto props serializables como componentes
    const getFullRef = () => {
        return {
            ...refPiece
        };
    };

    return (
        <SelectedPieceContext.Provider value={{ refPiece, setRef, getFullRef }}>
            {children}
        </SelectedPieceContext.Provider>
    );
}

export function useSelectedPieceProvider() {
    return useContext(SelectedPieceContext);
}