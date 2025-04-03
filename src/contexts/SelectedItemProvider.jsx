import { createContext, useState, useContext, useCallback } from "react";

const SelectedItemContext = createContext();

export const SelectedItemProvider = ({ children }) => {
    const [selectedItem, setSelectedItem] = useState(null);

    // Wrapper para setSelectedItem que asegura que siempre creamos un nuevo objeto
    const updateSelectedItem = useCallback((newValue) => {
        if (typeof newValue === 'function') {
            setSelectedItem(prev => {
                const updatedValue = newValue(prev);
                // Aseguramos que retornamos un nuevo objeto
                return {...updatedValue};
            });
        } else {
            // Aseguramos que asignamos un nuevo objeto
            setSelectedItem({...newValue});
        }
    }, []);

    return (
        <SelectedItemContext.Provider value={{
            ref: selectedItem,
            setRef: updateSelectedItem
        }}>
            {children}
        </SelectedItemContext.Provider>
    );
};

export const useSelectedItemProvider = () => {
    const context = useContext(SelectedItemContext);
    if (context === undefined) {
        throw new Error('useSelectedItemProvider debe usarse dentro de un SelectedItemProvider');
    }
    return context;
};