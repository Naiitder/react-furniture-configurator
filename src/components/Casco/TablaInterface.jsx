import { Form, Slider, Select } from "antd";
import { useState } from "react";

const TablaConfigContent = () => {
    const [config, setConfig] = useState({
        width: 2,
        height: 2,
        depth: 2,
        espesor: 0.1
    });

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
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
                        min={100}
                        max={500}
                        value={config.width * 100}
                        onChange={(v) => updateConfig("width", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Tabla Height">
                    <Slider
                        step={1}
                        min={100}
                        max={600}
                        value={config.height * 100}
                        onChange={(v) => updateConfig("height", v / 100)}
                    />
                </Form.Item>
                <Form.Item label="Tabla Depth">
                    <Slider
                        step={1}
                        min={100}
                        max={400}
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
