// App.tsx o tu componente principal
import React, {useEffect, useState} from 'react';
import { Canvas } from '@react-three/fiber';
import { Stage, Environment, OrbitControls } from '@react-three/drei';
import Casco from './components/Casco/Casco.js';
import Pata from "./components/Casco/Pata.js";
import Puerta from "./components/Casco/Puerta.js";
import CascoDosPuertas from "./components/Casco/CascoDosPuertas.js";

const App = () => {
    const [dimensions, setDimensions] = useState({
        width: 3,
        height: 2,
        depth: 2,
        stepHeight: 1
    });

    const [options, setOptions] = useState({
        sueloDentro: false,
        techoDentro: false,
        traseroDentro: false,
        ejeXTriangulado: false,
        ejeZTriangulado: false,
    });

    useEffect(() => {
        console.log("Nuevas opciones:", options);
    }, [options]);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <div style={{ position: 'absolute', zIndex: 1, padding: '10px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>
                <h3>Dimensiones</h3>
                <div>
                    <label>Ancho: </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={dimensions.width}
                        onChange={(e) => setDimensions({...dimensions, width: parseFloat(e.target.value)})}
                    />
                    <span>{dimensions.width.toFixed(1)}</span>
                </div>
                <div>
                    <label>Alto: </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({...dimensions, height: parseFloat(e.target.value)})}
                    />
                    <span>{dimensions.height.toFixed(1)}</span>
                </div>
                <div>
                    <label>Profundidad: </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={dimensions.depth}
                        onChange={(e) => setDimensions({...dimensions, depth: parseFloat(e.target.value)})}
                    />
                    <span>{dimensions.depth.toFixed(1)}</span>
                </div>
                <div>
                    <label>Altura patas: </label>
                    <input
                        type="range"
                        min="1"
                        max="4"
                        step="0.1"
                        value={dimensions.stepHeight}
                        onChange={(e) => setDimensions({...dimensions, stepHeight: parseFloat(e.target.value)})}
                    />
                    <span>{dimensions.stepHeight.toFixed(1)}</span>
                </div>

                <h3>Opciones de posicionamiento</h3>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={options.sueloDentro}
                            onChange={() => setOptions({...options, sueloDentro: !options.sueloDentro})}
                        />
                        Suelo dentro
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={options.techoDentro}
                            onChange={() => setOptions({...options, techoDentro: !options.techoDentro})}
                        />
                        Techo dentro
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={options.traseroDentro}
                            onChange={() => setOptions({...options, traseroDentro: !options.traseroDentro})}
                        />
                        Trasero dentro
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={options.ejeXTriangulado}
                            onChange={() => setOptions({...options, ejeXTriangulado: !options.ejeXTriangulado})}
                        />
                        45º X
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={options.ejeZTriangulado}
                            onChange={() => setOptions({...options, ejeZTriangulado: !options.ejeZTriangulado})}
                        />
                        45º Z
                    </label>
                </div>
            </div>

            <Canvas shadows>
                <Stage intensity={5} environment={null} shadows="contact" adjustCamera={false}>
                    <Environment files={"/images/poly_haven_studio_4k.hdr"} />
                    <CascoDosPuertas
                        width={dimensions.width}
                        height={dimensions.height}
                        depth={dimensions.depth}
                        esquinaXTriangulada={options.ejeXTriangulado}
                        esquinaZTriangulada={options.ejeZTriangulado}
                        espesor={0.1}
                        position={[0, 0, 0]}
                        rotation={[0, Math.PI / 6, 0]}
                        sueloDentro={options.sueloDentro}
                        techoDentro={options.techoDentro}
                        traseroDentro={options.traseroDentro}
                        pata={<Pata height={dimensions.stepHeight}/>}
                        puerta={<Puerta />}
                    />
                    <OrbitControls />
                </Stage>
            </Canvas>
        </div>
    );
};

export default App;