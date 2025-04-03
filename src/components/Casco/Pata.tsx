import * as React from "react";
import '@react-three/fiber';

type PataProps = {
    position?: [number, number, number];
    height: number;
    color?: string;
};

const Pata: React.FC<PataProps> = ({ position = [0, 0, 0], height, color = "#8B4513" }) => {
    return (
        <group>
            <group position={[position[0], position[1] + height / 2, position[2]]}>
                <mesh>
                    <cylinderGeometry args={[0.075, 0.075, height, 12]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>
            <mesh position={[position[0], position[1] + 0.025, position[2] ]}>
                <cylinderGeometry args={[0.1, 0.1, .05, 12]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>

    );
};

export default Pata;