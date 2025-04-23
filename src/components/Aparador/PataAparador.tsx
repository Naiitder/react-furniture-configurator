import * as React from "react";
import '@react-three/fiber';
import {useMaterial} from "../../assets/materials";

type PataProps = {
    position?: [number, number, number];
    height: number;
    color?: string;
};


const PataAparador: React.FC<PataProps> = ({ position = [0, 0, 0], height, color = "#8B4513" }) => {

    const materials = useMaterial();

    return (
        <group>
            <group position={[position[0], position[1] + height / 2, position[2]]}>
                <mesh  material={materials.Goma}>
                    <boxGeometry args={[0.075, height, 0.075]} />
                </mesh>
            </group>
        </group>

    );
};

export default PataAparador;