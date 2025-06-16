import { Slider, Form, Checkbox, Typography, Divider, Row, Col, Card, Select, Input, InputNumber, Tabs } from "antd";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface.jsx";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader.jsx";
import { useEffect, useState } from "react";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";

const { Title } = Typography;
const { TabPane } = Tabs;

const AparadorInterface = ({ show, setShow, mode, setMode }) => {
    const { refItem, setRefItem, version, setVersion } = useSelectedItemProvider();

    const [config, setConfig] = useState({
        width: 1.54,
        height: 0.93,
        depth: 2,
        espesor: 0.05,
        alturaPatas: 0.01,
        esquinaXTriangulada: false,
        esquinaZTriangulada: false,
        sueloDentro: false,
        techoDentro: false,
        traseroDentro: true,
        retranquearSuelo: false,
        retranqueoTrasero: 0,
        texture: "./textures/oak.jpg",
        indicePata: -1,
        indicePuerta: 1,
        seccionesHorizontales: 2,
        seccionesVerticales: 3,
        ratiosHorizontales: "2/1",
        ratiosVerticales: "1/1/1",
    });

    // Efecto para sincronizar la configuración de la interfaz
    useEffect(() => {
        if (refItem) {
            const newConfig = refItem.groupRef && refItem.groupRef.userData
                ? refItem.groupRef.userData
                : (refItem.userData || {});
            setConfig(prev => ({
                ...prev,
                ...newConfig,
            }));
        }
    }, [refItem]);

    // Función para actualizar la configuración y userData
    const updateConfig = (key, value) => {
        setConfig((prev) => {
            const newConfig = { ...prev, [key]: value };
            if (refItem) {
                if (refItem.groupRef && refItem.groupRef.userData) {
                    refItem.groupRef.userData = { ...refItem.groupRef.userData, [key]: value };
                } else {
                    refItem.userData = { ...refItem.userData, [key]: value };
                }
                setVersion(version + 1);
            }
            return newConfig;
        });
    };

    const [disabledOptions, setDisabledOptions] = useState(false);
    const [disableSueloDentro, setDisableSueloDentro] = useState(false);

    // Efecto para ajustar opciones basadas en las relaciones de esquina
    useEffect(() => {
        const canUseOptions = !config.esquinaXTriangulada && !config.esquinaZTriangulada;
        setDisabledOptions(!canUseOptions);

        if (!canUseOptions) {
            updateConfig("sueloDentro", false);
            updateConfig("techoDentro", false);
            updateConfig("traseroDentro", true);
            updateConfig("retranquearSuelo", false);
        }

        if (config.esquinaZTriangulada) {
            updateConfig("sueloDentro", false);
            updateConfig("techoDentro", true);
        }
    }, [config.esquinaXTriangulada, config.esquinaZTriangulada]);

    useEffect(() => {
        if (!config.retranquearSuelo) {
            setDisableSueloDentro(false);
            return;
        }
        setDisableSueloDentro(true);
        updateConfig("sueloDentro", true);
    }, [config.retranquearSuelo]);

    // Limitamos el offset trasero basado en la profundidad
    useEffect(() => {
        const maxOffset = config.depth / 3;
        if (config.retranqueoTrasero > maxOffset) {
            updateConfig("retranqueoTrasero", maxOffset);
        }
    }, [config.depth, config.retranqueoTrasero]);

    // Ajustar los ratios cuando cambian las secciones
    useEffect(() => {
        // Ajustar ratios horizontales
        const currentHorizontalRatios = config.ratiosHorizontales.split('/').map(Number);
        if (currentHorizontalRatios.length !== config.seccionesHorizontales) {
            const defaultRatios = Array(config.seccionesHorizontales).fill(1).join('/');
            updateConfig("ratiosHorizontales", defaultRatios);
        }

        // Ajustar ratios verticales
        const currentVerticalRatios = config.ratiosVerticales.split('/').map(Number);
        if (currentVerticalRatios.length !== config.seccionesVerticales) {
            const defaultRatios = Array(config.seccionesVerticales).fill(1).join('/');
            updateConfig("ratiosVerticales", defaultRatios);
        }
    }, [config.seccionesHorizontales, config.seccionesVerticales]);

    // Funciones para manejar los cambios en los InputNumber
    const handleHorizontalRatioChange = (index, value) => {
        const currentRatios = config.ratiosHorizontales.split('/').map(Number);
        currentRatios[index] = value || 1; // Si el valor es null, usamos 1 como predeterminado
        const newRatiosString = currentRatios.join('/');
        updateConfig("ratiosHorizontales", newRatiosString);
    };

    const handleVerticalRatioChange = (index, value) => {
        const currentRatios = config.ratiosVerticales.split('/').map(Number);
        currentRatios[index] = value || 1; // Si el valor es null, usamos 1 como predeterminado
        const newRatiosString = currentRatios.join('/');
        updateConfig("ratiosVerticales", newRatiosString);
    };

    // Estado para manejar la pestaña activa
    const [activeHorizontalTab, setActiveHorizontalTab] = useState("0");
    const [activeVerticalTab, setActiveVerticalTab] = useState("0");

    // Ajustar la pestaña activa cuando cambian las secciones
    useEffect(() => {
        if (parseInt(activeHorizontalTab) >= config.seccionesHorizontales) {
            setActiveHorizontalTab("0");
        }
    }, [config.seccionesHorizontales]);

    useEffect(() => {
        if (parseInt(activeVerticalTab) >= config.seccionesVerticales) {
            setActiveVerticalTab("0");
        }
    }, [config.seccionesVerticales]);

    // Renderizar las pestañas para secciones horizontales
    const renderHorizontalTabs = () => {
        const numSections = config.seccionesHorizontales;
        const currentRatios = config.ratiosHorizontales.split('/').map(Number);

        return (
            <Tabs
                activeKey={activeHorizontalTab}
                onChange={(key) => setActiveHorizontalTab(key)}
                style={{ marginTop: 8 }}
            >
                {Array.from({ length: numSections }).map((_, index) => (
                    <TabPane tab={`Sección ${index + 1}`} key={index.toString()}>
                        <Form.Item label={`Tamaño de Sección ${index + 1}`}>
                            <Slider
                                min={1}
                                step={0.1}
                                max={3}
                                value={currentRatios[index]}
                                onChange={(value) => handleHorizontalRatioChange(index, value)}
                                />
                        </Form.Item>
                    </TabPane>
                ))}
            </Tabs>
        );
    };

    // Renderizar las pestañas para secciones verticales
    const renderVerticalTabs = () => {
        const numSections = config.seccionesVerticales;
        const currentRatios = config.ratiosVerticales.split('/').map(Number);

        return (
            <Tabs
                activeKey={activeVerticalTab}
                onChange={(key) => setActiveVerticalTab(key)}
                style={{ marginTop: 8 }}
            >
                {Array.from({ length: numSections }).map((_, index) => (
                    <TabPane tab={`Sección ${index + 1}`} key={index.toString()}>
                        <Form.Item label={`Tamaño de Sección ${index + 1}`}>
                            <Slider
                                min={1}
                                step={0.1}
                                max={3}
                                value={currentRatios[index]}
                                onChange={(value) => handleVerticalRatioChange(index, value)}
                            />
                        </Form.Item>
                    </TabPane>
                ))}
            </Tabs>
        );
    };

    return (
        <BaseConfiguratorInterface title="Aparador Configurator" show={show} setShow={setShow} mode={mode} setMode={setMode}>
            {/* Sección de dimensiones */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form>
                    <Form.Item label="Aparador Width">
                        <Slider
                            min={50}
                            max={300}
                            value={config.width * 100}
                            onChange={(v) => updateConfig("width", v / 100)}
                        />
                    </Form.Item>
                    <Form.Item label="Aparador Height">
                        <Slider
                            step={1}
                            min={50}
                            max={200}
                            value={config.height * 100}
                            onChange={(v) => updateConfig("height", v / 100)}
                        />
                    </Form.Item>
                    <Form.Item label="Aparador Depth">
                        <Slider
                            step={1}
                            min={20}
                            max={150}
                            value={config.depth * 100}
                            onChange={(v) => updateConfig("depth", v / 100)}
                        />
                    </Form.Item>
                    <Form.Item label="Espesor">
                        <Select
                            options={[
                                { label: "2", value: 2 },
                                { label: "3", value: 3 },
                                { label: "5", value: 5 },
                                { label: "7", value: 7 },
                                { label: "10", value: 10 },
                                { label: "12", value: 12 },
                                { label: "14", value: 14 },
                            ]}
                            value={config.espesor * 100}
                            onChange={(v) => updateConfig("espesor", v / 100)}
                        />
                    </Form.Item>
                </Form>
            </div>

            {/* Sección de opciones adicionales */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px", marginTop: "16px" }}>
                <Form>
                    <Title level={4}>Opciones</Title>
                    <Form.Item label="45º X">
                        <Checkbox
                            checked={config.esquinaXTriangulada}
                            onChange={(e) => updateConfig("esquinaXTriangulada", e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="45º Z">
                        <Checkbox
                            checked={config.esquinaZTriangulada}
                            onChange={(e) => updateConfig("esquinaZTriangulada", e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Suelo dentro">
                        <Checkbox
                            disabled={disabledOptions || disableSueloDentro}
                            checked={config.sueloDentro}
                            onChange={(e) => updateConfig("sueloDentro", e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Techo dentro">
                        <Checkbox
                            disabled={disabledOptions}
                            checked={config.techoDentro}
                            onChange={(e) => updateConfig("techoDentro", e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Trasero dentro">
                        <Checkbox
                            disabled={disabledOptions}
                            checked={config.traseroDentro}
                            onChange={(e) => updateConfig("traseroDentro", e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Retranquear suelo">
                        <Checkbox
                            disabled={!config.traseroDentro || disabledOptions}
                            checked={config.retranquearSuelo}
                            onChange={(e) => updateConfig("retranquearSuelo", e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Retranqueo Trasero">
                        <Slider
                            step={0.1}
                            disabled={!config.traseroDentro}
                            min={0}
                            max={config.depth * 100 / 3}
                            value={config.retranqueoTrasero * 100}
                            onChange={(v) => updateConfig("retranqueoTrasero", v / 100)}
                        />
                    </Form.Item>
                </Form>
            </div>

            {/* Sección de Texturas */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px", marginTop: "16px" }}>
                <Form.Item label="Textura">
                    <div style={{ marginTop: "10px" }}>
                        <ItemSelector
                            options={[
                                { image: "./textures/oak.jpg", label: "Standard", value: "./textures/oak.jpg" },
                                { image: "./textures/dark.jpg", label: "Dark", value: "./textures/dark.jpg" },
                            ]}
                            currentValue={config.texture}
                            onValueChange={(v) => updateConfig("texture", v)}
                        />
                        <div style={{ marginTop: "10px" }}>
                            <TextureUploader
                                onValueChange={(v) => updateConfig("texture", v)}
                                currentValue={config.texture}
                                defaultTexture="./textures/oak.jpg"
                            />
                        </div>
                    </div>
                </Form.Item>
            </div>

            {/* Sección de Componentes (Patas y Puertas) */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px", marginTop: "16px" }}>
                <Form>
                    <Title level={4}>Componentes</Title>
                    <Title level={5}>Patas</Title>
                    <Form.Item>
                        <ItemSelector
                            options={[
                                { label: "Ninguna", value: -1 },
                                { image: "./images/ImagenPata.png", label: "Default", value: 1 },
                            ]}
                            currentValue={config.indicePata}
                            onValueChange={(v) => updateConfig("indicePata", v)}
                        />
                        <Form.Item label="Patas Height">
                            <Slider
                                disabled={config.indicePata === -1}
                                min={1}
                                max={15}
                                value={config.alturaPatas * 100}
                                onChange={(v) => updateConfig("alturaPatas", v / 100)}
                            />
                        </Form.Item>
                    </Form.Item>

                    <Title level={5}>Puertas</Title>
                    <Form.Item>
                        <ItemSelector
                            options={[
                                { label: "Ninguna", value: -1 },
                                { image: "./textures/dark.jpg", label: "Default", value: 1 },
                            ]}
                            currentValue={config.indicePuerta}
                            onValueChange={(v) => updateConfig("indicePuerta", v)}
                        />
                    </Form.Item>
                </Form>
            </div>

            {/* Sección de Intersecciones */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px", marginTop: "16px", maxWidth: "260px" }}>
                <Title level={4}>Secciones</Title>
                <Form>
                    <Form.Item label="Secciones Horizontales">
                        <Slider
                            step={1}
                            min={1}
                            max={6}
                            value={config.seccionesHorizontales}
                            onChange={(v) => updateConfig("seccionesHorizontales", v)}
                        />
                    </Form.Item>
                    {config.seccionesHorizontales > 1 && (
                        <div style={{ marginBottom: 16 }}>
                            <Title level={5} style={{ marginBottom: 8 }}>
                                Tamaños de Secciones Horizontales
                            </Title>
                            {renderHorizontalTabs()}
                        </div>
                    )}
                    <Divider />
                    <Form.Item label="Secciones Verticales">
                        <Slider
                            step={1}
                            min={1}
                            max={6}
                            value={config.seccionesVerticales}
                            onChange={(v) => updateConfig("seccionesVerticales", v)}
                        />
                    </Form.Item>
                    {config.seccionesVerticales > 1 && (
                        <div style={{ marginBottom: 16 }}>
                            <Title level={5} style={{ marginBottom: 8 }}>
                                Tamaños de Secciones Verticales
                            </Title>
                            {renderVerticalTabs()}
                        </div>
                    )}
                </Form>
            </div>
        </BaseConfiguratorInterface>
    );
};

export default AparadorInterface;