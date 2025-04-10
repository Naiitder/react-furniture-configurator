import React, {createContext, useContext, useState, useRef, useCallback, useMemo} from 'react';

export const SelectedItemContext = createContext();

// Example of a more optimized context provider
export const SelectedItemProvider = ({ children }) => {
    const [refItem, setRefItemInternal] = useState(null);

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
        setRefItem
    }), [refItem, setRefItem]);

    return (
        <SelectedItemContext.Provider value={contextValue}>
            {children}
        </SelectedItemContext.Provider>
    );
};
export function useSelectedItemProvider() {
    return useContext(SelectedItemContext);
}