import * as THREE from "three";

export function Room({positionY = 3.8, roomWidth = 30, roomHeight = 10, ...props}) {
    let halfRoomWidth = roomWidth / 2;
    let halfRoomHeight = roomHeight / 2;

    // Calcula el desplazamiento vertical basado en la altura de la habitación
    const verticalOffset = positionY + (roomHeight - 10) / 2;

    return (
        <group {...props} dispose={null} position={[0, verticalOffset, 0]}>
            {/* Pared frontal */}
            <mesh position={[0, 0, -halfRoomWidth]} receiveShadow={false} castShadow={false}>
                <planeGeometry args={[roomWidth, roomHeight]}/>
                <meshStandardMaterial color="white" side={THREE.FrontSide} transparent={true} opacity={1}/>
            </mesh>

            {/* Pared trasera */}
            <mesh position={[0, 0, halfRoomWidth]} receiveShadow={false} castShadow={false}>
                <planeGeometry args={[roomWidth, roomHeight]}/>
                <meshStandardMaterial color="white" side={THREE.BackSide} transparent={true} opacity={1}/>
            </mesh>

            {/* Pared izquierda */}
            <mesh position={[-halfRoomWidth, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow={false}
                  castShadow={false}>
                <planeGeometry args={[roomWidth, roomHeight]}/>
                <meshStandardMaterial color="white" side={THREE.FrontSide} transparent={true} opacity={1}/>
            </mesh>

            {/* Pared derecha */}
            <mesh position={[halfRoomWidth, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow={false}
                  castShadow={false}>
                <planeGeometry args={[roomWidth, roomHeight]}/>
                <meshStandardMaterial color="white" side={THREE.FrontSide} transparent={true} opacity={1}/>
            </mesh>

            {/* Suelo */}
            <mesh position={[0, -halfRoomHeight, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow={false}
                  castShadow={false}>
                <planeGeometry args={[roomWidth, roomWidth]}/>
                <meshStandardMaterial color="white" side={THREE.BackSide} transparent={true} opacity={1}/>
            </mesh>

            {/* Techo */}
            <mesh position={[0, halfRoomHeight, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow={false}
                  castShadow={false}>
                <planeGeometry args={[roomWidth, roomWidth]}/>
                <meshStandardMaterial color="white" side={THREE.FrontSide} transparent={true} opacity={1}/>
            </mesh>
        </group>
    );
}