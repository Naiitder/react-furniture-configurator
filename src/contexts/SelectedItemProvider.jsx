import React, {createContext, useContext, useState, useRef, useCallback, useMemo} from 'react';

export const SelectedItemContext = createContext();

// Example of a more optimized context provider
export const SelectedItemProvider = ({ children }) => {
    const [refItem, setRefItemInternal] = useState(null);
    const [version, setVersion] = useState(0);

    const setRefItem = useCallback((newRef) => {
        setRefItemInternal(newRef);
    }, []);

    // Memoize the context value
    const contextValue = useMemo(() => ({
        refItem,
        setRefItem,
        version,
        setVersion,
    }), [refItem, setRefItem, version, setVersion]);

    return (
        <SelectedItemContext.Provider value={contextValue}>
            {children}
        </SelectedItemContext.Provider>
    );
};
export function useSelectedItemProvider() {
    return useContext(SelectedItemContext);
}