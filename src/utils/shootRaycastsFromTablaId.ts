import {findScene} from "./findScene";
import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx";

export function shootRaycastsFromTablaId(tablaId: string, refItem: any) {
    if (!refItem) return;

    const scene = findScene(refItem?.groupRef);
    console.log(scene)
    const tablaObject = scene?.getObjectByProperty('uuid', tablaId);

    console.log("Tabla encontrada: ", tablaObject);


    if (tablaObject && typeof tablaObject.userData.shootRaycasts === 'function') {
        console.log("NUEVA VA A DISPARAR!!");
        return tablaObject.userData.shootRaycasts();
    }
}