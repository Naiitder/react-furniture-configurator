import {Object3D, Scene} from "three";

export function findScene(sceneObject: Object3D): Scene | null {
    // Caso base: si ya es una Scene, la devolvemos
    if (sceneObject instanceof Scene) {
        return sceneObject;
    }

    // Caso base: si no tiene parent, no hay Scene
    if (!sceneObject.parent) {
        return null;
    }

    // Caso recursivo: buscar en el parent
    return findScene(sceneObject.parent);
}