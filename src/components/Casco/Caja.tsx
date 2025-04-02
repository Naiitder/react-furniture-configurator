import * as React from "react";
import '@react-three/fiber';
import BordeTriangular from "./BordeTriangular";

//TODO Si hay tanto borde eje Z y eje X hacer que solo se ponga los bordes en el lado frontal del mueble

// Componente para una caja individual
type CajaProps = {
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    color: string;

    bordesTriangulados: boolean;
    disableAdjustedWidth?: boolean;
    espesorBase: number;
    orientacionBordes?: "top" | "bottom" | "left" | "right";
    bordeEjeY?: boolean;
    bordeEjeZ?: boolean;
    orientacionBordeZ?: "vertical" | "front";
}

const Caja: React.FC<CajaProps> = ({
                                       position,
                                       rotation = [0, 0, 0],
                                       espesorBase,
                                       width,
                                       height,
                                       depth,
                                       color,
                                       bordesTriangulados,
                                       bordeEjeY = true,
                                       bordeEjeZ = false,
                                       orientacionBordes = "top",
                                       orientacionBordeZ = "front",
                                       disableAdjustedWidth = false,
                                   }) => {
    const adjustedWidth = (!disableAdjustedWidth && bordesTriangulados && !bordeEjeY) ? width - (espesorBase * 2) : width;
    // Solo para frontal
    const adjustedHeight = bordesTriangulados && bordeEjeY && bordeEjeZ && orientacionBordeZ === "vertical" ? height - (espesorBase) : height;
    const adjustedDepth = bordesTriangulados && !bordeEjeY && bordeEjeZ && orientacionBordeZ === "front" ? depth - (espesorBase) : depth;


    return (<>
            <mesh position={position} rotation={rotation} onClick={(event) => event.stopPropagation()}>
                <boxGeometry args={[adjustedWidth, adjustedHeight, adjustedDepth]}/>
                <meshStandardMaterial color={color}/>
            </mesh>
            {bordesTriangulados && (
                <>
                    <BordeTriangular position={[position[0] - width / 2, position[1], position[2]]}
                                     rotation={[0, 0, 0]} espesor={espesorBase} depth={depth} color={color}/>
                    <BordeTriangular position={[position[0] + width / 2, position[1], position[2]]}
                                     rotation={[0, 0, Math.PI]} espesor={espesorBase} depth={depth} color={color}/>
                </>
            )}

            {bordeEjeY && (
                <>
                    <BordeTriangular position={[position[0], position[1] + height / 2, position[2]]}
                                     rotation={[Math.PI / 2, 0, 0]} espesor={espesorBase} depth={depth} color={color}/>
                    <BordeTriangular position={[position[0], position[1] - height / 2, position[2]]}
                                     rotation={[-Math.PI / 2, 0, 0]} espesor={espesorBase} depth={depth} color={color}/>
                </>
            )}
        </>
    );
};

export default Caja;
