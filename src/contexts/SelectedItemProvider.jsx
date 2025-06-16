import React, {createContext, useContext, useState, useCallback, useMemo} from 'react';

export const SelectedItemContext = createContext();

// Example of a more optimized context provider
export const SelectedItemProvider = ({ children }) => {
    const [refItem, setRefItemInternal] = useState(null);
    const [version, setVersion] = useState(0);

    // Memoize the setRefItem function
    const setRefItem = useCallback((newRef) => {
        setRefItemInternal(prev => {
            // Prevent unnecessary updates
            if (prev === newRef || (prev?.groupRef === newRef?.groupRef)) {
                return prev;
            }
            return newRef;
        });
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