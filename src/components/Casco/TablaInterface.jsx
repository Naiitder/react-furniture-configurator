import { Form, Slider, Select } from "antd";
import {useEffect, useState} from "react";
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider.jsx";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";

const TablaConfigContent = () => {
    const { refPiece, setRefPiece} = useSelectedPieceProvider();
    const { refItem, version, setVersion } = useSelectedItemProvider();

    const [config, setConfig] = useState({
        width: 1,
        height: 1,
        depth: 1,
        espesor: 0.1
    });

    useEffect(() => {
        if (refPiece) {
            setConfig({
                ...config,
                width: refPiece.userData.width,
                height: refPiece.userData.height,
                depth: refPiece.userData.depth,
            })
        }

    }, [refPiece.userData.width, refPiece.userData.depth, refPiece.userData.height, refPiece, config])

    useEffect(() => {
        if (refPiece) {
            // Se prioriza refItem.groupRef.userData, si existe
            const newConfig = refPiece && refPiece.userData
                ? refPiece.userData
                : (refPiece.userData || {});
            console.log(refPiece.userData);
            setConfig(prev => ({
                ...prev,
                ...newConfig,
            }));
            setVersion(version + 1);
        }
    }, [refPiece, setVersion, version]);

    // Función unificada para actualizar la configuración y modificar también el userData
    // dentro de refItem.groupRef (o refItem.groupRef.userData si no existe groupRef)
    const updateConfig = (key, value) => {
        setConfig((prev) => {
            const newConfig = { ...prev, [key]: value };
            if (refPiece) {
                if (refPiece && refPiece.userData) {
                    refPiece.userData = { ...refPiece.userData, [key]: value };
                } else {
                    refPiece.userData = { ...refPiece.userData, [key]: value };
                }
                setVersion(version+1);
            }
            return newConfig;
        });
    };
    return (
        <div style={{
            padding: "16px",
            background: "#f0f2f5",
            borderRadius: "8px",
            width: "240px",
            marginLeft: "15px"
        }}>
            <Form>
                <Form.Item label="Tabla Width">
                    <Slider
                        disabled={refPiece.userData.posicionCaja !== "top" && refPiece.userData.posicionCaja !== "bottom"}
                        min={refItem.groupRef.userData.width * 100}
                        max={refItem.groupRef.userData.width * 100 * 2}
                        value={config.width * 100}
                        onChange={(v) => updateConfig("width", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Tabla Height">
                    <Slider
                        step={1}
                        disabled={refPiece.userData.posicionCaja === "top" || refPiece.userData.posicionCaja === "bottom"}
                        min={(refItem.groupRef.userData.height - (refPiece.userData.espesor * 2)) * 100}
                        max={refItem.groupRef.userData.height * 100 * 2}
                        value={config.height * 100}
                        onChange={(v) => updateConfig("height", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Tabla Depth">
                    <Slider
                        step={1}
                        disabled={refPiece.userData.posicionCaja === "back"}
                        min={refItem.groupRef.userData.depth * 100}
                        max={refItem.groupRef.userData.depth * 100 * 2}
                        value={config.depth * 100}
                        onChange={(v) => updateConfig("depth", v / 100)}
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

export default TablaConfigContent;
