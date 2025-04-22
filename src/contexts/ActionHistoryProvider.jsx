import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { UndoRedoHistory } from './history/UndoRedoHistory.js';

export const ActionHistoryContext = createContext();

export const ActionHistoryProvider = ({ children }) => {
  const [history] = useState(new UndoRedoHistory(100));
  const [sceneState, setSceneState] = useState({});

  const captureSceneState = useCallback((objectsMap) => {
    const snapshot = {};
    Object.keys(objectsMap).forEach((id) => {
      const obj = objectsMap[id];
      snapshot[id] = {
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone(),
        userData: { ...obj.userData },
      };
    });
    return snapshot;
  }, []);

  const addSceneAction = useCallback((objectsMap) => {
    const snapshot = captureSceneState(objectsMap);
    history.addState(snapshot);
    setSceneState({ ...snapshot }); // <- Clonamos para forzar re-render
  }, [captureSceneState, history]);

  const undoAction = useCallback(() => {
    const previousSnapshot = history.undo();
    if (previousSnapshot) {
      setSceneState({ ...previousSnapshot }); // <- Clonamos para forzar re-render
    }
    return previousSnapshot;
  }, [history]);

  const redoAction = useCallback(() => {
    const nextSnapshot = history.redo();
    if (nextSnapshot) {
      setSceneState({ ...nextSnapshot }); // <- Clonamos para forzar re-render
    }
    return nextSnapshot;
  }, [history]);

  const contextValue = useMemo(() => ({
    sceneState,
    addSceneAction,
    undoAction,
    redoAction
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