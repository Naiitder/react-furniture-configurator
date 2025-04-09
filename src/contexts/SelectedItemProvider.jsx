import React, { createContext, useContext, useState, useRef } from 'react';

export const SelectedItemContext = createContext();

export function SelectedItemProvider({ children }) {
    const [ref, setRefInternal] = useState(null);
    const componentRefs = useRef({});

    const setRef = (newRef) => {
        // Validar que newRef no sea null o undefined
        if (!newRef) {
            setRefInternal(null);
            return;
        }

        // Extrae cualquier componente React antes de guardarlo en el estado
        const { pata, ...serializableProps } = newRef;

        // Guarda el componente en una referencia separada
        if (pata) {
            componentRefs.current.pata = pata;
        }

        // Guarda las propiedades serializables en el estado
        setRefInternal(serializableProps);
    };

    // Función para obtener tanto props serializables como componentes
    const getFullRef = () => {
        if (!ref) return null;

        return {
            ...ref,
            pata: componentRefs.current.pata
        };
    };

    return (
        <SelectedItemContext.Provider value={{ ref, setRef, getFullRef }}>
            {children}
        </SelectedItemContext.Provider>
    );
}

export function useSelectedItemProvider() {
    return useContext(SelectedItemContext);
}