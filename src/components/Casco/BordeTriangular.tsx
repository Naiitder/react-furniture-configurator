import * as React from "react";
import '@react-three/fiber';

type TrianguloProps = {
    position: [number, number, number];
    rotation?: [number, number, number];
    espesor: number;
    depth: number;
    color: string;
}

const BordeTriangular: React.FC<TrianguloProps> = ({ position, rotation = [0,0,0], espesor, depth, color}) => {
    return (
        <mesh position={position} rotation={rotation} onClick={(event) => event.stopPropagation()}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={new Float32Array([
                        0, 0, 0,         // Vértice 1
                        espesor, 0, 0,   // Vértice 2
                        0, espesor, 0    // Vértice 3
                    ])}
                    itemSize={3}
                    count={3}
                />
                <bufferAttribute
                    attach="index"
                    array={new Uint16Array([0, 1, 2])}
                    itemSize={1}
                />
            </bufferGeometry>
            <meshStandardMaterial color={color} side={2} />
        </mesh>
    );
};

export default BordeTriangular;
