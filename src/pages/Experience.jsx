import React, {useEffect, useRef, useState} from "react";
import {Canvas, useThree} from "@react-three/fiber";
import {OrbitControls, Stage, TransformControls,} from "@react-three/drei";
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

    const [transformEnabled, setTransformEnabled] = useState(false);
    const [transformMode, setTransformMode] = useState("");
    const [cascoInstances, setCascoInstances] = useState({}); // Almacenar instancias de cascos
    const {refItem, setRefItem, version, setVersion} = useSelectedItemProvider();
    const {refPiece, setRefPiece} = useSelectedPieceProvider();
    const {refCajon, setRefCajon} = useSelectedCajonProvider();
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
                } else if (transformMode === "translate" ) {
                    console.log("MOVIENDO INTERSECCION")
                }
            };

            controls.addEventListener("objectChange", onObjectChange);
            return () => controls.removeEventListener("objectChange", onObjectChange);
        }
    }, [transformMode, refItem, version, setVersion]);


    const hoverTimeout = useRef(null);
    const lastClientOffset = useRef(null);

    function revertPreviewIntersections() {
        setCascoInstances(prev => {
            const updated = {};
            for (const key in prev) {
                const casco = prev[key];
                const inters = casco.intersecciones ?? [];
                // Generamos un nuevo array para forzar re-render
                const newInters = inters.map(i => {
                    if (i.previsualization) {
                        // Creamos un nuevo objeto con el mismo createdAt
                        return new InterseccionMueble(
                            { x: i.position.x, y: i.position.y },
                            i.orientation,
                            false,            // previsualization -> false
                            i.createdAt       // conservamos la fecha original
                        );
                    }
                    return i;
                });
                updated[key] = {
                    ...casco,
                    intersecciones: newInters,
                };
            }
            setVersion(v => v + 1);
            return updated;
        });

        // Sincronizamos userData del mueble seleccionado
        if (refItem?.groupRef) {
            const ud = refItem.groupRef.userData;
            ud.intersecciones = (ud.intersecciones ?? []).map(i => {
                if (i.previsualization) {
                    i.previsualization = false;
                    return i;
                }
                return i;
            });
        }
    }


    function findNeighbors(items, keyFn, target) {
        // clonar y ordenar por la clave
        const sorted = [...items].sort((a, b) => keyFn(a) - keyFn(b));
        let prev = null;
        let next = null;

        for (const item of sorted) {
            const val = keyFn(item);
            if (val < target) {
                prev = item;           // se quedará con el mayor < target
            } else if (val > target && next === null) {
                next = item;           // el primer > target
            }
        }

        return [prev, next];
    }

    function clearPreviewIntersections() {
        setCascoInstances(prev => {
            const updated = {};
            for (const key in prev) {
                const casco = prev[key];
                const inters = casco.intersecciones ?? [];
                updated[key] = {
                    ...casco,
                    intersecciones: inters.filter(i => !i.previsualization),
                };
            }
            return updated;
        });

        if (refItem?.groupRef) {
            const ud = refItem.groupRef.userData;
            // <-- mismo fallback aquí
            ud.intersecciones = (ud.intersecciones ?? []).filter(i => !i.previsualization);
        }

        setVersion(v => v + 1);
    }

    function getHorizontalRange(horizontal, verticals) {
        const x0 = horizontal.position.x;

        let leftX  = 0;
        let rightX = 1;

        verticals.forEach(v => {
            const vx = v.position.x;
            console.log(" x")
            if (vx < x0) leftX  = Math.max(leftX,  vx);
            if (vx >= x0) rightX = Math.min(rightX, vx);
        });

        return [leftX, rightX];
    }

    const idleTimeRef = useRef(0);
    const lastTimestampRef = useRef(null);
    const previewCreatedRef = useRef(false);

    const [{isOver}, drop] = useDrop(() => ({
        accept: "INTERSECTION",
        hover(item, monitor) {
            if (!refItem?.groupRef) return;

            if (!monitor.isOver({ shallow: true })) {
                if (hoverTimeout.current) {
                    clearTimeout(hoverTimeout.current);
                    hoverTimeout.current = null;
                    clearPreviewIntersections();
                    previewCreatedRef.current = false;
                    idleTimeRef.current = 0;
                    lastTimestampRef.current = null;
                }
                lastClientOffset.current = null;
                return;
            }

            const clientOffset = monitor.getClientOffset();
            if (!clientOffset) return;

            const prev = lastClientOffset.current;
            if (
                !prev ||
                prev.x !== clientOffset.x ||
                prev.y !== clientOffset.y
            ) {
                clearPreviewIntersections();
                previewCreatedRef.current = false;
                idleTimeRef.current = 0;
                lastTimestampRef.current = null;
                lastClientOffset.current = clientOffset;
            }
            else{
                const now = performance.now();
                if (lastTimestampRef.current == null) {
                    lastTimestampRef.current = now;
                }
                const deltaTime = (now - lastTimestampRef.current) / 1000;
                idleTimeRef.current += deltaTime;
                lastTimestampRef.current = now;

                if (idleTimeRef.current >= .01 && !previewCreatedRef.current) {
                    previewCreatedRef.current = true;
                    createIntersect(item,monitor,true)
                }
            }

            if (hoverTimeout.current) {
                clearTimeout(hoverTimeout.current);
                clearPreviewIntersections();
                previewCreatedRef.current = false;
                idleTimeRef.current = 0;
                lastTimestampRef.current = null;
            }


        },
        drop: (item, monitor) => {

            if (hoverTimeout.current) {
                   clearTimeout(hoverTimeout.current);
                   hoverTimeout.current = null;
            }
            if (!previewCreatedRef.current) {
                createIntersect(item, monitor);
            } else {
                revertPreviewIntersections();
            }
            previewCreatedRef.current = false;
            idleTimeRef.current = 0;
            lastTimestampRef.current = null;


        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }), [refItem, cascoInstances]);


    function createIntersect(item, monitor, previsualization = false) {
        // 1) Coordenadas del ratón + raycast UV
        const offset = monitor.getClientOffset();
        const gl     = glRef.current;
        const camera = cameraRef.current;
        const ref    = refItem?.groupRef;
        if (!offset || !gl || !camera || !ref) return;

        const bounds = gl.domElement.getBoundingClientRect();
        const mouse  = new THREE.Vector2(
            ((offset.x - bounds.left) / bounds.width) * 2 - 1,
            -((offset.y - bounds.top)  / bounds.height)* 2 + 1
        );
        const ray = new THREE.Raycaster();
        ray.setFromCamera(mouse, camera);
        const hit = ray.intersectObject(ref, true)[0];
        if (!hit?.uv) return;
        const rawX = hit.uv.x;
        const rawY = hit.uv.y;

        // 2) Ordenar cronológicamente las previas
        const prev = cascoInstances[ref.name]?.intersecciones || [];
        const sorted = prev
            .map((i, idx) => ({ i, idx }))
            .sort((a, b) => {
                const tA = a.i.createdAt.getTime(),
                    tB = b.i.createdAt.getTime();
                return tA !== tB ? tA - tB : a.idx - b.idx;
            })
            .map(o => o.i);

        const isHoriz = item.type === INTERSECTION_TYPES.HORIZONTAL;
        const orient = isHoriz
            ? Orientacion.Horizontal
            : Orientacion.Vertical;

        const verticals   = sorted.filter(i => i.orientation === Orientacion.Vertical);
        const horizontals = sorted.filter(i => i.orientation === Orientacion.Horizontal);

        const validHorizontals = horizontals.filter(h => {
            const [lX, rX] = getHorizontalRange(h, verticals);
            return rawX >= lX && rawX <= rX;
        });

        let piezasAdyacientes, piezasLimitantes;
        if (orient === Orientacion.Horizontal) {
            piezasAdyacientes = findNeighbors(verticals, v => v.position.x, rawX);
            piezasLimitantes   = findNeighbors(validHorizontals, h => h.position.y, rawY);
        } else {
            piezasAdyacientes = findNeighbors(horizontals, h => h.position.y, rawY);
            piezasLimitantes   = findNeighbors(verticals, v => v.position.x, rawX);
        }

        let posX = rawX;
        let posY = rawY;

//        console.log('antes',posX, posY);

        if(piezasLimitantes[0] != null && piezasLimitantes[1] != null){
            if(orient === Orientacion.Horizontal) {
                console.log("no")
                posY = (piezasLimitantes[0].position.y+piezasLimitantes[1].position.y) / 2;

                if(piezasAdyacientes[0] != null && piezasAdyacientes[1] != null){
                    posX = (piezasAdyacientes[0].position.x+piezasAdyacientes[1].position.x) / 2;
                }
                else if(piezasAdyacientes[0] != null && piezasAdyacientes[1] === null){
                    posX = (piezasAdyacientes[0].position.x+1)/2;
                }
                else if(piezasAdyacientes[1] != null && piezasAdyacientes[0] === null){
                    posX = piezasAdyacientes[1].position.x/2;
                }
                else{
                    posX = 0.5;
                }
            }else {
                posX = (piezasLimitantes[0].position.x+piezasLimitantes[1].position.x) / 2

                if(piezasAdyacientes[0] != null && piezasAdyacientes[1] != null){
                    posY = (piezasAdyacientes[0].position.y+piezasAdyacientes.position.y) / 2;
                }
                else if(piezasAdyacientes[0] != null && piezasAdyacientes[1] === null){
                    posY = (piezasAdyacientes[0].position.y+1)/2;
                }
                else if(piezasAdyacientes[1] != null && piezasAdyacientes[0] === null){
                    posY = piezasAdyacientes[1].position.y/2;
                }
                else{
                    posY = 0.5;
                }
            }
        }
        else if (piezasLimitantes[0] != null && piezasLimitantes[1] === null){
            if(orient === Orientacion.Horizontal) {
                posY = (piezasLimitantes[0].position.y+1)/2;

                if(piezasAdyacientes[0] != null && piezasAdyacientes[1] != null){
                    posX = (piezasAdyacientes[0].position.x+piezasAdyacientes[1].position.x) / 2;
                }
                else if(piezasAdyacientes[0] != null && piezasAdyacientes[1] === null){
                    posX = (piezasAdyacientes[0].position.x+1)/2;
                }
                else if(piezasAdyacientes[1] != null && piezasAdyacientes[0] === null){
                    posX = piezasAdyacientes[1].position.x/2;
                }
                else{
                    posX = 0.5;
                }
            }
            else {
                posX = (piezasLimitantes[0].position.x+1) / 2

                if(piezasAdyacientes[0] != null && piezasAdyacientes[1] != null){
                    posY = (piezasAdyacientes[0].position.y+piezasAdyacientes.position.y) / 2;
                }
                else if(piezasAdyacientes[0] != null && piezasAdyacientes[1] === null){
                    posY = (piezasAdyacientes[0].position.y+1)/2;
                }
                else if(piezasAdyacientes[1] != null && piezasAdyacientes[0] === null){
                    posY = piezasAdyacientes[1].position.y/2;
                }
                else{
                    posY = 0.5;
                }
            }
        }
        else if(piezasLimitantes[1] != null && piezasLimitantes[0] === null){
            if(orient === Orientacion.Horizontal) {
                posY = piezasLimitantes[1].position.y/2;

                if(piezasAdyacientes[0] != null && piezasAdyacientes[1] != null){
                    posX = (piezasAdyacientes[0].position.x+piezasAdyacientes[1].position.x) / 2;
                }
                else if(piezasAdyacientes[0] != null && piezasAdyacientes[1] === null){
                    posX = (piezasAdyacientes[0].position.x+1)/2;
                }
                else if(piezasAdyacientes[1] != null && piezasAdyacientes[0] === null){
                    posX = piezasAdyacientes[1].position.x/2;
                }
                else{
                    posX = 0.5;
                }


            }
            else {
                posX = piezasLimitantes[1].position.x / 2

                if(piezasAdyacientes[0] != null && piezasAdyacientes[1] != null){
                    posY = (piezasAdyacientes[0].position.y+piezasAdyacientes[1].position.y) / 2;
                }
                else if(piezasAdyacientes[0] != null && piezasAdyacientes[1] === null){
                    posY = (piezasAdyacientes[0].position.y+1)/2;
                }
                else if(piezasAdyacientes[1] != null && piezasAdyacientes[0] === null){
                    posY = piezasAdyacientes[1].position.y/2;
                }
                else{
                    posY = 0.5;
                }
            }
        }
        else {
            if(orient === Orientacion.Horizontal) {
                posY = 0.5;
                if(piezasAdyacientes[0] != null && piezasAdyacientes[1] != null){
                    posX = (piezasAdyacientes[0].position.x+piezasAdyacientes[1].position.x) / 2;
                }
                else if(piezasAdyacientes[0] != null && piezasAdyacientes[1] === null){
                    posX = (piezasAdyacientes[0].position.x+1)/2;
                }
                else if(piezasAdyacientes[1] != null && piezasAdyacientes[0] === null){
                    posX = piezasAdyacientes[1].position.x/2;
                }
                else{
                    posX = 0.5;
                }
            }
            else {
                posX = 0.5;
                if(piezasAdyacientes[0] != null && piezasAdyacientes[1] != null){
                    posY = (piezasAdyacientes[0].position.y+piezasAdyacientes.position.y) / 2;
                }
                else if(piezasAdyacientes[0] != null && piezasAdyacientes[1] === null){
                    posY = (piezasAdyacientes[0].position.y+1)/2;
                }
                else if(piezasAdyacientes[1] != null && piezasAdyacientes[0] === null){
                    posY = piezasAdyacientes[1].position.y/2;
                }
                else{
                    posY = 0.5;
                }
            }
        }

       // console.log('despues', posX, posY);
        console.log("Adyacientes",piezasAdyacientes)
        console.log("Limitantes",piezasLimitantes)

        const nueva = new InterseccionMueble(
            { x: posX, y: posY },
            orient,
            previsualization,
            undefined,               // createdAt (se genera dentro)
            piezasAdyacientes,
            piezasLimitantes
        );

        // 7) Actualizar estado y userData
        setCascoInstances(prev => ({
            ...prev,
            [ref.name]: {
                ...prev[ref.name],
                intersecciones: [...(prev[ref.name].intersecciones||[]), nueva]
            }
        }));
        ref.userData.intersecciones = [
            ...(ref.userData.intersecciones||[]),
            nueva
        ];
        setVersion(v => v + 1);
    }


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

// justo encima de `export const Experience = () => { … }`
    function IntersectionOverlayController({ setOverlayData }) {
        const { refPiece } = useSelectedPieceProvider();
        const { camera, size } = useThree(); // sólo los lee, no los mete como deps

        useEffect(() => {
            if (refPiece?.userData.isInterseccion) {
                // 1. calcula posición 3D → NDC → píxeles
                const worldPos = new THREE.Vector3();
                refPiece.getWorldPosition(worldPos);
                const ndc = worldPos.clone().project(camera);
                const x = (ndc.x * 0.5 + 0.5) * size.width;
                const y = (-ndc.y * 0.5 + 0.5) * size.height;

                // 2. datos de overlay
                const orientation = refPiece.userData.orientation || 'horizontal';
                const placement = orientation === 'vertical' ? 'right' : 'top';
                const newData = {
                    isVisible: true,
                    overlayPositions: {
                        primary: { x, y, placement },
                        secondary: { x: x + 10, y: y + 10, placement }
                    },
                    intersectionData: {
                        id: refPiece.uuid,
                        originalIndex: refPiece.userData.originalIndex ?? 0,
                        position: {
                            x: refPiece.userData.positionX ?? worldPos.x,
                            y: refPiece.userData.positionY ?? worldPos.y
                        },
                        orientation,
                        createdAt: refPiece.userData.createdAt ?? new Date(),
                        dimensions: {
                            width:  refPiece.userData.widthExtra  ?? 0,
                            height: refPiece.userData.heightExtra ?? 0,
                            depth:  refPiece.userData.depthExtra  ?? 0
                        }
                    }
                };

                // 3. sólo setea si realmente cambia algo
                setOverlayData(prev => {
                    const pp = prev.overlayPositions?.primary;
                    if (
                        prev.isVisible
                        && prev.intersectionData?.id === newData.intersectionData.id
                        && pp && Math.abs(pp.x - x) < 1 && Math.abs(pp.y - y) < 1
                        && pp.placement === placement
                    ) {
                        return prev; // nada que actualizar
                    }
                    return newData;
                });
            } else {
                // si no hay pieza o ya no es intersección, ocultamos sólo si estaba visible
                setOverlayData(prev => {
                    if (!prev.isVisible) return prev;
                    return { ...prev, isVisible: false };
                });
            }
        }, [refPiece]); // 🔥 sólo refPiece aquí

        return null;
    }

    const [overlayData, setOverlayData] = useState({
        isVisible: false,
        overlayPositions: null,
        intersectionData: null
    });

    return (
        <>
            <Canvas ref={drop} shadows dpr={[1, 2]} camera={{position: [0, 2, 5], fov: 35}}
                    onPointerMissed={(event) => {
                        if(event.button === 2) return;
                setRefPiece(null);
                setRefCajon(null);
                setRefItem(null);
            }}>
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

                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />

                <IntersectionOverlayController setOverlayData={setOverlayData} />
            </Canvas>
            {interfaceComponents[selectedItem]}

            <IntersectionOverlay
                isVisible={overlayData.isVisible}
                overlayPositions={overlayData.overlayPositions}
                intersectionData={overlayData.intersectionData}
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