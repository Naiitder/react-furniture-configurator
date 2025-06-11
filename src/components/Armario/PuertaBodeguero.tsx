import * as React from "react";
import { useEffect, useRef } from "react";
import { useMaterial } from "../../assets/materials";
import Tabla from "../Casco/Tabla";
import { PuertaProps } from "../Casco/Puerta";
import { AgarreBodeguero } from "./AgarreBodeguero";

const PuertaBodeguero: React.FC<PuertaProps & { extraAltura?: number }> = ({
                                                                               parentRef,
                                                                               insideRef,
                                                                               position = [0, 0, 0],
                                                                               width,
                                                                               height,
                                                                               depth,
                                                                               color = "#654321",
                                                                               pivot = "right",
                                                                               extraAltura = 0,
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

    // Ajustar la posición inicial de la caja desde la base de la puerta
    const boxPosition: [number, number, number] = [
        width / 2 * (pivot === "right" ? -1 : 1),
        0, // Comienza desde la base, el offset Y viene del position prop
        0,
    ];

    const materials = useMaterial();

    return (
        <group position={position} onClick={handleClick}>
            <group position={[doorX, 0, doorZ]} rotation={[0, doorRotation, 0]}>
                <Tabla
                    parentRef={parentRef}
                    insideRef={insideRef}
                    ref={doorRef}
                    position={boxPosition}
                    width={width}
                    height={height}
                    depth={depth}
                    material={materials.Nogal}
                    espesorBase={0.1}
                    shape={"box"}
                    bordeEjeY={false}
                    bordeEjeZ={false}
                    stopPropagation={false}
                />
                <AgarreBodeguero position={[-(width / 2), height / 2, 0]} /> {/* Centrado en la puerta */}
            </group>
        </group>
    );
};

export default PuertaBodeguero;