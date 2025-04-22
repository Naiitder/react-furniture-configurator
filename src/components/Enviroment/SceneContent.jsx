import { useThree } from "@react-three/fiber";
import { TransformControls, OrbitControls, Environment, Stage } from "@react-three/drei";
import { useEffect } from "react";
import { Room } from "./Room.jsx";
import * as THREE from "three";

const SceneContent = ({
                          transformRef,
                          glRef,
                          cameraRef,

                          selectedItem,
                          cascoInstances,
                          refItem,
                          refPiece,
                          transformEnabled,
                          transformMode,
                          setNeedsSnapshot,
                          itemComponents,
                          handleCascoClick,
                          cascoVersions,
                          setCascoVersions,
                          addSceneAction,
                          sceneState,
                          onSceneUpdate,
                          sceneRef,
                      }) => {
    const { scene } = useThree();

    useEffect(() => {
        if (scene) {
            console.log("SceneContent - Enviando escena:", scene);
            sceneRef.current = scene;
            onSceneUpdate(scene);
        }
    }, [scene, onSceneUpdate]);

    useEffect(() => {
        if (sceneState) {
            Object.entries(sceneState).forEach(([id, state]) => {
                console.log(id)
                const original = scene.getObjectByName(id);
                if (original) {
                    console.log(`Restaurando casco ${id}:`, state);
                    original.position.copy(state.position);
                    original.rotation.copy(state.rotation);
                    original.scale.copy(state.scale);
                    original.userData = { ...state.userData };
                    original.updateMatrix();
                    original.updateMatrixWorld();
                }
            });
            setCascoVersions((prev) => {
                const newVersions = { ...prev };
                Object.keys(sceneState).forEach((id) => {
                    newVersions[id] = (newVersions[id] || 0) + 1;
                });
                return newVersions;
            });
        }
    }, [sceneState, scene, setCascoVersions]);

    return (
        <>
            <Room positionY={3.5} />
            <Stage intensity={5} environment={null} shadows="contact" adjustCamera={false}>
                <Environment files={"/images/poly_haven_studio_4k.hdr"} />
                {itemComponents[selectedItem]}
            </Stage>
            {transformEnabled && refItem && (
                <TransformControls
                    ref={transformRef}
                    object={refPiece ? refPiece : refItem.groupRef}
                    mode={transformMode}
                />
            )}
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
        </>
    );
};

export default SceneContent;