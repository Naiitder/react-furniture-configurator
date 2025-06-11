import { Slider, Form, Checkbox, Typography, Divider, Row, Col, Card, Select, Tabs } from "antd";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface.jsx";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader.jsx";
import { useEffect, useState } from "react";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import DraggableIntersection, { INTERSECTION_TYPES } from "../Casco/DraggableIntersection.js";

const { Title } = Typography;

const ArmarioInterface = ({ show, setShow, mode, setMode }) => {
    const { refItem, setRefItem, version, setVersion } = useSelectedItemProvider();

    const [config, setConfig] = useState({
        width: 1.54,
        height: 0.93,
        depth: 2,
        espesor: 0.02,
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
        cajonesHorizontales: 2,
        cajonesVerticales: 3,
        ratiosHorizontales: "1/1",
        ratiosVerticales: "1/1",
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
        if (currentHorizontalRatios.length !== config.cajonesHorizontales) {
            const defaultRatios = Array(config.cajonesHorizontales).fill(1).join('/');
            updateConfig("ratiosHorizontales", defaultRatios);
        }

        // Ajustar ratios verticales
        const currentVerticalRatios = config.ratiosVerticales.split('/').map(Number);
        if (currentVerticalRatios.length !== config.cajonesVerticales) {
            const defaultRatios = Array(config.cajonesVerticales).fill(1).join('/');
            updateConfig("ratiosVerticales", defaultRatios);
        }
    }, [config.cajonesHorizontales, config.cajonesVerticales]);

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
        if (parseInt(activeHorizontalTab) >= config.cajonesHorizontales) {
            setActiveHorizontalTab("0");
        }
    }, [config.cajonesHorizontales]);

    useEffect(() => {
        if (parseInt(activeVerticalTab) >= config.cajonesVerticales) {
            setActiveVerticalTab("0");
        }
    }, [config.cajonesVerticales]);

    // Renderizar las pestañas para secciones horizontales
    const renderHorizontalTabs = () => {
        const num = config.cajonesHorizontales;
        const ratios = config.ratiosHorizontales.split("/").map(Number);

        const items = Array.from({ length: num }).map((_, i) => ({
            key: i.toString(),
            label: `Sección ${i + 1}`,
            children: (
                <Form.Item label={`Tamaño de Sección ${i + 1}`}>
                    <Slider
                        min={1}
                        max={3}
                        step={0.1}
                        value={ratios[i]}
                        onChange={v => handleHorizontalRatioChange(i, v)}
                    />
                </Form.Item>
            ),
        }));

        return (
            <Tabs
                activeKey={activeHorizontalTab}
                onChange={setActiveHorizontalTab}
                items={items}
                style={{ marginTop: 8 }}
            />
        );
    };

    // Renderizar las pestañas para secciones verticales
    const renderVerticalTabs = () => {
        const num = config.cajonesVerticales;
        const ratios = config.ratiosVerticales.split("/").map(Number);

        const items = Array.from({ length: num }).map((_, i) => ({
            key: i.toString(),
            label: `Sección ${i + 1}`,
            children: (
                <Form.Item label={`Tamaño de Sección ${i + 1}`}>
                    <Slider
                        min={1}
                        max={3}
                        step={0.1}
                        value={ratios[i]}
                        onChange={v => handleVerticalRatioChange(i, v)}
                    />
                </Form.Item>
            ),
        }));

        return (
            <Tabs
                activeKey={activeVerticalTab}
                onChange={setActiveVerticalTab}
                items={items}
                style={{ marginTop: 8 }}
            />
        );
    };

    return (
        <BaseConfiguratorInterface title="Armario Configurator" show={show} setShow={setShow} mode={mode} setMode={setMode}>
            {/* Sección de dimensiones */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form>
                    <Form.Item label="Armario Width">
                        <Slider
                            min={50}
                            max={300}
                            value={config.width * 100}
                            onChange={(v) => updateConfig("width", v / 100)}
                        />
                    </Form.Item>
                    <Form.Item label="Armario Height">
                        <Slider
                            step={1}
                            min={50}
                            max={200}
                            value={config.height * 100}
                            onChange={(v) => updateConfig("height", v / 100)}
                        />
                    </Form.Item>
                    <Form.Item label="Armario Depth">
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
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px", marginTop: "16px" }}>
                <Title level={4}>Intersecciones</Title>
                <Form>
                    <Divider>Arrastra un conector a la escena</Divider>
                    <Row gutter={16} justify="center">
                        <Col>
                            <Card title="Conectores arrastrables" variant={"borderless"}>
                                <p>Arrastra un conector al mueble para añadir una intersección:</p>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <DraggableIntersection type={INTERSECTION_TYPES.HORIZONTAL} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <DraggableIntersection type={INTERSECTION_TYPES.VERTICAL} />
                                </div>
                                <p style={{ marginTop: '10px', fontSize: '12px', color: 'gray' }}>
                                    Suelta el conector sobre el objeto para crear una conexión.
                                </p>
                            </Card>
                        </Col>
                    </Row>
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
                            value={config.cajonesHorizontales}
                            onChange={(v) => updateConfig("cajonesHorizontales", v)}
                        />
                    </Form.Item>
                    {config.cajonesHorizontales > 1 && (
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
                            value={config.cajonesVerticales}
                            onChange={(v) => updateConfig("cajonesVerticales", v)}
                        />
                    </Form.Item>
                    {config.cajonesVerticales > 1 && (
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

export default ArmarioInterface;