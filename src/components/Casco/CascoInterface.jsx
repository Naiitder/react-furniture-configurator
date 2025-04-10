import { Slider, Form, Checkbox, Typography, Divider, Row, Col, Card, Select } from "antd";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface.jsx";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader.jsx";
import { useEffect, useState } from "react";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import DraggableIntersection, { INTERSECTION_TYPES } from "./DraggableIntersection.js";
import * as THREE from "three";

const { Title } = Typography;

const CascoInterface = ({ show, setShow, mode, setMode, scaleDimensions = { x: 1, y: 1, z: 1 } }) => {
    const { refItem, setRefItem } = useSelectedItemProvider();

    const [config, setConfig] = useState({
        width: 2,
        height: 2,
        depth: 2,
        espesor: 0.1,
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
    });

    useEffect(() => {
        if (refItem && refItem.userData) {
            setConfig({ ...refItem.userData });
        }
    }, [refItem]);

    useEffect(() => {
        if (!refItem || !(refItem instanceof THREE.Object3D)) return;
        refItem.userData = { ...config };
    }, [config]);
    const updateConfig = (key, value) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const [disabledOptions, setDisabledOptions] = useState(false);
    const [disableSueloDentro, setDisableSueloDentro] = useState(false);

    // Efecto para sincronizar la interfaz con el refItem actual
    useEffect(() => {
        if (refItem) {
            // Usar refItem.groupRef si existe, de lo contrario el objeto mismo
            const newConfig = refItem.groupRef ? refItem.groupRef : refItem;

            updateConfig("width", newConfig.width || config.width);
            updateConfig("height", newConfig.height || 2);
            updateConfig("depth", newConfig.depth || 2);
            updateConfig("alturaPatas", newConfig.alturaPatas || 0.01);
            updateConfig("espesor", newConfig.espesor || 0.1);
            updateConfig("esquinaXTriangulada", newConfig.esquinaXTriangulada || false);
            updateConfig("esquinaZTriangulada", newConfig.esquinaZTriangulada || false);
            updateConfig("sueloDentro", newConfig.sueloDentro || false);
            updateConfig("techoDentro", newConfig.techoDentro || false);
            updateConfig("retranquearSuelo", newConfig.retranquearSuelo || false);
            updateConfig("traseroDentro", newConfig.traseroDentro !== undefined ? newConfig.traseroDentro : true);
            updateConfig("retranqueoTrasero", newConfig.retranqueoTrasero || 0);
            updateConfig("texture", newConfig.texture || "./textures/oak.jpg");
            updateConfig("indicePata", newConfig.indicePata ?? -1);
            updateConfig("indicePuerta", newConfig.indicePuerta ?? 1);
        }
    }, [refItem]);

    // Efecto para actualizar el objeto de configuración (refItem) cuando la interfaz cambia
    useEffect(() => {
        if (!refItem || !(refItem instanceof THREE.Object3D)) return;
        refItem.groupRef = { ...config };
    }, [config]);

    // Actualizar la interfaz cuando las dimensiones controladas por TransformControls cambien

    // Lógica para deshabilitar opciones según relaciones de esquina
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

    return (
        <BaseConfiguratorInterface title="Casco Configurator" show={show} setShow={setShow} mode={mode}
                                   setMode={setMode}>
            {/* Sección de dimensiones */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form>
                    <Form.Item label="Casco Width">
                        <Slider
                            min={100}
                            max={500}
                            value={config.width * 100}
                            onChange={(v) => updateConfig("width", v / 100)}
                        />
                    </Form.Item>
                    <Form.Item label="Casco Height">
                        <Slider
                            step={1}
                            min={100}
                            max={600}
                            value={config.height * 100}
                            onChange={(v) => updateConfig("height", v / 100)}
                        />
                    </Form.Item>
                    <Form.Item label="Casco Depth">
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

            {/* Sección de opciones adicionales */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px", marginTop: "16px" }}>
                <Form>
                    <Title level={4}>Opciones</Title>
                    <Form.Item label="45º X">
                        <Checkbox
                            checked={config.esquinaXTriangulada}
                            onChange={(e) => updateConfig("esquinaXTriangulada", e.target.checked)}                        />
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
                            max={config.retranqueoTrasero / 5}
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
        </BaseConfiguratorInterface>
    );
};

export default CascoInterface;