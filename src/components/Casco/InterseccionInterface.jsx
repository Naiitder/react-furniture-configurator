import { Form, Slider, Select } from "antd";
import {useEffect, useState} from "react";
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider.jsx";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";
import InterseccionMueble from "../Interseccion";

const InterseccionConfigContent = () => {
    const { refPiece, setRefPiece, version, setVersion} = useSelectedPieceProvider();
    const {refItem } = useSelectedItemProvider();

    const [config, setConfig] = useState({
        positionExtra: [0,0,0],
        widthExtra: 0,
        heightExtra: 0,
        depthExtra: 0,
        espesor: 0.1,
        seccionesAdyacientes: [],
        seccionesLimitantes: [],
        orientation: "vertical" | "horizontal",
    });

    useEffect(() => {
        if (refPiece) {
            // Se prioriza refItem.groupRef.userData, si existe
            const newConfig = refPiece && refPiece.userData
                ? refPiece.userData
                : (refPiece.userData || {});
            setConfig(prev => ({
                ...prev,
                ...newConfig,
            }));
        }
    }, [refPiece, version]);

    // Función unificada para actualizar la configuración y modificar también el userData
    // dentro de refItem.groupRef (o refItem.userData si no existe groupRef)
    const updateConfig = (key, value) => {
        setConfig((prev) => {
            const newConfig = { ...prev, [key]: value };

            // Solo actualiza refPiece fuera del render
            if (refPiece && refPiece.userData) {
                refPiece.userData[key] = value;
            }

            // Asegura que el re-render ocurra correctamente
            requestAnimationFrame(() => {
                setVersion((v) => v + 1);
            });

            return newConfig;
        });
    };

    let seccionLimitanteHorizontalSuperior = 0;
    let seccionLimitanteHorizontalInferior = 0;
    if(refItem) seccionLimitanteHorizontalSuperior = refItem.groupRef.position.y;
    if(refItem) seccionLimitanteHorizontalInferior = refItem.groupRef.position.y + refItem.groupRef.userData.height;

    let seccionLimitanteVerticalIzq = 0;
    let seccionLimitanteVerticalDrcha = 0;

    if(refItem) seccionLimitanteVerticalIzq = refItem.groupRef.position.x - refItem.groupRef.userData.width/2;
    if(refItem) seccionLimitanteVerticalDrcha = refItem.groupRef.position.x + refItem.groupRef.userData.width/2;


    if(config.seccionesLimitantes){
        if (refItem?.groupRef?.children?.[0]?.children && config.seccionesLimitantes[0]) {
            const objeto3D = refItem.groupRef.children[0].children.find(
                (child) => child.uuid === config.seccionesLimitantes[0].uuid
            );
            if(config.orientation === "horizontal"){
                seccionLimitanteHorizontalSuperior = objeto3D.position.y;
                seccionLimitanteHorizontalSuperior = seccionLimitanteHorizontalSuperior+(seccionLimitanteHorizontalSuperior*5/100);
            }else if(config.orientation === "vertical"){
                seccionLimitanteVerticalIzq = objeto3D.position.x;
                seccionLimitanteVerticalIzq = seccionLimitanteVerticalIzq+(seccionLimitanteVerticalIzq*5/100);
            }
        }
        if (refItem?.groupRef?.children?.[0]?.children && config.seccionesLimitantes[1]) {
            const objeto3D = refItem.groupRef.children[0].children.find(
                (child) => child.uuid === config.seccionesLimitantes[1].uuid
            );
        if(config.orientation === "horizontal"){
            seccionLimitanteHorizontalInferior = objeto3D.position.y;
            seccionLimitanteHorizontalInferior = seccionLimitanteHorizontalInferior-(seccionLimitanteHorizontalInferior*5/100);
        }
        else if (config.orientation === "vertical"){
            seccionLimitanteVerticalDrcha = objeto3D.position.x;
            seccionLimitanteVerticalDrcha = seccionLimitanteVerticalDrcha-(seccionLimitanteVerticalDrcha*5/100);
        }

        }
    }

    useEffect(() => {
        console.log(seccionLimitanteHorizontalSuperior);
        console.log(seccionLimitanteHorizontalInferior);
        console.log(config)
        console.log(refItem)
    },[seccionLimitanteHorizontalSuperior, seccionLimitanteHorizontalInferior])

    return (
        <div style={{
            padding: "16px",
            background: "#f0f2f5",
            borderRadius: "8px",
            width: "240px",
            marginLeft: "15px"
        }}>
            <Form>
                <Form.Item label="Position X: ">
                    <Slider
                        step={0.01}
                        min={seccionLimitanteVerticalIzq}
                        max={seccionLimitanteVerticalDrcha}
                        value={config.positionExtra[0]}
                        onChange={(v) => {
                            const newPos = [...config.positionExtra];
                            newPos[0] = v;
                            updateConfig("positionExtra", newPos);
                        }}
                    />
                </Form.Item>
                <Form.Item label="Position Y: ">
                    <Slider
                        step={0.01}
                        min={seccionLimitanteHorizontalSuperior}
                        max={seccionLimitanteHorizontalInferior}
                        value={config.positionExtra[1]}
                        onChange={(v) => {
                            const newPos = [...config.positionExtra];
                            newPos[1] = v;
                            updateConfig("positionExtra", newPos);
                        }}
                    />
                </Form.Item>
                <Form.Item label="Interseccion Width">
                    <Slider
                        min={0}
                        max={30}
                        value={config.widthExtra * 100}
                        onChange={(v) => updateConfig("widthExtra", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Interseccion Height">
                    <Slider
                        step={1}
                        min={0}
                        max={20}
                        value={config.heightExtra * 100}
                        onChange={(v) => updateConfig("heightExtra", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Interseccion Depth">
                    <Slider
                        step={1}
                        min={0}
                        max={30}
                        value={config.depthExtra * 100}
                        onChange={(v) => updateConfig("depthExtra", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Espesor">
                    <Select
                        options={[
                            { label: "10", value: 10 },
                            { label: "12", value: 12 },
                            { label: "14", value: 14 },
                            { label: "16", value: 16 },
                            { label: "18", value: 18 },
                            { label: "20", value: 20 },
                            { label: "22", value: 22 },
                        ]}
                        value={config.espesor * 100}
                        onChange={(v) => updateConfig("espesor", v / 100)}
                    />
                </Form.Item>
            </Form>
        </div>
    );
};

export default InterseccionConfigContent;
