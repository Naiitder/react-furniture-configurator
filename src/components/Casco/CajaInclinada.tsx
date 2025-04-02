import * as THREE from 'three';
import * as React from 'react';
import { useMemo } from 'react';
import '@react-three/fiber';

type TruncatedBoxProps = {
    position: [number, number, number];
    width: number;
    height: number;
    depth: number;
    scaleX: number; // Factor de escala para el ancho de la cara superior (0-1)
    scaleZ: number; // Factor de escala para la profundidad de la cara superior (0-1)
    color: string;
    wireframe?: boolean;
}

const TruncatedBox: React.FC<TruncatedBoxProps> = ({
                                                       position,
                                                       width,
                                                       height,
                                                       depth,
                                                       scaleX,
                                                       scaleZ,
                                                       color,
                                                       wireframe = false
                                                   }) => {
    // Asegurar que los factores de escala estén entre 0 y 1
    const safeScaleX = Math.max(0, Math.min(1, scaleX));
    const safeScaleZ = Math.max(0, Math.min(1, scaleZ));

    // Calcular las dimensiones de la cara superior
    const topWidth = width * safeScaleX;
    const topDepth = depth * safeScaleZ;

    // Calcular el desplazamiento para centrar la cara superior
    const offsetX = (width - topWidth) / 2;
    const offsetZ = (depth - topDepth) / 2;

    // Crear geometría personalizada para la caja truncada
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();

        // Definir los 8 vértices de nuestra caja
        const vertices = [
            // Cara inferior (sin cambios)
            new THREE.Vector3(-width/2, -height/2, -depth/2),  // 0: inferior izquierda atrás
            new THREE.Vector3(width/2, -height/2, -depth/2),   // 1: inferior derecha atrás
            new THREE.Vector3(width/2, -height/2, depth/2),    // 2: inferior derecha adelante
            new THREE.Vector3(-width/2, -height/2, depth/2),   // 3: inferior izquierda adelante

            // Cara superior (escalada)
            new THREE.Vector3(-topWidth/2, height/2, -topDepth/2),  // 4: superior izquierda atrás
            new THREE.Vector3(topWidth/2, height/2, -topDepth/2),   // 5: superior derecha atrás
            new THREE.Vector3(topWidth/2, height/2, topDepth/2),    // 6: superior derecha adelante
            new THREE.Vector3(-topWidth/2, height/2, topDepth/2)    // 7: superior izquierda adelante
        ];

        // Definir las caras como triángulos (dos triángulos por cara, 6 caras en total)
        const indices = [
            // Cara inferior
            0, 3, 1, 1, 3, 2,
            // Cara superior
            4, 5, 7, 7, 5, 6,
            // Cara izquierda
            0, 4, 3, 3, 4, 7,
            // Cara derecha
            1, 2, 5, 5, 2, 6,
            // Cara frontal
            3, 7, 2, 2, 7, 6,
            // Cara trasera
            0, 1, 4, 4, 1, 5
        ];

        // Convertir vértices a un array plano
        const verticesArray = [];
        for (let vertex of vertices) {
            verticesArray.push(vertex.x, vertex.y, vertex.z);
        }

        // Establecer atributos
        geo.setIndex(indices);
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
        geo.computeVertexNormals();

        return geo;
    }, [width, height, depth, topWidth, topDepth]);

    return (
        <mesh position={position} geometry={geometry}>
            <meshStandardMaterial color={color} wireframe={wireframe} side={THREE.DoubleSide} />
        </mesh>
    );
};

// Example usage component with controls

export default TruncatedBox;