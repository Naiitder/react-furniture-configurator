import {Canvas} from "@react-three/fiber";
import {Environment, Stage, OrbitControls, Grid, SoftShadows} from '@react-three/drei'
import {EffectComposer, Bloom, ToneMapping} from '@react-three/postprocessing'

import {Table} from "../Table";
import {Mesa} from "./Mesa";
import {Room} from "../Room.jsx";

// <Grid renderOrder={-1} position={[0, -.5, 0]} infiniteGrid cellSize={0.6} cellThickness={0.6} sectionSize={3.3} sectionThickness={1.5} sectionColor={[0.5, 0.5, 10]} fadeDistance={30} />

export const Experience = () => {

    return (
        <>
            <Canvas shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}}>
                <Room positionY={3.8}/>
                <Stage intensity={5} environment="city" shadows={{
                    type: 'accumulative', bias: -0.0001, intensity: Math.PI, normalBias: 1
                }} adjustCamera={false} center={{precise: true}}>
                    <Mesa renderOrder={1} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}/></Stage>
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>
            </Canvas>
        </>
    )
}
