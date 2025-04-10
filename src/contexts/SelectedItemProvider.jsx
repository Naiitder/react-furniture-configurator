import React, { createContext, useContext, useState, useRef } from 'react';

export const SelectedItemContext = createContext();

export function SelectedItemProvider({ children }) {
    const [refItem, setRefItemInternal] = useState(null);
    const componentRefs = useRef({}); // Para almacenar referencias a componentes Three.js

    const setRefItem = (newRef) => {
        if (!newRef) {
            setRefItemInternal(null);
            componentRefs.current = {};
            return;
        }

        // Separar propiedades serializables de componentes Three.js
        const { pata, ...serializableProps } = newRef;

        // Guardar componentes en una referencia separada
        if (pata) {
            componentRefs.current.pata = pata;
        }

        // Actualizar el estado con propiedades serializables
        setRefItemInternal(serializableProps);
    };

    // Combinar datos serializables con componentes cuando sea necesario
    const getFullRefItem = () => {
        return {
            ...refItem,
            pata: componentRefs.current.pata,
        };
    };

    return (
        <SelectedItemContext.Provider value={{ refItem, setRefItem, getFullRefItem }}>
            {children}
        </SelectedItemContext.Provider>
    );
}

export function useSelectedItemProvider() {
    return useContext(SelectedItemContext);
}