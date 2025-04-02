// App.tsx o tu componente principal
import React from 'react';
import {Canvas} from '@react-three/fiber';
import {Stage, Environment, OrbitControls} from '@react-three/drei';
import TruncatedBox from "./components/Casco/CajaInclinada.js";

const TruncatedBoxDemo = () => {
    const [scaleX, setScaleX] = React.useState(0.6);
    const [scaleZ, setScaleZ] = React.useState(0.6);
    const [dimensions, setDimensions] = React.useState({
        width: 2,
        height: 1,
        depth: 3
    });

    return (
        <div className="w-full h-full">
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-4 rounded text-white">
                <div className="mb-2">
                    <label className="block">Escala X: {(scaleX * 100).toFixed(0)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={scaleX}
                        onChange={(e) => setScaleX(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block">Escala Z: {(scaleZ * 100).toFixed(0)}%</label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={scaleZ}
                        onChange={(e) => setScaleZ(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>
            <Canvas shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}}>

            <TruncatedBox
                position={[0, 0, 0]}
                width={dimensions.width}
                height={dimensions.height}
                depth={dimensions.depth}
                scaleX={scaleX}
                scaleZ={scaleZ}
                color="#3080ff"
                wireframe={false}
            />

            {/* Rejilla de referencia base */}
            <gridHelper args={[10, 10]} position={[0, -dimensions.height/2 - 0.01, 0]} />
            <axesHelper args={[5]} />
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>

            </Canvas>
        </div>
    );
};


const App = () => {
    return (
        <TruncatedBoxDemo/>
    );
};

export default App;