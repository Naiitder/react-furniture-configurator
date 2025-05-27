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
import IntersectionOverlay from "../components/InterseccionOverlay.js";

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
                    new InterseccionMueble({x: 0.5, y: 0.5}, Orientacion.Horizontal),
                    new InterseccionMueble({x: 0.75, y: .25}, Orientacion.Horizontal),
                    new InterseccionMueble({x: 0, y: 0.75}, Orientacion.Horizontal),

                    new InterseccionMueble({x: 0.5, y: 0.6}, Orientacion.Vertical), // Bloquea y corta la horizontal pero la ultima entrada no lo detecta
                    new InterseccionMueble({x: 0.5, y: 1}, Orientacion.Vertical),
// Se recorta por el horizontal de y: 0.35

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
            const intersecciones = cascoData.intersecciones || [];

            const rawX = intersectObject.uv.x;
            const rawY = intersectObject.uv.y;

// Pos final, antes de redondear
            let posX = rawX;
            let posY = rawY;

            const round2 = v => Math.round(v * 100) / 100;

            posX = round2(posX);
            posY = round2(posY);

            const orientacion = item.type === INTERSECTION_TYPES.HORIZONTAL ? Orientacion.Horizontal : Orientacion.Vertical;
            const tolerancia = 0.03;

            console.log(`Posición raw antes del procesamiento: X=${rawX}, Y=${rawY}`);

// Función auxiliar: verifica si una vertical puede expandirse en una zona Y
            const puedeVerticalExpandirseEnY = (xPos, yInicio, yFin, interseccionesExistentes) => {
                // Busca horizontales que estén en este rango Y y que crucen por esta X
                for (const h of interseccionesExistentes) {
                    if (h.orientation === Orientacion.Horizontal) {
                        const hy = h.position.y;
                        // Si hay una horizontal en el rango Y que necesitamos
                        if (hy > yInicio && hy < yFin) {
                            // Verificamos si esta horizontal puede llegar hasta nuestra X
                            // Simplificamos: si no hay verticales entre la horizontal y nuestra X, puede llegar
                            const verticalesQueBloquean = interseccionesExistentes.filter(v =>
                                v.orientation === Orientacion.Vertical &&
                                Math.abs(v.position.y - hy) < tolerancia &&
                                ((v.position.x > Math.min(h.position.x, xPos) && v.position.x < Math.max(h.position.x, xPos)))
                            );

                            if (verticalesQueBloquean.length === 0) {
                                return false; // La horizontal bloquea la expansión de la vertical
                            }
                        }
                    }
                }
                return true; // La vertical puede expandirse libremente en este rango Y
            };

// Función auxiliar: verifica si una horizontal puede expandirse en una zona X
            const puedeHorizontalExpandirseEnX = (yPos, xInicio, xFin, interseccionesExistentes) => {
                // Busca verticales que estén en este rango X y que crucen por esta Y
                for (const v of interseccionesExistentes) {
                    if (v.orientation === Orientacion.Vertical) {
                        const vx = v.position.x;
                        // Si hay una vertical en el rango X que necesitamos
                        if (vx > xInicio && vx < xFin) {
                            // Verificamos si esta vertical puede llegar hasta nuestra Y
                            // Simplificamos: si no hay horizontales entre la vertical y nuestra Y, puede llegar
                            const horizontalesQueBloquean = interseccionesExistentes.filter(h =>
                                h.orientation === Orientacion.Horizontal &&
                                Math.abs(h.position.x - vx) < tolerancia &&
                                ((h.position.y > Math.min(v.position.y, yPos) && h.position.y < Math.max(v.position.y, yPos)))
                            );

                            if (horizontalesQueBloquean.length === 0) {
                                return false; // La vertical bloquea la expansión de la horizontal
                            }
                        }
                    }
                }
                return true; // La horizontal puede expandirse libremente en este rango X
            };

            if (orientacion === Orientacion.Horizontal) {
                // Para intersecciones horizontales
                // Primero, encontramos todas las horizontales que realmente pueden competir por el espacio
                // en el rango X donde se va a expandir esta horizontal

                const horizontalesEnRango = [];

                // Calculamos qué horizontales están en el mismo "corredor" horizontal
                for (const h of intersecciones) {
                    if (h.orientation === Orientacion.Horizontal) {
                        // Una horizontal compite si puede expandirse hacia nuestra zona X
                        // y nuestra horizontal puede expandirse hacia su zona X
                        const xMin = Math.min(h.position.x, posX) - 0.1; // Margen de seguridad
                        const xMax = Math.max(h.position.x, posX) + 0.1;

                        // Verificamos si ambas horizontales pueden coexistir en el mismo rango Y
                        // (es decir, si hay espacio para ambas o si una bloquea a la otra)
                        if (puedeHorizontalExpandirseEnX(h.position.y, xMin, xMax, intersecciones) &&
                            puedeHorizontalExpandirseEnX(posY, xMin, xMax, intersecciones)) {
                            horizontalesEnRango.push(h);
                        }
                    }
                }

                if (horizontalesEnRango.length === 0) {
                    const posiblesSnaps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
                    const toleranciaSnap = 0.04;
                    let snapAplicado = false;

                    for (const snapY of posiblesSnaps) {
                        if (Math.abs(posY - snapY) <= toleranciaSnap) {
                            posY = snapY;
                            console.log(`Intersección horizontal centrada automáticamente en Y=${snapY} (snap aplicado por proximidad)`);
                            snapAplicado = true;
                            break;
                        }
                    }

                    if (!snapAplicado) {
                        console.log(`Intersección horizontal mantenida en Y=${posY} (fuera de zona de snap)`);
                    }
                } else {
                    // Hay otras horizontales, necesitamos encontrar el mejor espacio disponible
                    horizontalesEnRango.sort((a, b) => a.position.y - b.position.y);

                    // Crear lista de posiciones Y ocupadas, incluyendo los bordes
                    const posicionesOcupadas = [0, ...horizontalesEnRango.map(h => h.position.y), 1];

                    // Encontrar el segmento donde cae nuestra posición Y
                    let mejorY = posY;
                    let segmentoEncontrado = false;

                    for (let i = 0; i < posicionesOcupadas.length - 1; i++) {
                        const inferior = posicionesOcupadas[i];
                        const superior = posicionesOcupadas[i + 1];
                        const centroSegmento = (inferior + superior) / 2;
                        const alturaSegmento = superior - inferior;

                        // Verificamos si nuestra posición Y cae en este segmento
                        if (posY >= inferior && posY <= superior) {
                            segmentoEncontrado = true;

                            // Solo centramos automáticamente si:
                            // 1. El segmento es suficientemente grande (> 0.1)
                            // 2. La posición está cerca del centro del segmento
                            const distanciaDelCentroSegmento = Math.abs(posY - centroSegmento);
                            const toleranciaCentrado = Math.min(0.1, alturaSegmento * 0.3); // Tolerancia proporcional

                            if (alturaSegmento > 0.1 && distanciaDelCentroSegmento < toleranciaCentrado) {
                                mejorY = round2(centroSegmento);
                                console.log(`Intersección horizontal centrada en Y=${mejorY} (centro del segmento [${inferior}, ${superior}])`);
                            } else {
                                console.log(`Intersección horizontal mantenida en Y=${posY} (no está cerca del centro del segmento)`);
                            }
                            break;
                        }
                    }

                    if (!segmentoEncontrado) {
                        console.log(`Intersección horizontal mantenida en Y=${posY} (fuera de segmentos válidos)`);
                    }

                    posY = mejorY;
                }
            } else {
                // Para intersecciones verticales
                // Buscamos verticales que podrían competir por el mismo espacio
                const verticalesCompetidoras = [];

                for (const v of intersecciones) {
                    if (v.orientation === Orientacion.Vertical) {
                        const distanciaY = Math.abs(v.position.y - posY);
                        if (distanciaY < 0.3) {
                            const yMin = Math.min(v.position.y, posY);
                            const yMax = Math.max(v.position.y, posY);

                            if (puedeVerticalExpandirseEnY(posX, yMin, yMax, intersecciones)) {
                                verticalesCompetidoras.push(v);
                            }
                        }
                    }
                }

                if (verticalesCompetidoras.length === 0) {
                    // Buscar snaps cercanos (por ejemplo, 0.25, 0.5, 0.75)
                    const posiblesSnaps = [0.25, 0.5, 0.75];
                    const toleranciaSnap = 0.04;

                    let snapAplicado = false;

                    for (const snapX of posiblesSnaps) {
                        if (Math.abs(posX - snapX) <= toleranciaSnap) {
                            posX = snapX;
                            console.log(`Intersección vertical centrada automáticamente en X=${snapX} (snap aplicado por proximidad)`);
                            snapAplicado = true;
                            break;
                        }
                    }

                    if (!snapAplicado) {
                        console.log(`Intersección vertical mantenida en X=${posX} (fuera de zona de snap)`);
                    }
                } else {
                    verticalesCompetidoras.sort((a, b) => a.position.x - b.position.x);
                    const puntos = [0, ...verticalesCompetidoras.map(v => v.position.x), 1];

                    for (let i = 0; i < puntos.length - 1; i++) {
                        const izquierda = puntos[i];
                        const derecha = puntos[i + 1];

                        if (posX >= izquierda && posX <= derecha) {
                            const centro = (izquierda + derecha) / 2;
                            posX = round2(centro);
                            console.log(`Intersección vertical centrada en X=${posX} entre ${izquierda} y ${derecha}`);
                            break;
                        }
                    }
                }
            }

// Create a new intersection
            const newInterseccion = new InterseccionMueble(
                {
                    x: posX,
                    y: posY,
                },
                orientacion,
            );

            setCascoInstances((prev) => {
                const updated = {...prev};
                const updatedCasco = {...updated[cascoKey]};

                // Add the new intersection to the existing ones
                updatedCasco.intersecciones = [...intersecciones, newInterseccion];

                console.log("updatedCasco", newInterseccion);

                updated[cascoKey] = updatedCasco;
                return updated;
            });

            if (refItem?.groupRef) {
                const ud = refItem.groupRef.userData;
                ud.intersecciones = [...(ud.intersecciones || []), newInterseccion];
            }

            // 3) bump the version to force your Bodeguero to pull new userData:
            setVersion(v => v + 1);
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

            <IntersectionOverlay
                isVisible={false} // overlayData.isIntersection
                overlayPositions={undefined} // overlayData.overlayPositions
                intersectionData={undefined} // overlayData.intersectionData
            />

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