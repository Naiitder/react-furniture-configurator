
import { Canvas } from "@react-three/fiber";
import { Environment, Stage, OrbitControls, Grid } from '@react-three/drei'
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'

import { Table } from "../Table";
import { useConfigurator } from "../../contexts/Configurator";
import { Mesa } from "./Mesa";
import { Mesa2 } from "./Mesa2";


// <Grid renderOrder={-1} position={[0, -.5, 0]} infiniteGrid cellSize={0.6} cellThickness={0.6} sectionSize={3.3} sectionThickness={1.5} sectionColor={[0.5, 0.5, 10]} fadeDistance={30} />

export const Experience = () => {

    const {legs} = useConfigurator();

    return (
        <>
            <Canvas shadows dpr={[1,2]} camera={{ position: [4, 4, -12], fov: 35 }}>
                 {/* Suelo (Floor) */}
                 <mesh receiveShadow position={[0, -1, 5]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[30,30]} /> {/* Tamaño del suelo */}
                    <meshStandardMaterial color="white" />
                </mesh>

                {/* Pared (Wall) */}
                <mesh receiveShadow position={[0, 2.5, 5]}>
                    <boxGeometry args={[30, 10, 0.1]} /> {/* Tamaño de la pared */}
                    <meshStandardMaterial color="white" />
                </mesh>
                <Stage intensity={5} environment="city" shadows={{ type: 'accumulative', bias: -0.001, intensity: Math.PI }} adjustCamera={false}>
                    <Mesa2 rotation={[0, Math.PI, 0]} />
                </Stage>
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
            </Canvas>
        </>
    )
}
