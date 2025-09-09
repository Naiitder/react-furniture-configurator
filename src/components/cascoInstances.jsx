// useCascoInstances.jsx
import { useState } from "react";
import InterseccionMueble, { Orientacion } from "./Interseccion.js";
import PataAparador from "./Aparador/PataAparador.js";
import Puerta from "./Casco/Puerta.js";
import PuertaBodeguero from "./Armario/PuertaBodeguero.js";
import Pata from "./Casco/Pata.js";

function buildInitialCascoInstances() {
    const t0 = Date.now();
    const i1 = new InterseccionMueble({ x: 0.5, y: 0.5 },  Orientacion.Horizontal, false, new Date(t0 + 1));
    const i2 = new InterseccionMueble({ x: 0.5, y: 0.75 }, Orientacion.Horizontal, false, new Date(t0 + 2));
    const i3 = new InterseccionMueble({ x: 0.5, y: 0.25 }, Orientacion.Horizontal, false, new Date(t0 + 3));
    const i4 = new InterseccionMueble({ x: 0.5, y: 0.60 }, Orientacion.Vertical,   false, new Date(t0 + 4));
    const i5 = new InterseccionMueble({ x: 0.5, y: 0.80 }, Orientacion.Vertical,   false, new Date(t0 + 5));

    return {
        casco1: {
            id: 'casco1',
            name: 'Casco1',
            position: [-3, 0, 0],
            rotation: [0, 0, 0],
            userData: { width: 2, height: 2, depth: 2, espesor: 0.1 },
            patas: [<Pata height={1} />],
            puertas: [<PuertaBodeguero width={1} height={1} depth={0.1} />],
            intersecciones: [],
        },
        casco2: {
            id: 'casco2',
            name: 'Casco2',
            position: [3, 0, 0],
            rotation: [0, 0, 0],
            userData: { width: 2, height: 2, depth: 3, espesor: 0.1 },
            patas: [<Pata height={1} />],
            puertas: [<Puerta width={1} height={1} depth={0.1} />],
            intersecciones: [],
        },
        casco3: {
            id: 'casco3',
            name: 'Casco3',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            userData: { width: 2, height: 2, depth: 2, espesor: 0.1 },
            patas: [<Pata height={1} />],
            puertas: [<Puerta width={1} height={1} depth={0.1} />],
            intersecciones: [],
        },
        casco4: {
            id: 'casco4',
            name: 'Casco4',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            userData: { width: 1.54, height: .93, depth: .6, espesor: 0.05 },
            patas: [<PataAparador height={.1} />],
            puertas: [<Puerta width={1} height={1} depth={0.1} />],
            intersecciones: [],
        },
        casco5: {
            id: 'casco5',
            name: 'Casco5',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            userData: { width: 0.74, height: 1.23, depth: .37, espesor: 0.02 },
            intersecciones: [
                new InterseccionMueble({ x: 0.5, y: 0.75 },   Orientacion.Horizontal),
                new InterseccionMueble({ x: 0.5, y: 0.6225 }, Orientacion.Vertical),
                new InterseccionMueble({ x: 0.5, y: 0.87 },   Orientacion.Vertical),
            ],
            patas: [<PataAparador height={.1} />],
            puertas: [<Puerta width={1} height={1} depth={0.1} />],
        },
        casco6: {
            id: 'casco6',
            name: 'Casco6',
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            userData: { width: 0.74, height: 1.23, depth: .37, espesor: 0.02 },
            patas: [<PataAparador height={.1} />],
            puertas: [<PuertaBodeguero width={1} height={0.5} depth={1} espesor={0.02} />],
            intersecciones: [],
        },
    };
}

export const useCascoInstances = () => {
    // Inicializa una sola vez (lazy init). En StrictMode se invoca dos veces en dev,
    // por eso la función debe ser pura (y lo es).
    const [cascoInstances, setCascoInstances] = useState(buildInitialCascoInstances);
    return [cascoInstances, setCascoInstances];
};