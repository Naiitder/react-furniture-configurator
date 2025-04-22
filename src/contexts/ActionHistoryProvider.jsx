import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { UndoRedoHistory } from './UndoRedoHistory';

export const ActionHistoryContext = createContext();

export const ActionHistoryProvider = ({ children }) => {
  // Creamos una instancia de historial que guardará snapshots de la escena.
  const [history] = useState(new UndoRedoHistory(25));
  // El estado actual de la escena se representará como un mapeo: { objetoId: objetoClonado }
  const [sceneState, setSceneState] = useState({});

  // Función para generar un snapshot (una copia) de los estados de todos los objetos que se desean administrar
  const captureSceneState = useCallback((objectsMap) => {
    const snapshot = {};
    Object.keys(objectsMap).forEach((id) => {
      const obj = objectsMap[id];
      // Si el objeto tiene el metodo clone, se clona recursivamente
      snapshot[id] = (obj && typeof obj.clone === 'function') ? obj.clone(true) : obj;
    });
    return snapshot;
  }, []);

  // Función para agregar un nuevo snapshot al historial.
  // objectsMap es un objeto donde las claves son identificadores y los valores, los objetos ThreeJS.
  const addSceneAction = useCallback((objectsMap) => {
    const snapshot = captureSceneState(objectsMap);
    history.addState(snapshot);
    setSceneState(snapshot);
  }, [captureSceneState, history]);

  // Función para deshacer: se retrocede en el historial y se actualiza el estado de la escena.
  const undoAction = useCallback(() => {
    const previousSnapshot = history.undo();
    if (previousSnapshot) {
      setSceneState(previousSnapshot);
    }
    return previousSnapshot;
  }, [history]);

  // Función para rehacer: se avanza en el historial y se actualiza el estado de la escena.
  const redoAction = useCallback(() => {
    const nextSnapshot = history.redo();
    if (nextSnapshot) {
      setSceneState(nextSnapshot);
    }
    return nextSnapshot;
  }, [history]);

  const contextValue = useMemo(() => ({
    sceneState,     // Snapshot actual de la escena
    addSceneAction, // Función para agregar un snapshot al historial
    undoAction,     // Función para deshacer cambios
    redoAction      // Función para rehacer cambios
  }), [sceneState, addSceneAction, undoAction, redoAction]);

  return (
    <ActionHistoryContext.Provider value={contextValue}>
      {children}
    </ActionHistoryContext.Provider>
  );
};

export function useActionHistory() {
  return useContext(ActionHistoryContext);
}