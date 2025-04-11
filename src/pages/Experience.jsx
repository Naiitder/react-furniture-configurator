import {useRef, useState, useEffect} from "react";
import {Canvas, useThree} from "@react-three/fiber";
import {TransformControls, OrbitControls, Environment, Stage, OrthographicCamera} from "@react-three/drei";
import {useLocation} from "react-router-dom";
import Casco from "../components/Casco/Casco.js";
import Pata from "../components/Casco/Pata.js";
import Puerta from "../components/Casco/Puerta.js";
import CascoInterface from "../components/Casco/CascoInterface.jsx";
import {Room} from "../components/Enviroment/Room.jsx";
import RoomConfigPanel from "../components/Enviroment/RoomConfigPanel.jsx";
import TransformControlPanel from "./TransformControlPanel";
import {useDrop} from "react-dnd";
import * as THREE from "three";
import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx";
import {INTERSECTION_TYPES} from "../components/Casco/DraggableIntersection.js";

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
                const intersects = raycaster.intersectObject(refItem.groupRef, true);
                if (intersects.length > 0) {
                    //console.log("👉 Intersección con Casco en:", intersects[0].point);
                }
            } else {
                console.warn("refItem no es un objeto Three.js válido:", refItem);
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
    const { refItem, setRefItem } = useSelectedItemProvider();
    const [scaleDimensions, setScaleDimensions] = useState({ x: 2, y: 2, z: 2 });

    const [undoStack, setUndoStack] = useState([]);

    const [droppedHorizontalCubes, setDroppedHorizontalCubes] = useState([]);
    const [droppedVerticalCubes, setDroppedVerticalCubes] = useState([]);

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
            },
            casco2: {
                id: 'casco2',
                name: 'Casco2',
                position: [3, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: { width: 2, height: 2, depth: 2, espesor: 0.1 },
                patas: [<Pata height={1} />],
                puertas: [<Puerta />],
            },
            casco3: {
                id: 'casco3',
                name: 'Casco3',
                position: [0, 0, 0],
                rotation: [0, Math.PI, 0],
                userData: { width: 2, height: 2, depth: 2, espesor: 0.1 },
                patas: [<Pata height={1} />],
                puertas: [<Puerta />],
            },
        });
    }, []);

    // Actualizar refItem al hacer clic en un casco
    const handleCascoClick = (selectedObject) => {
        setRefItem(selectedObject);
    };

    // Guardar estado inicial del objeto seleccionado
    const saveTransformState = () => {
        if (!refItem || !(refItem.groupRef instanceof THREE.Object3D)) return;

        const state = {
            position: refItem.groupRef.position.clone(),
            rotation: refItem.groupRef.rotation.clone(),
            scale: refItem.groupRef.scale.clone(),
            dimensions: {
                width: refItem.userData?.width || 1,
                height: refItem.userData?.height || 1,
                depth: refItem.userData?.depth || 1,
            },
        };
        setUndoStack((prev) => [...prev, state]);
    };

    // Actualizar refItem al cargar el componente
    useEffect(() => {
        if (refItem) {
            saveTransformState();
           // console.log("groupRef",refItem.groupRef);
        }
    }, [refItem]);


    // Manejar cambios de escala
    useEffect(() => {
        if (transformRef.current && refItem) {
            const controls = transformRef.current;
            const onObjectChange = () => {
                if (transformMode === "scale") {
                    const newScale = refItem.scale;
                    const width = refItem.userData.width || 2;
                    const height = refItem.userData.height || 2;
                    const depth = refItem.userData.depth || 2;

                    const newWidth = Math.min(5, Math.max(1, width * newScale.x));
                    const newHeight = Math.min(6, Math.max(1, height * newScale.y));
                    const newDepth = Math.min(4, Math.max(1, depth * newScale.z));

                    setScaleDimensions({ x: newWidth, y: newHeight, z: newDepth });
                    refItem.userData = { ...refItem.userData, width: newWidth, height: newHeight, depth: newDepth };
                    refItem.scale.set(1, 1, 1); // Resetear escala para evitar acumulaciones
                }
            };
            controls.addEventListener("objectChange", onObjectChange);
            return () => controls.removeEventListener("objectChange", onObjectChange);
        }
    }, [transformMode, refItem])


    // Configuración del drop con react-dnd
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            const gl = glRef.current;
            const camera = cameraRef.current;

            if (!clientOffset || !gl || !camera || !refItem) return;

            const { x, y } = clientOffset;
            const bounds = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((x - bounds.left) / bounds.width) * 2 - 1,
                -((y - bounds.top) / bounds.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(refItem.groupRef, true);
            if (intersects.length > 0) {
                const point = intersects[0].point;
                const worldPosition = new THREE.Vector3(point.x, point.y, point.z);
                refItem.groupRef.updateMatrixWorld(true);
                const localPosition = refItem.groupRef.worldToLocal(worldPosition.clone());

                const cascoWidth = refItem.userData?.width || 2;
                const cascoHeight = refItem.userData?.height || 2;
                const cascoDepth = refItem.userData?.depth || 2;
                const espesor = refItem.userData?.espesor || 0.1;

                let adjustedWidth = cascoWidth;
                let adjustedHeight = cascoHeight;
                let adjustedPosition = [localPosition.x, localPosition.y, localPosition.z];

                if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                    // Lógica para secciones horizontales (sin cambios aquí)
                    const relevantVerticals = droppedVerticalCubes.filter((cube) => {
                        const cubeMinY = cube.relativePosition[1] * cascoHeight - (cube.relativeHeight * cascoHeight) / 2;
                        const cubeMaxY = cube.relativePosition[1] * cascoHeight + (cube.relativeHeight * cascoHeight) / 2;
                        return localPosition.y >= cubeMinY && localPosition.y <= cubeMaxY;
                    });

                    const verticalSections = relevantVerticals
                        .map((cube) => cube.relativePosition[0] * cascoWidth)
                        .sort((a, b) => a - b);

                    const boundaries = [-cascoWidth / 2, ...verticalSections, cascoWidth / 2];
                    let leftBoundary = boundaries.filter((pos) => pos < localPosition.x).sort((a, b) => b - a)[0] || -cascoWidth / 2;
                    let rightBoundary = boundaries.filter((pos) => pos > localPosition.x).sort((a, b) => a - b)[0] || cascoWidth / 2;

                    adjustedWidth = rightBoundary - leftBoundary;
                    adjustedPosition[0] = (leftBoundary + rightBoundary) / 2;

                    const existingSection = droppedHorizontalCubes.find((cube) => {
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

                    if (existingSection) {
                        console.warn("Ya existe una sección horizontal en esta posición Y");
                        return;
                    }
                } else if (item.type === INTERSECTION_TYPES.VERTICAL) {
                    // Lógica para secciones verticales (sin cambios aquí)
                    const relevantHorizontals = droppedHorizontalCubes.filter((cube) => {
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
                    let bottomBoundary = boundaries.filter((pos) => pos < localPosition.y).sort((a, b) => b - a)[0] || 0;
                    let topBoundary = boundaries.filter((pos) => pos > localPosition.y).sort((a, b) => a - b)[0] || cascoHeight;

                    adjustedHeight = topBoundary - bottomBoundary;
                    adjustedPosition[1] = (bottomBoundary + topBoundary) / 2;

                    const existingSection = droppedVerticalCubes.find((cube) => {
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

                    if (existingSection) {
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

                if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                    setDroppedHorizontalCubes((prev) => [...prev, newCube]);
                } else if (item.type === INTERSECTION_TYPES.VERTICAL) {
                    setDroppedVerticalCubes((prev) => [...prev, newCube]);
                }
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [refItem, droppedHorizontalCubes, droppedVerticalCubes]);

    const interfaceComponents = {
        "Casco": (
            <CascoInterface
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
    };

    const itemComponents = {
        "Casco": (
            <>
                {Object.values(cascoInstances).map((casco) => (
                    <group key={casco.id}>
                        <Casco
                            key={casco.id}
                            position={casco.position}
                            rotation={casco.rotation}
                            {...casco.userData}
                            patas={casco.patas}
                            puertas={casco.puertas}
                            onClick={handleCascoClick}

                        />
                    </group>
                ))}
            </>
        ),
    };

    return (
        <>
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{ position: [4, 4, -12], fov: 35 }}>
                <RaycastClickLogger glRef={glRef} cameraRef={cameraRef} />
                <Room positionY={3.5} />
                <Stage intensity={5} environment={null} shadows="contact" adjustCamera={false}>
                    <Environment files={"/images/poly_haven_studio_4k.hdr"} />
                    {itemComponents[selectedItem]}
                </Stage>
                {transformEnabled && refItem && (
                    <TransformControls ref={transformRef} object={refItem.groupRef} mode={transformMode} />
                )}
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
            </Canvas>
            {interfaceComponents[selectedItem]}
            <RoomConfigPanel />
        </>
    );
};