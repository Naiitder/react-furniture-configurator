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
    import {useDrop} from "react-dnd";
    import * as THREE from "three";
    import {useSelectedItemProvider} from "../contexts/SelectedItemProvider.jsx";
    import {INTERSECTION_TYPES} from "../components/Casco/DraggableIntersection.js";
    import CascoSimple from "../components/CascoBrr/CascoSimple.js";
    import TablaConfigurationInterface from "../components/TablaConfiguratorInterface.jsx";
    import TablaConfigContent from "../components/Casco/TablaInterface.jsx";
    import {useSelectedPieceProvider} from "../contexts/SelectedPieceProvider.jsx";
    import PataAparador from "../components/Aparador/PataAparador.js";
    import AparadorInterface from "../components/Aparador/AparadorInterface.jsx";

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
        const [aparadorInstances, setAparadorInstances] = useState({}); // Almacenar instancias de cascos
        const { refItem, setRefItem, version, setVersion } = useSelectedItemProvider();
        const { refPiece, setRefPiece} = useSelectedPieceProvider();
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
            });
            setAparadorInstances({
                aparador1: {
                    id: 'aparador1',
                    name: 'Aparador1',
                    position: [0, 0, 0],
                    rotation: [0, Math.PI, 0],
                    userData: { width: 1.54, height: .93, depth: .6, espesor: 0.05 },
                    patas: [<PataAparador height={.1} />],
                    puertas: [<Puerta />],
                    seccionesHorizontales: [],
                    seccionesVerticales: [],
                },
            });
        }, []);

        // Actualizar refItem al hacer clic en un casco
        const handleCascoClick = (selectedObject) => {
            setRefItem(selectedObject);
        };

        useEffect(() => {
            if (transformRef.current && refItem.groupRef) {
                const controls = transformRef.current;
                const onObjectChange = () => {
                    if (transformMode === "scale") {
                        console.log(refItem);
                        console.log("USERDATA", refItem.groupRef.userData);
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
                        setVersion(version + 1);
                    }
                };
                controls.addEventListener("objectChange", onObjectChange);
                return () => controls.removeEventListener("objectChange", onObjectChange);
            }
        }, [transformMode, refItem, version]);

        const allInstances = {
            ...cascoInstances,
            ...aparadorInstances
        };



// justo después de definir allInstances:
        const [{ isOver }, drop] = useDrop(() => ({
            accept: "INTERSECTION",
            drop: (item, monitor) => {
                const clientOffset = monitor.getClientOffset();
                const gl = glRef.current;
                const camera = cameraRef.current;
                if (!clientOffset || !gl || !camera || !refItem) return;

                // obtenemos la clave y los datos del objeto bajo drop
                const key = refItem.groupRef.name;
                const data = allInstances[key];
                if (!data) return;

                // calculamos mouse, raycaster y posición local...
                const bounds = gl.domElement.getBoundingClientRect();
                const mouse = new THREE.Vector2(
                    ((clientOffset.x - bounds.left) / bounds.width) * 2 - 1,
                    -((clientOffset.y - bounds.top) / bounds.height) * 2 + 1
                );
                const raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(mouse, camera);
                const intersects = refItem.detectionRef
                    ? raycaster.intersectObject(refItem.detectionRef, true)
                    : [];
                if (!intersects.length) return;

                const point = intersects[0].point;
                refItem.groupRef.updateMatrixWorld(true);
                const localPos = refItem.groupRef.worldToLocal(point.clone());

                // desestructuramos dimensiones
                const { width, height, depth, espesor } = refItem.groupRef.userData;
                let adjW = width, adjH = height;
                let [px, py, pz] = [localPos.x, localPos.y, localPos.z];

                const hCubes = data.seccionesHorizontales || [];
                const vCubes = data.seccionesVerticales   || [];

                // cálculo de nueva sección (igual que antes)...

                // construimos el nuevo cubo
                const newCube = {
                    id: Date.now(),
                    relativePosition: [px/width, py/height, pz/depth],
                    relativeWidth:  item.type === INTERSECTION_TYPES.HORIZONTAL ? adjW/width : espesor/width,
                    relativeHeight: item.type === INTERSECTION_TYPES.VERTICAL   ? adjH/height: espesor/height,
                    relativeDepth:  (depth - (refItem.userData?.traseroDentro ? refItem.userData?.retranqueoTrasero||0 : 0)) / depth,
                    color: item.color || "#8B4513",
                };

                // ¿es un casco o un aparador?
                const isCasco  = !!cascoInstances[key];
                const isApara = !!aparadorInstances[key];

                if (isCasco) {
                    setCascoInstances(prev => {
                        const next = { ...prev };
                        const target = { ...next[key] };
                        if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                            target.seccionesHorizontales = [...hCubes, newCube];
                        } else {
                            target.seccionesVerticales = [...vCubes, newCube];
                        }
                        next[key] = target;
                        return next;
                    });
                }

                if (isApara) {
                    setAparadorInstances(prev => {
                        const next = { ...prev };
                        const target = { ...next[key] };
                        if (item.type === INTERSECTION_TYPES.HORIZONTAL) {
                            target.seccionesHorizontales = [...hCubes, newCube];
                        } else {
                            target.seccionesVerticales = [...vCubes, newCube];
                        }
                        next[key] = target;
                        return next;
                    });
                }
            },
            collect: monitor => ({ isOver: !!monitor.isOver() })
        }), [refItem, cascoInstances, aparadorInstances]);

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
            //@Pruden
            "Casco brr": (
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
            )
        };

        const itemComponents = {
            "Casco": (
                <>
                    {Object.values(cascoInstances).map((casco) => (
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

            //@Pruden
            "Casco brr": (
                <>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />

                    <group
                        onPointerMissed={(e) => {
                            if (selectedItem === "Casco brr") {
                                e.stopPropagation();
                                setSelectedCascoId(null);
                            }
                        }}
                    >
                        <CascoSimple
                            id="casco1"
                            position={[0, 0, 0]}
                            isSelected={selectedCascoId === "casco1"}
                            onClick={() => setSelectedCascoId("casco1")}
                        />
                        <CascoSimple
                            id="casco2"
                            position={[10, 0, 0]}
                            isSelected={selectedCascoId === "casco2"}
                            onClick={() => setSelectedCascoId("casco2")}
                        />
                        <CascoSimple
                            id="casco3"
                            position={[-10, 0, 0]}
                            isSelected={selectedCascoId === "casco3"}
                            onClick={() => setSelectedCascoId("casco3")}
                        />
                    </group>
                </>
            ),
            "Aparador": (
                <>
                    {Object.values(aparadorInstances).map((aparador) => (
                        <group key={aparador.id}>
                            <Casco
                                key={aparador.id}
                                id={aparador.id}
                                position={aparador.position}
                                rotation={aparador.rotation}
                                {...aparador.userData}
                                patas={aparador.patas}
                                puertas={aparador.puertas}
                                onClick={handleCascoClick}
                                version={version}
                                seccionesHorizontales={aparador.seccionesHorizontales}
                                seccionesVerticales={aparador.seccionesVerticales}
                                indicePata={0}
                                puertas={-1}
                            />
                        </group>
                    ))}
                </>
            ),

        };

        return (
            <>
                <Canvas ref={drop} shadows dpr={[1, 2]} camera={{position: [4, 4, -12], fov: 35}}>
                    <RaycastClickLogger glRef={glRef} cameraRef={cameraRef}/>
                    <Room positionY={3.5}/>
                    <Stage intensity={5} environment={null} shadows="contact" adjustCamera={false}>
                        <Environment files={"/images/poly_haven_studio_4k.hdr"} />
                        {itemComponents[selectedItem]}
                    </Stage>
                    {transformEnabled && refItem && (
                        <TransformControls ref={transformRef} object={ refPiece ? refPiece : refItem.groupRef} mode={transformMode} />
                    )}
                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
                </Canvas>
                {interfaceComponents[selectedItem]}


                {refPiece && (
                    <TablaConfigurationInterface
                        title="Tabla Configurator"
                        show={true}
                        setShow={true}
                        mode={transformMode}
                        setMode={setTransformMode}
                    >
                        <TablaConfigContent />
                    </TablaConfigurationInterface>
                )}

                <RoomConfigPanel />
            </>
        );
    };