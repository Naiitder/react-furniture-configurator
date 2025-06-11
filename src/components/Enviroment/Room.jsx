import * as THREE from "three";
import {useRoomConfigurator} from "../../contexts/RoomConfigurator.jsx";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider.jsx";
import {useSelectedCajonProvider} from "../../contexts/SelectedCajonProvider.jsx";

export function Room({positionY = 4, ...props}) {
    const { roomWidth, roomHeight, opacity } = useRoomConfigurator();

    let halfRoomWidth = roomWidth / 2;
    let halfRoomHeight = roomHeight / 2;

    const {refItem, setRefItem} = useSelectedItemProvider();
    const {refPiece, setRefPiece} = useSelectedPieceProvider();
    const {refCajon, setRefCajon} = useSelectedCajonProvider();

    // Calcula el desplazamiento vertical basado en la altura de la habitación
    const verticalOffset = positionY + (roomHeight - 10) / 2;

    return (
        <group {...props} dispose={null} position={[0, verticalOffset, 0]}>
            {/* Pared frontal */}
            <mesh position={[0, 0, -halfRoomWidth]} receiveShadow={false} castShadow={false}>
                <planeGeometry args={[roomWidth, roomHeight]}/>
                <meshStandardMaterial color="white" side={THREE.FrontSide} transparent={true} opacity={opacity / 100}/>
            </mesh>

            {/* Pared trasera */}
            <mesh position={[0, 0, halfRoomWidth]} receiveShadow={false} castShadow={false}>
                <planeGeometry args={[roomWidth, roomHeight]}/>
                <meshStandardMaterial color="white" side={THREE.BackSide} transparent={true} opacity={opacity / 100}/>
            </mesh>

            {/* Pared izquierda */}
            <mesh position={[-halfRoomWidth, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow={false}
                  castShadow={false}>
                <planeGeometry args={[roomWidth, roomHeight]}/>
                <meshStandardMaterial color="white" side={THREE.FrontSide} transparent={true} opacity={opacity / 100}/>
            </mesh>

            {/* Pared derecha */}
            <mesh position={[halfRoomWidth, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow={false}
                  castShadow={false}>
                <planeGeometry args={[roomWidth, roomHeight]}/>
                <meshStandardMaterial color="white" side={THREE.FrontSide} transparent={true} opacity={opacity / 100}/>
            </mesh>

            {/* Suelo */}
            <mesh position={[0, -halfRoomHeight, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow={false}
                  castShadow={false}>
                <planeGeometry args={[roomWidth, roomWidth]}/>
                <meshStandardMaterial color="white" side={THREE.BackSide} transparent={true} opacity={opacity / 100}/>
            </mesh>

            {/* Techo */}
            <mesh position={[0, halfRoomHeight, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow={false}
                  castShadow={false}>
                <planeGeometry args={[roomWidth, roomWidth]}/>
                <meshStandardMaterial color="white" side={THREE.FrontSide} transparent={true} opacity={opacity / 100}/>
            </mesh>
        </group>
    );
}