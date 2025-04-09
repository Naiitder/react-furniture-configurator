import * as React from "react";
import '@react-three/fiber';
import { useRef, useEffect } from "react";
import * as THREE from "three";
import {Pomo} from "./Pomo";
import {useMaterial} from "../../assets/materials";
import Caja from "./Caja"; // Asegúrate de importar el componente Caja

type PuertaProps = {
    position?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    color?: string;
    pivot?: "left" | "right";
};

const Puerta: React.FC<PuertaProps> = ({
                                           position = [0, 0, 0],
                                           width,
                                           height,
                                           depth,
                                           color = "#654321",
                                           pivot = "right"
                                       }) => {
    const [doorRotation, setDoorRotation] = React.useState(0);
    const [targetRotation, setTargetRotation] = React.useState(0);
    const doorRef = useRef(null);

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
        const angle = Math.PI / 2;
        const direction = pivot === "left" ? -1 : 1;
        setTargetRotation(targetRotation === 0 ? direction * angle : 0);
        event.stopPropagation();
    };

    const offset = Math.sin(doorRotation) * 0.5 * depth;
    const direction = pivot === "right" ? -1 : 1;
    const doorX = (pivot === "right" ? direction : -direction) * offset;
    const doorZ = direction * offset;

    const materials = useMaterial();

    // Ajustar la posición inicial de la caja según el pivote
    const boxPosition: [number, number, number] = [
        width / 2 * (pivot === "right" ? -1 : 1),
        0,
        0
    ];

    return (
        <group position={position} onClick={handleClick}>
            <group position={[doorX, 0, doorZ]} rotation={[0, doorRotation, 0]}>
                <Caja
                    ref={doorRef}
                    position={boxPosition}
                    width={width}
                    height={height}
                    depth={depth}
                    material={materials.WoodWorn}
                    espesorBase={0.1} // Ajusta según necesites
                    shape={"box"}
                    bordeEjeY={false}
                    bordeEjeZ={false}
                    stopPropagation={false}
                />
                <group position={[(pivot === "right" ? (-width+(width*10/100)) : (width -(width*10/100))), 0, depth/2]}>
                    <Pomo scale={[0.2, 0.2, 0.2]}/>
                </group>
            </group>
        </group>
    );
};

export default Puerta;