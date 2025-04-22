import { Form, Slider, Select } from "antd";
import {useEffect, useState} from "react";
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider.jsx";

const TablaConfigContent = ({ setNeedsSnapshot }) => {
    const { refPiece, setRefPiece, version, setVersion} = useSelectedPieceProvider();

    const [config, setConfig] = useState({
        widthExtra: 0,
        heightExtra: 0,
        depthExtra: 0,
        espesor: 0.1
    });

    useEffect(() => {
        if (refPiece) {
            const newConfig = refPiece && refPiece.userData
                ? refPiece.userData
                : (refPiece.userData || {});
            setConfig(prev => ({
                ...prev,
                ...newConfig,
            }));
        }
    }, [refPiece, version]);

    const updateConfig = (key, value) => {
        setConfig((prev) => {
            const newConfig = { ...prev, [key]: value };
            if (refPiece && refPiece.userData) {
                refPiece.userData[key] = value;
            }
            console.log(`Configuración de tabla actualizada (${key}: ${value}), activando snapshot`); // Depuración
            requestAnimationFrame(() => {
                setVersion((v) => v + 1);
                setNeedsSnapshot(true);
            });
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
                        min={0}
                        max={30}
                        value={config.widthExtra * 100}
                        onChange={(v) => updateConfig("widthExtra", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Tabla Height">
                    <Slider
                        step={1}
                        min={0}
                        max={20}
                        value={config.heightExtra * 100}
                        onChange={(v) => updateConfig("heightExtra", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Tabla Depth">
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

export default TablaConfigContent;
