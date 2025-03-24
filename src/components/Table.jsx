import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useConfigurator } from '../contexts/Configurator'
import * as Three from 'three'
import { useFrame } from '@react-three/fiber'

export function Table(props) {
    const { nodes, materials } = useGLTF('./models/Table.gltf')

    const { legs, legsColor, tableWidth, tableHeight, tableDepth } = useConfigurator();

    useEffect(() => {
        materials.Metal.color = new Three.Color(legsColor);
    }, [legsColor]);

   useFrame((state, delta) => {
    const tableWidthScale = tableWidth / 100;
    const tableHeightScale = tableHeight / 100;
    const tableDepthScale = tableDepth / 100;
    const targetScale = new Three.Vector3(tableWidthScale, tableHeightScale, tableDepthScale);

    plate.current.scale.lerp(targetScale, delta * 12);

    // Adjust leg positions based on width
    const targetLeftPosition = new Three.Vector3(-1.5*tableWidthScale, 0, 0);
    leftLegs.current.position.lerp(targetLeftPosition, delta*12);

    const targetRightPosition = new Three.Vector3(1.5*tableWidthScale, 0, 0);
    rightLegs.current.position.lerp(targetRightPosition, delta*12);

    if(legs === 1){
        const targetScalePosition = new Three.Vector3(1,1,tableDepthScale);
        leftLegs.current.scale.lerp(targetScalePosition, delta*12);
        rightLegs.current.scale.lerp(targetScalePosition,delta*12);
    }
    
});

    const plate = useRef();
    const leftLegs = useRef();
    const rightLegs = useRef();

    return (
        <group {...props} dispose={null}>
            <mesh castShadow geometry={nodes.Plate.geometry} material={materials.Plate} ref={plate} />
            {legs === 0 && (
                <>
                    <mesh castShadow geometry={nodes.Legs01Left.geometry} material={materials.Metal} position={[-1.5, 0, 0]} ref={leftLegs} />
                    <mesh castShadow geometry={nodes.Legs01Right.geometry} material={materials.Metal} position={[1.5, 0, 0]} ref={rightLegs} />
                </>
            )}
            {legs === 1 && (
                <>
                    <mesh castShadow geometry={nodes.Legs02Left.geometry} material={materials.Metal} position={[-1.5, 0, 0]} ref={leftLegs} />
                    <mesh castShadow geometry={nodes.Legs02Right.geometry} material={materials.Metal} position={[1.5, 0, 0]} ref={rightLegs} />
                </>
            )}
            {legs === 2 && (
                <>
                    <mesh castShadow geometry={nodes.Legs03Left.geometry} material={materials.Metal} position={[-1.5, 0, 0]} ref={leftLegs} />
                    <mesh castShadow geometry={nodes.Legs03Right.geometry} material={materials.Metal} position={[1.5, 0, 0]} ref={rightLegs} />
                </>
            )
            }
        </group>
    )
}

useGLTF.preload('./models/Table.gltf')
