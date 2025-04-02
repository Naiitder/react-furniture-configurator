import * as React from "react";
import '@react-three/fiber';
import { useRef, useEffect } from "react";

type PuertaProps = {
    position?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    color?: string;
    pivot?: "left" | "right"; // Definir el pivote
};

const Puerta: React.FC<PuertaProps> = ({
                                           position = [0, 0, 0],
                                           width,
                                           height,
                                           depth,
                                           color = "#654321",
                                           pivot = "right" // Por defecto, pivote en el lado derecho
                                       }) => {
    const [doorRotation, setDoorRotation] = React.useState(0);
    const [targetRotation, setTargetRotation] = React.useState(0);

    useEffect(() => {
        let animationFrame;
        const animate = () => {
            setDoorRotation((prev) => {
                const newRotation = prev + (targetRotation - prev) * 0.1;
                if (Math.abs(newRotation - targetRotation) < 0.01) return targetRotation;
                animationFrame = requestAnimationFrame(animate);
                return newRotation;
            });
        };
        animate();
        return () => cancelAnimationFrame(animationFrame);
    }, [targetRotation]);

    const handleClick = (event) => {
        setTargetRotation(targetRotation === 0 ? Math.PI / 2 : 0);
        event.stopPropagation();
    };

    // Ajustar la posición del pivote
    const pivotOffset = pivot === "right" ? width / 2 : -width / 2;

    return (
        <group position={[position[0] + pivotOffset, position[1], position[2]]}>
            <mesh position={[-pivotOffset, 0, 0]} rotation={[0, doorRotation, 0]} onClick={handleClick}>
                <boxGeometry args={[width, height, depth]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
};

export default Puerta;