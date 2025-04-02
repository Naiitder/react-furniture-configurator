import * as React from "react";
import '@react-three/fiber';


// Componente para una caja individual
type CajaProps = {
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    color: string;
}

const Caja: React.FC<CajaProps> = ({ position, rotation = [0,0,0], width, height, depth, color }) => {
    return (
        <mesh position={position} rotation={rotation} onClick={(event) => event.stopPropagation()}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

export default Caja;
