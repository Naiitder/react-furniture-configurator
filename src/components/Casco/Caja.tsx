import * as React from "react";
import * as THREE from "three";
import '@react-three/fiber';
import BordeTriangular from "./BordeTriangular";
import {useMaterial} from "../../assets/materials";

//TODO Si hay tanto borde eje Z y eje X hacer que solo se ponga los bordes en el lado frontal del mueble

// Componente para una caja individual
type CajaProps = {
    position: [number, number, number];
    rotation?: [number, number, number];
    width: number;
    height: number;
    depth: number;
    material: THREE.Material;

    bordesTriangulados: boolean;
    disableAdjustedWidth?: boolean;
    espesorBase: number;
    posicionCaja?: "top" | "bottom" | "left" | "right";
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
                                       material,
                                       bordesTriangulados,
                                       bordeEjeY = true,
                                       bordeEjeZ = false,
                                       posicionCaja = "top",
                                       orientacionBordeZ = "front",
                                       disableAdjustedWidth = false,
                                   }) => {
    const adjustedWidth = (!disableAdjustedWidth && bordesTriangulados && !bordeEjeY) ? width - (espesorBase * 2) : width;
    // Solo para frontal
    const adjustedHeight = bordesTriangulados && bordeEjeY && bordeEjeZ && orientacionBordeZ === "vertical" ? height - (espesorBase) : height;
    const adjustedDepth = bordesTriangulados && !bordeEjeY && bordeEjeZ && orientacionBordeZ === "front" ? depth - (espesorBase) : depth;

    const triangleZ = position[2] - depth / 2;
    const triangleY = (bordeEjeY) ? (position[1] - espesorBase / 2) + (adjustedHeight / 2) + espesorBase / 2 : position[1] - adjustedHeight / 2;

    const firstTriangleShape = (posicionCaja === "bottom" ? "topToRight" : (posicionCaja === "top") ? "bottomToRight" : (posicionCaja === "right" ? "topToRight" : "topToLeft"))
    const secondTriangleShape = (posicionCaja === "bottom" ? "topToLeft" : (posicionCaja === "left" ? "bottomToLeft" : (posicionCaja === "right" ? "bottomToRight" : "bottomToLeft")));

    return (<>
            <mesh position={position} material={material} rotation={rotation} onClick={(event) => event.stopPropagation()}>
                <boxGeometry args={[adjustedWidth, adjustedHeight, adjustedDepth]}/>
            </mesh>
            {(bordesTriangulados && !bordeEjeZ) && (
                <>
                    <BordeTriangular position={[position[0] - width / 2, triangleY, triangleZ]}
                                     rotation={[0, 0, 0]} espesor={espesorBase} depth={depth} color={material}
                                     shapeType={firstTriangleShape}
                    />
                    <BordeTriangular
                        position={[(position[0] + width / 2) - espesorBase, (triangleY - adjustedHeight) - (bordeEjeY ? espesorBase : -espesorBase), triangleZ]}
                        rotation={[0, 0, 0]} espesor={espesorBase} depth={depth} color={material}
                        shapeType={secondTriangleShape}
                    />
                </>
            )}

            {/*{bordesTriangulados && bordeEjeY && bordeEjeZ && orientacionBordeZ === "vertical" && (
                <>
                    <BordeTriangular position={[position[0], position[1] + height / 2, position[2]]}
                                     rotation={[Math.PI / 2, 0, 0]} espesor={espesorBase} depth={depth} color={color}
                                     shapeType={"topToRight"}
                    />
                    <BordeTriangular position={[position[0], position[1] - height / 2, position[2]]}
                                     rotation={[-Math.PI / 2, 0, 0]} espesor={espesorBase} depth={depth} color={color}
                                     shapeType={"topToLeft"}/>
                </>
            )}*/}
        </>
    );
};

export default Caja;
