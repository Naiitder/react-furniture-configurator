import React, {createContext, useContext, useState, useRef, useCallback, useMemo} from 'react';

export const SelectedItemContext = createContext();

// Example of a more optimized context provider
export const SelectedItemProvider = ({ children }) => {
    const [refItem, setRefItemInternal] = useState(null);
    const [selectedCascoId, setSelectedCascoId] = useState(null);
    const [refVersion, setRefVersion] = useState(0);

    const setRefItem = useCallback((newRef) => {
        setRefItemInternal(newRef);
    }, []);

    const contextValue = useMemo(() => ({
        refItem,
        setRefItem,
        selectedCascoId,
        setSelectedCascoId,
        refVersion,
        setRefVersion,
    }), [refItem, setRefItem, selectedCascoId, refVersion]);


    return (
        <SelectedItemContext.Provider value={contextValue}>
            {children}
        </SelectedItemContext.Provider>
    );
};

export function useSelectedItemProvider() {
    return useContext(SelectedItemContext);
}