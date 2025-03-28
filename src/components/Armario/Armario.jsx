import React, {useEffect, useRef, useState} from 'react';
import {useGLTF} from '@react-three/drei';
import * as Three from 'three';
import {useFrame} from '@react-three/fiber';

export function Armario(props) {
    const {nodes, materials} = useGLTF('./models/Armario.glb');
    const [selectedLeftDoor, setSelectedLeftDoor] = useState(false);
    const [selectedRightDoor, setSelectedRightDoor] = useState(false);

    const [selectedUprightDrawer, setSelectedUprightDrawer] = useState(false);
    const [selectedUpleftDrawer, setSelectedUpleftDrawer] = useState(false);
    const [selectedLowerrightDrawer, setSelectedLowerrightDrawer] = useState(false);
    const [selectedLowerleftDrawer, setSelectedLowerleftDrawer] = useState(false);

    useEffect(() => {
        if (materials.WoodArmario) {
            materials.WoodArmario.color = new Three.Color('gray');
        }
    }, [materials]);

    useFrame((state, delta) => {
        if (leftDoor.current) {
            const targetRotation = selectedLeftDoor
                ? new Three.Euler(0, -Math.PI / 2, 0)
                : new Three.Euler(0, 0, 0);
            // Smoothly interpolate between current and target rotation
            leftDoor.current.rotation.x += (targetRotation.x - leftDoor.current.rotation.x) * delta * 12;
            leftDoor.current.rotation.y += (targetRotation.y - leftDoor.current.rotation.y) * delta * 12;
            leftDoor.current.rotation.z += (targetRotation.z - leftDoor.current.rotation.z) * delta * 12;
        }

        if (rightDoor.current) {
            const targetRotation = selectedRightDoor
                ? new Three.Euler(0, Math.PI / 2, 0)
                : new Three.Euler(0, 0, 0);
            // Smoothly interpolate between current and target rotation
            rightDoor.current.rotation.x += (targetRotation.x - rightDoor.current.rotation.x) * delta * 12;
            rightDoor.current.rotation.y += (targetRotation.y - rightDoor.current.rotation.y) * delta * 12;
            rightDoor.current.rotation.z += (targetRotation.z - rightDoor.current.rotation.z) * delta * 12;
        }
        if (uprightdrawer.current) {
            const targetPosition = selectedUprightDrawer
                ? new Three.Vector3(0, 0, 1.25)
                : new Three.Vector3(0, 0, 0);

            uprightdrawer.current.position.lerp(targetPosition, delta * 12);
        }
        if (upleftdrawer.current) {
            const targetPosition = selectedUpleftDrawer
                ? new Three.Vector3(0, 0, 1.25)
                : new Three.Vector3(0, 0, 0);

            upleftdrawer.current.position.lerp(targetPosition, delta * 12);
        }
        if (lowerrightdrawer.current) {
            const targetPosition = selectedLowerrightDrawer
                ? new Three.Vector3(0, 0, 1.25)
                : new Three.Vector3(0, 0, 0);

            lowerrightdrawer.current.position.lerp(targetPosition, delta * 12);
        }
        if (lowerleftdrawer.current) {
            const targetPosition = selectedLowerleftDrawer
                ? new Three.Vector3(0, 0, 1.25)
                : new Three.Vector3(0, 0, 0);

            lowerleftdrawer.current.position.lerp(targetPosition, delta * 12);
        }


    });

    const leftDoor = useRef();
    const rightDoor = useRef();

    const uprightdrawer = useRef();
    const upleftdrawer = useRef();
    const lowerrightdrawer = useRef();
    const lowerleftdrawer = useRef();

    return (
        <group {...props} dispose={null}>
            <group>
                <mesh onClick={(event) => {event.stopPropagation();}}
                    geometry={nodes.pCube1.geometry}
                    material={materials.WoodArmario}
                />
                <group position={[-2.069, 4.12, 0.118]} onClick={(event) => {
                    setSelectedLeftDoor(!selectedLeftDoor)
                    event.stopPropagation();
                }} ref={leftDoor}>
                    <mesh geometry={nodes.Mesh002.geometry} material={materials.MaderaArmario}/>
                    <mesh geometry={nodes.Mesh002_1.geometry} material={materials.aiStandardSurface2}/>
                </group>
                <group position={[2.086, 4.167, 0.101]} onClick={(event) => {
                    setSelectedRightDoor(!selectedRightDoor);
                    event.stopPropagation();
                }} ref={rightDoor}>
                    <mesh geometry={nodes.Mesh003.geometry} material={materials.MaderaArmario}/>
                    <mesh geometry={nodes.Mesh003_1.geometry} material={materials.aiStandardSurface2}/>
                </group>
                <group onClick={(event) => {
                    setSelectedLowerrightDrawer(!selectedLowerrightDrawer);
                    event.stopPropagation();
                }} ref={lowerrightdrawer}>
                    <mesh geometry={nodes.Mesh005.geometry} material={materials.MaderaArmario}/>
                    <mesh geometry={nodes.Mesh005_1.geometry} material={materials.aiStandardSurface2}/>
                </group>
                <group onClick={(event) => {
                    setSelectedLowerleftDrawer(!selectedLowerleftDrawer);
                    event.stopPropagation();
                }} ref={lowerleftdrawer}>
                    <mesh geometry={nodes.Mesh006.geometry} material={materials.MaderaArmario}/>
                    <mesh geometry={nodes.Mesh006_1.geometry} material={materials.aiStandardSurface2}/>
                </group>
                <group onClick={(event) => {
                    setSelectedUpleftDrawer(!selectedUpleftDrawer);
                    event.stopPropagation();
                }} ref={upleftdrawer}>
                    <mesh geometry={nodes.Mesh001.geometry} material={materials.MaderaArmario}/>
                    <mesh geometry={nodes.Mesh001_1.geometry} material={materials.aiStandardSurface2}/>
                </group>
                <group onClick={(event) => {
                    setSelectedUprightDrawer(!selectedUprightDrawer);
                    event.stopPropagation();
                }} ref={uprightdrawer}>
                    <mesh geometry={nodes.Mesh004.geometry} material={materials.MaderaArmario}/>
                    <mesh geometry={nodes.Mesh004_1.geometry} material={materials.aiStandardSurface2}/>
                </group>
            </group>
        </group>
    );
}

useGLTF.preload('./models/Armario.glb');
