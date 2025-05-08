import {useRef, useState, useEffect} from "react";
import {Canvas, useThree} from "@react-three/fiber";
import {TransformControls, OrbitControls, Environment, Stage, OrthographicCamera, SpotLight} from "@react-three/drei";
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

const RaycastClickLogger = ({ glRef, cameraRef }) => {
    const { camera, gl } = useThree();
    const { refItem } = useSelectedItemProvider();

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

            // Asegurarse de que refItem sea un objeto Three.js válido
            if (refItem) {
                const intersects = refItem.detectionRef
                    ? raycaster.intersectObject(refItem.detectionRef, true)
                    : [];
                console.log(refItem.detectionRef);
                if (intersects.length > 0) {
                    console.log("👉 Intersección con Casco en:", intersects[0].point);
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
    const { refItem, setRefItem, version, setVersion } = useSelectedItemProvider();
    const { refPiece, setRefPiece} = useSelectedPieceProvider();
    const { refCajon} = useSelectedCajonProvider();
    const [scaleDimensions, setScaleDimensions] = useState({ x: 2, y: 2, z: 2 });

    // @Pruden
    const [selectedCascoId, setSelectedCascoId] = useState(null);


    useEffect(() => {
        setCascoInstances({
            casco1: {
                id: 'casco1',
                name: 'Casco1',
                position: [-3, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: { width: 2, height: 2, depth: 2, espesor: 0.3 },
                patas: [<Pata height={1} />],
                puertas: [<Puerta />],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
            casco2: {
                id: 'casco2',
                name: 'Casco2',
                position: [3, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: { width: 2, height: 2, depth: 3, espesor: 0.1 },
                patas: [<Pata height={1} />],
                puertas: [<Puerta />],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
            casco3: {
                id: 'casco3',
                name: 'Casco3',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: { width: 2, height: 2, depth: 2, espesor: 0.1 },
                patas: [<Pata height={1} />],
                puertas: [<Puerta />],
                seccionesHorizontales: [],
                seccionesVerticales: [],
            },
            casco4: {
                id: 'casco4',
                name: 'Casco4',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                userData: { width: 1.54, height: .93, depth: .6, espesor: 0.05 },
                patas: [<PataAparador height={.1} />],
                puertas: [<Puerta />],
            },
            casco5: {
                id: 'casco5',
                name: 'Casco5',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                userData: { width: 0.74, height: 1.23, depth: .37, espesor: 0.02 },
                seccionesHorizontales: [
                    {
                        color:
                            "#8B4513",
                        id:
                            1746631569613,
                        relativeDepth:
                            1,
                        relativeHeight:
                            0.05,
                        relativePosition:
                            [0, 0.75, 0.5],
                        relativeWidth:
                            1,
                    }
                ],
                seccionesVerticales: [
                    {
                        color:
                            "#8B4513",
                        id:
                            343243234,
                        relativeDepth:
                            1,
                        relativeHeight:
                            0.26,
                        relativePosition:
                            [0, 0.6225, 0.5],
                        relativeWidth:
                            1,
                    },
                    {
                        color:
                            "#8B4513",
                        id:
                            23425332,
                        relativeDepth:
                            1,
                        relativeHeight:
                            0.24,
                        relativePosition:
                            [0, 0.87, 0.5],
                        relativeWidth:
                            1,
                    }
                ],
                patas: [<PataAparador height={.1} />],
                puertas: [<Puerta />],
            },
            casco6: {
                id: 'casco6',
                name: 'Casco6',
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                userData: { width: 0.74, height: 1.23, depth: .37, espesor: 0.02 },
                patas: [<PataAparador height={.1} />],
                puertas: [<PuertaBodeguero />],
                seccionesHorizontales: [
                    {
                    color:
                        "#8B4513",
                    id:
                        1746631569613,
                    relativeDepth:
                        1,
                    relativeHeight:
                        0.05,
                    relativePosition:
                        [0, 0.7, 0.5],
                    relativeWidth:
                        1,
                },
                    {
                        color:
                            "#8B4513",
                        id:
                            1746631569614,
                        relativeDepth:
                            1,
                        relativeHeight:
                            0.05,
                        relativePosition:
                            [0, 0.5, 0.5],
                        relativeWidth:
                            1,
                    },
                    {
                        color:
                            "#8B4513",
                        id:
                            1746631569615,
                        relativeDepth:
                            1,
                        relativeHeight:
                            0.05,
                        relativePosition:
                            [0, 0.25, 0.5],
                        relativeWidth:
                            1,
                    },
                ],
                seccionesVerticales: [
                    {
                        color:
                            "#8B4513",
                        id:
                            1746631569613,
                        relativeDepth:
                            1,
                        relativeHeight:
                            0.3,
                        relativePosition:
                            [0, 0.85, 0.5],
                        relativeWidth:
                            1,
                    },
                    {
                        color:
                            "#8B4513",
                        id:
                            1746631569614,
                        relativeDepth:
                            1,
                        relativeHeight:
                            0.2,
                        relativePosition:
                            [0, 0.6, 0.5],
                        relativeWidth:
                            1,
                    },

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

                    setScaleDimensions({ x: newWidth, y: newHeight, z: newDepth });
                    refItem.groupRef.userData = { ...refItem.groupRef.userData, width: newWidth, height: newHeight, depth: newDepth };
                    refItem.groupRef.scale.set(1, 1, 1); // Resetear escala para evitar acumulaciones
                    setVersion((v) => v + 1);
                }
            };

            controls.addEventListener("objectChange", onObjectChange);
            return () => controls.removeEventListener("objectChange", onObjectChange);
        }
    }, [transformMode, refItem, version]);


    const [{ isOver }, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            const gl = glRef.current;
            const camera = cameraRef.current;

            if (!clientOffset || !gl || !camera || !refItem) return;

            const cascoKey = refItem.groupRef.name;
            const cascoData = cascoInstances[cascoKey];
            if (!cascoData) return;

            const { x, y } = clientOffset;
            const bounds = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((x - bounds.left) / bounds.width) * 2 - 1,
                -((y - bounds.top) / bounds.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = refItem.detectionRef
                ? raycaster.intersectObject(refItem.detectionRef, true)
                : [];
            if (intersects.length === 0) return;

            const point = intersects[0].point;
            const worldPosition = new THREE.Vector3(point.x, point.y, point.z);
            refItem.groupRef.updateMatrixWorld(true);
            const localPosition = refItem.groupRef.worldToLocal(worldPosition.clone());

            const { width: cascoWidth, height: cascoHeight, depth: cascoDepth, espesor } = refItem.groupRef.userData;

            let adjustedWidth = cascoWidth;
            let adjustedHeight = cascoHeight;
            let adjustedPosition = [localPosition.x, localPosition.y, localPosition.z];

            const horizontalCubes = cascoData.seccionesHorizontales || [];
            const verticalCubes = cascoData.seccionesVerticales || [];

            if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                const relevantVerticals = verticalCubes.filter((cube) => {
                    const cubeMinY = cube.relativePosition[1] * cascoHeight - (cube.relativeHeight * cascoHeight) / 2;
                    const cubeMaxY = cube.relativePosition[1] * cascoHeight + (cube.relativeHeight * cascoHeight) / 2;
                    return localPosition.y >= cubeMinY && localPosition.y <= cubeMaxY;
                });

                const verticalSections = relevantVerticals
                    .map((cube) => cube.relativePosition[0] * cascoWidth)
                    .sort((a, b) => a - b);

                const boundaries = [-cascoWidth / 2, ...verticalSections, cascoWidth / 2];
                const leftBoundary = boundaries.filter((pos) => pos < localPosition.x).sort((a, b) => b - a)[0] || -cascoWidth / 2;
                const rightBoundary = boundaries.filter((pos) => pos > localPosition.x).sort((a, b) => a - b)[0] || cascoWidth / 2;

                adjustedWidth = rightBoundary - leftBoundary;
                adjustedPosition[0] = (leftBoundary + rightBoundary) / 2;

                const exists = horizontalCubes.some((cube) => {
                    const cubeX = cube.relativePosition[0] * cascoWidth;
                    const cubeY = cube.relativePosition[1] * cascoHeight;
                    const cubeWidth = cube.relativeWidth * cascoWidth;
                    const cubeMinX = cubeX - cubeWidth / 2;
                    const cubeMaxX = cubeX + cubeWidth / 2;
                    const newMinX = adjustedPosition[0] - adjustedWidth / 2;
                    const newMaxX = adjustedPosition[0] + adjustedWidth / 2;
                    const sameY = Math.abs(cubeY - localPosition.y) < 0.1;
                    const overlapsX = !(newMaxX <= cubeMinX || newMinX >= cubeMaxX);
                    return sameY && overlapsX;
                });

                if (exists) {
                    console.warn("Ya existe una sección horizontal en esta posición Y");
                    return;
                }
            }

            if (item.type === INTERSECTION_TYPES.VERTICAL) {
                const relevantHorizontals = horizontalCubes.filter((cube) => {
                    const cubeX = cube.relativePosition[0] * cascoWidth;
                    const cubeWidth = cube.relativeWidth * cascoWidth;
                    const cubeMinX = cubeX - cubeWidth / 2;
                    const cubeMaxX = cubeX + cubeWidth / 2;
                    return localPosition.x >= cubeMinX && localPosition.x <= cubeMaxX;
                });

                const horizontalSections = relevantHorizontals
                    .map((cube) => cube.relativePosition[1] * cascoHeight)
                    .sort((a, b) => a - b);

                const boundaries = [0, ...horizontalSections, cascoHeight];
                const bottomBoundary = boundaries.filter((pos) => pos < localPosition.y).sort((a, b) => b - a)[0] || 0;
                const topBoundary = boundaries.filter((pos) => pos > localPosition.y).sort((a, b) => a - b)[0] || cascoHeight;

                adjustedHeight = topBoundary - bottomBoundary;
                adjustedPosition[1] = (bottomBoundary + topBoundary) / 2;

                const exists = verticalCubes.some((cube) => {
                    const cubeX = cube.relativePosition[0] * cascoWidth;
                    const cubeY = cube.relativePosition[1] * cascoHeight;
                    const cubeHeight = cube.relativeHeight * cascoHeight;
                    const cubeMinY = cubeY - cubeHeight / 2;
                    const cubeMaxY = cubeY + cubeHeight / 2;
                    const newMinY = adjustedPosition[1] - adjustedHeight / 2;
                    const newMaxY = adjustedPosition[1] + adjustedHeight / 2;
                    const sameX = Math.abs(cubeX - localPosition.x) < 0.1;
                    const overlapsY = !(newMaxY <= cubeMinY || newMinY >= cubeMaxY);
                    return sameX && overlapsY;
                });

                if (exists) {
                    console.warn("Ya existe una sección vertical en esta posición X");
                    return;
                }
            }

            const newCube = {
                id: Date.now(),
                relativePosition: [
                    adjustedPosition[0] / cascoWidth,
                    adjustedPosition[1] / cascoHeight,
                    adjustedPosition[2] / cascoDepth,
                ],
                relativeWidth: (item.type === INTERSECTION_TYPES.HORIZONTAL ? adjustedWidth : espesor) / cascoWidth,
                relativeHeight: (item.type === INTERSECTION_TYPES.VERTICAL ? adjustedHeight : espesor) / cascoHeight,
                relativeDepth: (cascoDepth - (refItem.userData?.traseroDentro ? refItem.userData?.retranqueoTrasero || 0 : 0)) / cascoDepth,
                color: item.color || "#8B4513",
            };

            setCascoInstances((prev) => {
                const updated = { ...prev };
                const updatedCasco = { ...updated[cascoKey] };

                if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                    updatedCasco.seccionesHorizontales = [...horizontalCubes, newCube];
                    console.log(newCube);
                } else if (item.type === INTERSECTION_TYPES.VERTICAL) {
                    updatedCasco.seccionesVerticales = [...verticalCubes, newCube];
                    console.log(newCube);
                }

                updated[cascoKey] = updatedCasco;
                return updated;
            });
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
        "Aparador":(
            <AparadorInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                scaleDimensions={scaleDimensions}
            />
        ),
        "Armario":(
            <ArmarioInterface
                show={transformEnabled}
                setShow={setTransformEnabled}
                mode={transformMode}
                setMode={setTransformMode}
                scaleDimensions={scaleDimensions}
            />
        ),
        "Bodeguero":(
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
                                seccionesHorizontales={casco.seccionesHorizontales}
                                seccionesVerticales={casco.seccionesVerticales}
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
                                indicePuerta = {-1}
                                indicePata = {0}
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
                                seccionesHorizontales={casco.seccionesHorizontales}
                                seccionesVerticales={casco.seccionesVerticales}
                                patas={casco.patas}
                                puertas={casco.puertas}
                                onClick={handleCascoClick}
                                version={version}
                                indicePuerta = {-1}
                                indicePata = {0}
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
                                seccionesHorizontales={casco.seccionesHorizontales}
                                seccionesVerticales={casco.seccionesVerticales}
                                patas={casco.patas}
                                puertas={casco.puertas}
                                onClick={handleCascoClick}
                                version={version}
                                indicePuerta = {-1}
                                indicePata = {0}
                            />
                        </group>
                    ))}
            </>
        ),

    };

    return (
        <>
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{position: [0,2,5], fov: 35}}>
                <RaycastClickLogger glRef={glRef} cameraRef={cameraRef}/>
                <Room positionY={3.5}/>
                <Stage intensity={.1} environment={"warehouse"} shadows="contact" adjustCamera={1}>
                    {itemComponents[selectedItem]}
                </Stage>
                {transformEnabled && refItem && (
                    <TransformControls ref={transformRef} object={ refPiece ? refPiece : refItem.groupRef} mode={transformMode} />
                )}
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
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
                    <TablaConfigContent />
                </ChildItemConfigurationInterface>
            )}

            {refCajon && (
                <ChildItemConfigurationInterface title="Cajon Configurator">
                    <CajonConfigContent />
                </ChildItemConfigurationInterface>
            )}


            <RoomConfigPanel />
        </>
    );
};