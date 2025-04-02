import * as THREE from "three";
import { useMemo } from "react";
import * as React from "react";

type TrianguloProps = {
    position: [number, number, number];
    rotation?: [number, number, number];
    espesor: number;  // grosor de la profundidad
    depth: number;    // profundidad
    color: string;
    shapeType: "topToLeft" | "topToRight" | "bottomToLeft" | "bottomToRight";
}

const BordeTriangular: React.FC<TrianguloProps> = ({position, rotation = [0, 0, 0], espesor, depth, color, shapeType}) => {
    // Definir una forma 2D (el triángulo rectángulo)
    const shape = useMemo(() => {
        const geometry = new THREE.Shape();
        switch (shapeType) {
            case "topToLeft":
                geometry.moveTo(0, espesor);  // punto A
                geometry.lineTo(0, 0);        // punto B
                geometry.lineTo(espesor, 0);  // punto C
                geometry.lineTo(0, espesor);  // Cerrar la forma
                break;
            case "topToRight":
                geometry.moveTo(espesor, espesor);  // punto A
                geometry.lineTo(espesor, 0);  // punto B
                geometry.lineTo(0, 0);        // punto C
                geometry.lineTo(espesor, espesor);  // Cerrar la forma
                break;
            case "bottomToLeft":
                geometry.moveTo(0, 0);        // punto A
                geometry.lineTo(0, espesor);  // punto B
                geometry.lineTo(espesor, espesor);  // punto C
                geometry.lineTo(0, 0);        // Cerrar la forma
                break;
            case "bottomToRight":
                geometry.moveTo(espesor, 0);  // punto A
                geometry.lineTo(espesor, espesor);  // punto B
                geometry.lineTo(0, espesor);  // punto C
                geometry.lineTo(espesor, 0);  // Cerrar la forma
                break;
        }
        return geometry;
    }, [espesor]);

    // Extruir la forma para crear la profundidad
    const geometry = useMemo(() => {
        const extrudeSettings = {
            depth, // Profundidad del triángulo
            bevelEnabled: false, // Sin biseles
        };
        return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }, [shape, depth]);

    // Crear el material con el color proporcionado
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color, wireframe: false }), [color]);

    // Crear la malla del triángulo extruido
    const mesh = useMemo(() => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        return mesh;
    }, [geometry, material, position, rotation]);

    return (
        <primitive object={mesh} />
    );
};

export default BordeTriangular;