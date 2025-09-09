import { Form, Slider, Select } from "antd";
import {useEffect, useState} from "react";
import {useSelectedPieceProvider} from "../../contexts/SelectedPieceProvider.jsx";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";

const InterseccionConfigContent = () => {
    const { refPiece, setRefPiece, version, setVersion} = useSelectedPieceProvider();
    const {refItem } = useSelectedItemProvider();

    const [config, setConfig] = useState({
        positionExtra: [0,0,0],
        widthExtra: 0,
        heightExtra: 0,
        depthExtra: 0,
        espesor: 0.1,
        interseccion: {},
        orientation: "vertical" | "horizontal",
    });

    const shallowEqual = (a,b) => {
        for (const k in a) if (a[k] !== b[k]) return false;
        for (const k in b) if (!(k in a)) return false;
        return true;
    };

    useEffect(() => {
        if (!refPiece) return;
        const ud = refPiece.userData || {};
        const next = {
            positionExtra: ud.positionExtra ?? [0,0,0],
            widthExtra: ud.widthExtra ?? 0,
            heightExtra: ud.heightExtra ?? 0,
            depthExtra: ud.depthExtra ?? 0,
            espesor: ud.espesor ?? 0.1,
            interseccion: ud.interseccion ?? {},
            orientation: ud.orientation ?? "horizontal",
        };
        setConfig(prev => shallowEqual(prev, next) ? prev : next);
    }, [refPiece, version]);

    console.log(config);

    // Función unificada para actualizar la configuración y modificar también el userData
    // dentro de refItem.groupRef (o refItem.userData si no existe groupRef)
    const updateConfig = (key, value) => {
        setConfig((prev) => {
            const newConfig = { ...prev, [key]: value };

            if (refPiece && refPiece.userData) {
                refPiece.userData[key] = value;
            }

            requestAnimationFrame(() => {
                setVersion((v) => v + 1);
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
                <Form.Item label="Position X: ">
                    <Slider
                        step={0.01}
                        min={Number(((config.interseccion?.adyacentLeft?.point?.[0] ?? 0)).toFixed(3))}
                        max={Number(((config.interseccion?.adyacentRight?.point?.[0] ?? 1)).toFixed(3))}
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
                        min={Number(((config.interseccion?.adyacentBottom?.point?.[1] ?? 0)).toFixed(3))}
                        max={Number(((config.interseccion?.adyacentTop?.point?.[1] ?? 1)).toFixed(3))}
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
