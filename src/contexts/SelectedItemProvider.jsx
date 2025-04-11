import React, { createContext, useContext, useState, useRef } from 'react';

export const SelectedItemContext = createContext();

export function SelectedItemProvider({ children }) {
    const [refItem, setRefItemInternal] = useState(null);
    const componentRefs = useRef({});

    const setRefItem = (newRef) => {
        // Validar que newRef no sea null o undefined
        if (!newRef) {
            setRefItemInternal(null);
            return;
        }

        // Extrae cualquier componente React antes de guardarlo en el estado
        const { pata, ...serializableProps } = newRef;

        // Guarda el componente en una referencia separada
        if (pata) {
            componentRefs.current.pata = pata;
        }

        // Guarda las propiedades serializables en el estado
        setRefItemInternal(serializableProps);
    };

    // Función para obtener tanto props serializables como componentes
    const getFullRef = () => {
        if (!refItem) return null;

        return {
            ...refItem,
            pata: componentRefs.current.pata
        };
    };

    return (
        <SelectedItemContext.Provider value={{ refItem, setRefItem, getFullRef }}>
            {children}
        </SelectedItemContext.Provider>
    );
}

export function useSelectedItemProvider() {
    return useContext(SelectedItemContext);
}