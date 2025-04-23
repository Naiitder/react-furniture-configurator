import { Slider, Form, Checkbox, Typography, Divider, Row, Col, Card, Select } from "antd";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface.jsx";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader.jsx";
import { useEffect, useState } from "react";
import { useSelectedItemProvider } from "../../contexts/SelectedItemProvider.jsx";
import DraggableIntersection, { INTERSECTION_TYPES } from "../Casco/DraggableIntersection.js";
import * as THREE from "three";

const { Title } = Typography;

const AparadorInterface = ({ show, setShow, mode, setMode}) => {
    const { refItem, setRefItem, version, setVersion } = useSelectedItemProvider();

    const [config, setConfig] = useState({
        width: 1.54,
        height: .93,
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
    });

    // Efecto para sincronizar la configuración de la interfaz:
    // Si existe refItem.groupRef.userData, se toma esa información.
    useEffect(() => {
        if (refItem) {
            // Se prioriza refItem.groupRef.userData, si existe
            const newConfig = refItem.groupRef && refItem.groupRef.userData
                ? refItem.groupRef.userData
                : (refItem.userData || {});
            console.log(refItem.groupRef.userData);
            setConfig(prev => ({
                ...prev,
                ...newConfig,
            }));
        }
    }, [refItem]);

    // Función unificada para actualizar la configuración y modificar también el userData
    // dentro de refItem.groupRef (o refItem.userData si no existe groupRef)
    const updateConfig = (key, value) => {
        setConfig((prev) => {
            const newConfig = { ...prev, [key]: value };
            if (refItem) {
                if (refItem.groupRef && refItem.groupRef.userData) {
                    refItem.groupRef.userData = { ...refItem.groupRef.userData, [key]: value };
                } else {
                    refItem.userData = { ...refItem.userData, [key]: value };
                }
                setVersion(version+1);
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
                            max={config.depth*100/3}
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
                    <Form.Item label="Secciones Verticales">
                        <Slider
                            step={1}
                            min={1}
                            max={6}
                            value={config.seccionesVerticales}
                            onChange={(v) => updateConfig("seccionesVerticales", v)}
                        />
                    </Form.Item>
                </Form>
            </div>
        </BaseConfiguratorInterface>
    );
};

export default AparadorInterface;