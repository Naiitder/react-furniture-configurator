import { Form, Slider, Select } from "antd";
import {useEffect, useState} from "react";
import ItemSelector from "../ItemSelector.jsx";
import {useSelectedCajonProvider} from "../../contexts/SelectedCajonProvider.jsx";

const CajonConfigContent = () => {
    const { refCajon, setRefCajon, versionCajon, setVersionCajon} = useSelectedCajonProvider();

    const [config, setConfig] = useState({
        cajon: 1,
    });

    useEffect(() => {
        if (refCajon) {

            console.log(refCajon);
            const newConfig = refCajon && refCajon.userData
                ? refCajon.userData
                : (refCajon.userData || {});
            console.log(refCajon.userData);
            setConfig(prev => ({
                ...prev,
                ...newConfig,
            }));
        }
    }, [refCajon, versionCajon]);

    // Función unificada para actualizar la configuración y modificar también el userData
    // dentro de refItem.groupRef (o refItem.userData si no existe groupRef)
    const updateConfig = (key, value) => {
        setConfig((prev) => {
            const newConfig = { ...prev, [key]: value };

            // Solo actualiza refPiece fuera del render
            if (refCajon && refCajon.userData) {
                refCajon.userData[key] = value;
            }

            // Asegura que el re-render ocurra correctamente
            requestAnimationFrame(() => {
                setVersionCajon((v) => v + 1);
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
                <Form.Item label="Tipo">
                    <div style={{ marginTop: "10px" }}>
                        <ItemSelector
                            options={[
                                { label: "Transparente", value: -1 },
                                { image: "./textures/dark.jpg", label: "Default", value: 0 },
                                { image: "./textures/oak.jpg", label: "Oak", value: 1 },
                            ]}
                            currentValue={config.cajon}
                            onValueChange={(v) => updateConfig("cajon", v)}
                        />
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CajonConfigContent;
