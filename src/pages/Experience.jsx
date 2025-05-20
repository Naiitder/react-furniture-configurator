import React, {useRef, useState, useEffect} from "react";
import {Canvas, useThree} from "@react-three/fiber";
import {
    TransformControls,
    OrbitControls,
    Stage, Outlines, Edges,
} from "@react-three/drei";
import {useLocation} from "react-router-dom";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";
import CascoInterface from "../components/Casco/CascoInterface.jsx";
import {Room} from "../components/Enviroment/Room.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import {useDrop} from "react-dnd";
import * as THREE from "three";
import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx";
import {INTERSECTION_TYPES} from "../components/Casco/DraggableIntersection.js";
import CascoSimple from "../components/CascoBrr/CascoSimple.js";
import ChildItemConfigurationInterface from "../components/ChildItemConfigurationInterface.jsx";
import TablaConfigContent from "../components/Casco/TablaInterface.jsx";
import {useSelectedPieceProvider} from "../contexts/SelectedPieceProvider.jsx";
import PataAparador from "../components/Aparador/PataAparador.js";
import Aparador from "../components/Aparador/Aparador.js";
import AparadorInterface from "../components/Aparador/AparadorInterface.jsx";
import {useSelectedCajonProvider} from "../contexts/SelectedCajonProvider.jsx";
import CajonConfigContent from "../components/Aparador/CajonInterface.jsx";
import Armario from "../components/Armario/Armario.js";
import ArmarioInterface from "../components/Armario/ArmarioInterface.jsx";
import Bodeguero from "../components/Armario/Bodeguero.js";
import PuertaBodeguero from "../components/Armario/PuertaBodeguero.js";
import {Color} from "three";
import Tabla from "../components/Casco/Tabla.js";
import InterseccionMueble, {Orientacion} from "../components/Interseccion";

const RaycastClickLogger = ({glRef, cameraRef}) => {
    const {camera, gl} = useThree();
    const {refItem} = useSelectedItemProvider();

    useEffect(() => {
        if (glRef) glRef.current = gl;
        if (cameraRef) cameraRef.current = camera;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onClick = (event) => {
            const bounds = gl.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
            mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            if (refItem) {
                const intersects = raycaster.intersectObject(refItem.groupRef, true);
                if (intersects.length > 0) {
                    console.log(intersects[0]);
                }
            }
        };

        gl.domElement.addEventListener("mouseup", onClick);
        return () => gl.domElement.removeEventListener("mouseup", onClick);
    }, [camera, gl, refItem]); // Añadimos refItem como dependencia

    return null;
};


export const Experience = () => {
    const transformRef = useRef();
    const glRef = useRef();
    const cameraRef = useRef();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedItem = params.get("item");

    const [transformEnabled, setTransformEnabled] = useState(true);
    const [transformMode, setTransformMode] = useState("translate");
    const [cascoInstances, setCascoInstances] = useState({}); // Almacenar instancias de cascos
    const {refItem, setRefItem, version, setVersion} = useSelectedItemProvider();
    const {refPiece, setRefPiece} = useSelectedPieceProvider();
    const {refCajon} = useSelectedCajonProvider();
    const [scaleDimensions, setScaleDimensions] = useState({x: 2, y: 2, z: 2});

    useEffect(() => {
        setCascoInstances({
            casco1: {
                id: 'casco1',
                name: 'Casco1',
                position: [-3, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: {width: 2, height: 2, depth: 2, espesor: 0.3},
                patas: [<Pata height={1}/>],
                puertas: [<Puerta/>],
                intersecciones: [],
            },
            casco2: {
                id: 'casco2',
                name: 'Casco2',
                position: [3, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: {width: 2, height: 2, depth: 3, espesor: 0.1},
                patas: [<Pata height={1}/>],
                puertas: [<Puerta/>],
                intersecciones: [],
            },
            casco3: {
                id: 'casco3',
                name: 'Casco3',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: {width: 2, height: 2, depth: 2, espesor: 0.1},
                patas: [<Pata height={1}/>],
                puertas: [<Puerta/>],
                intersecciones: [],
            },
            casco4: {
                id: 'casco4',
                name: 'Casco4',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                userData: {width: 1.54, height: .93, depth: .6, espesor: 0.05},
                patas: [<PataAparador height={.1}/>],
                puertas: [<Puerta/>],
            },
            casco5: {
                id: 'casco5',
                name: 'Casco5',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                userData: {width: 0.74, height: 1.23, depth: .37, espesor: 0.02},
                intersecciones: [
                    new InterseccionMueble({x: 0.5, y: 0.75}, Orientacion.Horizontal),
                    new InterseccionMueble({x: 0.5, y: 0.6225}, Orientacion.Vertical),
                    new InterseccionMueble({x: 0.5, y: 0.87}, Orientacion.Vertical),
                ],
                patas: [<PataAparador height={.1}/>],
                puertas: [<Puerta/>],
            },
            casco6: {
                id: 'casco6',
                name: 'Casco6',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                userData: {width: 0.74, height: 1.23, depth: .37, espesor: 0.02},
                patas: [<PataAparador height={.1}/>],
                puertas: [<PuertaBodeguero/>],
                intersecciones: [
                    new InterseccionMueble({x: 0.25, y: 0}, Orientacion.Vertical, new Date("2025-05-14")),
                    new InterseccionMueble({x: 0.75, y: 0}, Orientacion.Vertical, new Date("2025-05-14")),
                    new InterseccionMueble({x: 0, y: 0.1}, Orientacion.Horizontal, new Date("2025-05-13")),

                    new InterseccionMueble({x: 0.25, y: 0.1}, Orientacion.Vertical, new Date("2025-05-13")),
                    new InterseccionMueble({x: 0.5, y: 0.3}, Orientacion.Horizontal, new Date("2025-05-14")),
                    new InterseccionMueble({x: 0.75, y: 0.1}, Orientacion.Vertical, new Date("2025-05-15")),
                    new InterseccionMueble({x: 0.5, y: 0.1}, Orientacion.Vertical, new Date("2025-05-15")),

                    new InterseccionMueble({x: 0.5, y: 0.5}, Orientacion.Horizontal, new Date("2025-05-16")),
                    new InterseccionMueble({x: 0.75, y: 0.3}, Orientacion.Vertical, new Date("2025-05-17")),
                    new InterseccionMueble({x: 0.75, y: 0.7}, Orientacion.Horizontal, new Date("2025-05-18")),
                    new InterseccionMueble({x: 0.5, y: 0.5}, Orientacion.Vertical, new Date("2025-05-18")),

                    new InterseccionMueble({x: 0.6, y: 0.5}, Orientacion.Vertical, new Date("2025-05-18")),
                    new InterseccionMueble({x: 0.8, y: 0.7}, Orientacion.Vertical, new Date("2025-05-14")),
                    new InterseccionMueble({x: 0.55, y: 0.6}, Orientacion.Horizontal, new Date("2025-05-18")),


                    new InterseccionMueble({x: 0.9, y: 0.6}, Orientacion.Horizontal),
                    new InterseccionMueble({x: 0.1, y: 0.6}, Orientacion.Horizontal),
                    new InterseccionMueble({x: 0, y: 0.7}, Orientacion.Horizontal),
                    new InterseccionMueble({x: 0.2, y: 0.4}, Orientacion.Horizontal),

                    new InterseccionMueble({x: 0.25, y: 0.9}, Orientacion.Horizontal),
                    new InterseccionMueble({x: 0.5, y: 0.9}, Orientacion.Vertical),

                ],
            }
        });
    }, []);

    // Actualizar refItem al hacer clic en un casco
    const handleCascoClick = (selectedObject) => {
        setRefItem(selectedObject);
    };

    useEffect(() => {
        if (
            transformRef.current &&
            refItem &&
            refItem.groupRef
        ) {
            const controls = transformRef.current;

            const onObjectChange = () => {
                if (transformMode === "scale") {
                    const newScale = refItem.groupRef.scale;
                    const width = refItem.groupRef.userData.width || 2;
                    const height = refItem.groupRef.userData.height || 2;
                    const depth = refItem.groupRef.userData.depth || 2;

                    const newWidth = Math.min(5, Math.max(1, width * newScale.x));
                    const newHeight = Math.min(6, Math.max(1, height * newScale.y));
                    const newDepth = Math.min(4, Math.max(1, depth * newScale.z));

                    setScaleDimensions({x: newWidth, y: newHeight, z: newDepth});
                    refItem.groupRef.userData = {
                        ...refItem.groupRef.userData,
                        width: newWidth,
                        height: newHeight,
                        depth: newDepth
                    };
                    refItem.groupRef.scale.set(1, 1, 1); // Resetear escala para evitar acumulaciones
                    setVersion((v) => v + 1);
                }
            };

            controls.addEventListener("objectChange", onObjectChange);
            return () => controls.removeEventListener("objectChange", onObjectChange);
        }
    }, [transformMode, refItem, version]);


    // TODO Usar coordenadas UV del click
    const [{isOver}, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            const gl = glRef.current;
            const camera = cameraRef.current;

            if (!clientOffset || !gl || !camera || !refItem) return;

            const cascoKey = refItem.groupRef.name;
            const cascoData = cascoInstances[cascoKey];
            if (!cascoData) return;

            const {x, y} = clientOffset;
            const bounds = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((x - bounds.left) / bounds.width) * 2 - 1,
                -((y - bounds.top) / bounds.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersectObject = raycaster.intersectObject(refItem.groupRef, true)[0];
            console.log("OTRA LINEAS") // A partir de aquí ya no ejecuta, aunque el objeto anterior no sea ni nulo o undefined
            /*
            const intersecciones = cascoData.intersecciones || [];

            // Create a new intersection
            const newInterseccion = new InterseccionMueble(
                {
                    x: 0.5,
                    y: 0.4
                },
                item.type === INTERSECTION_TYPES.HORIZONTAL ? Orientacion.Horizontal : Orientacion.Vertical
            );

            setCascoInstances((prev) => {
                const updated = {...prev};
                const updatedCasco = {...updated[cascoKey]};

                // Add the new intersection to the existing ones
                updatedCasco.intersecciones = [...intersecciones, newInterseccion];

                updated[cascoKey] = updatedCasco;
                return updated;
            });*/
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [refItem, cascoInstances]);

    const interfaceComponents = {
        "Casco": (
            <CascoInterface
                key={refItem?.groupRef?.uuid || "default"}
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                scaleDimensions={scaleDimensions}
            />
        ),
        "Casco Secciones": (
            <CascoInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                scaleDimensions={scaleDimensions}
            />
        ),
        "Aparador": (
            <AparadorInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                scaleDimensions={scaleDimensions}
            />
        ),
        "Armario": (
            <ArmarioInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                scaleDimensions={scaleDimensions}
            />
        ),
        "Bodeguero": (
            <ArmarioInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                scaleDimensions={scaleDimensions}
            />
        ),
    };

    const itemComponents = {
        "Casco": (
            <>
                {Object.values(cascoInstances)
                    .filter((casco) => ["casco1", "casco2", "casco3"].includes(casco.id))
                    .map((casco) => (
                        <group key={casco.id}>
                            <Casco
                                key={casco.id}
                                id={casco.id}
                                position={casco.position}
                                rotation={casco.rotation}
                                {...casco.userData}
                                patas={casco.patas}
                                puertas={casco.puertas}
                                onClick={handleCascoClick}
                                version={version}
                                intersecciones={casco.intersecciones}
                            />
                        </group>
                    ))}
            </>
        ),
        "Aparador": (
            <>
                {Object.values(cascoInstances)
                    .filter((casco) => casco.id === "casco4")
                    .map((casco) => (
                        <group key={casco.id}>
                            <Aparador
                                key={casco.id}
                                id={casco.id}
                                position={casco.position}
                                rotation={casco.rotation}
                                {...casco.userData}
                                patas={casco.patas}
                                puertas={casco.puertas}
                                onClick={handleCascoClick}
                                version={version}
                                indicePuerta={-1}
                                indicePata={0}
                            />
                        </group>
                    ))}
            </>
        ),
        "Armario": (
            <>
                {Object.values(cascoInstances)
                    .filter((casco) => casco.id === "casco5")
                    .map((casco) => (
                        <group key={casco.id}>
                            <Armario
                                key={casco.id}
                                id={casco.id}
                                position={casco.position}
                                rotation={casco.rotation}
                                {...casco.userData}
                                intersecciones={casco.intersecciones}
                                patas={casco.patas}
                                puertas={casco.puertas}
                                onClick={handleCascoClick}
                                version={version}
                                indicePuerta={-1}
                                indicePata={0}
                            />
                        </group>
                    ))}
            </>
        ),
        "Bodeguero": (
            <>
                {Object.values(cascoInstances)
                    .filter((casco) => casco.id === "casco6")
                    .map((casco) => (
                        <group key={casco.id}>
                            <Bodeguero
                                key={casco.id}
                                id={casco.id}
                                position={casco.position}
                                rotation={casco.rotation}
                                {...casco.userData}
                                intersecciones={casco.intersecciones}
                                patas={casco.patas}
                                puertas={casco.puertas}
                                onClick={handleCascoClick}
                                version={version}
                                indicePuerta={0}
                                indicePata={0}
                            />
                        </group>
                    ))}
            </>
        ),

    };

    return (
        <>
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{position: [0, 2, 5], fov: 35}}>
                <RaycastClickLogger glRef={glRef} cameraRef={cameraRef}/>
                <Room positionY={3.5}/>
                <Stage intensity={.1} environment={"warehouse"} shadows={"contact"} adjustCamera={1}>
                    <directionalLight
                        castShadow
                        position={[5, 5, 5]}
                        intensity={4}
                    />
                    {itemComponents[selectedItem]}
                </Stage>
                {transformEnabled && refItem && (
                    <TransformControls ref={transformRef} object={refPiece ? refPiece : refItem.groupRef}
                                       mode={transformMode}/>
                )}

                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2}/>
            </Canvas>
            {interfaceComponents[selectedItem]}


            {refPiece && (
                <ChildItemConfigurationInterface
                    title="Tabla Configurator"
                    show={true}
                    setShow={true}
                    mode={transformMode}
                    setMode={setTransformMode}
                >
                    <TablaConfigContent/>
                </ChildItemConfigurationInterface>
            )}

            {refCajon && (
                <ChildItemConfigurationInterface title="Cajon Configurator">
                    <CajonConfigContent/>
                </ChildItemConfigurationInterface>
            )}


            <RoomConfigPanel/>
        </>
    );
};