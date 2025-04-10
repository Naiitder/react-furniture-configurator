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

    // Estados locales para configuración del Casco
    const [width, setWidth] = useState(2);
    const [height, setHeight] = useState(2);
    const [depth, setDepth] = useState(2);
    const [alturaPatas, setAlturaPatas] = useState(0.01);
    const [espesor, setEspesor] = useState(0.1);

    const [widthSliderValue, setWidthSliderValue] = useState(200);
    const [heightSliderValue, setHeightSliderValue] = useState(200);
    const [depthSliderValue, setDepthSliderValue] = useState(200);
    const [pataHeightSliderValue, setPataHeightSliderValue] = useState(1);
    const [espesorSliderValue, setEspesorSliderValue] = useState(10);
    const [retranqueoTraseroSliderValue, setRetranqueoTraseroSliderValue] = useState(0);

    const [esquinaXTriangulada, setEsquinaXTriangulada] = useState(false);
    const [esquinaZTriangulada, setEsquinaZTriangulada] = useState(false);
    const [sueloDentro, setSueloDentro] = useState(false);
    const [techoDentro, setTechoDentro] = useState(false);
    const [traseroDentro, setTraseroDentro] = useState(true);
    const [retranquearSuelo, setRetranquearSuelo] = useState(false);
    const [retranqueoTrasero, setRetranqueoTrasero] = useState(0);
    const [texture, setTexture] = useState("./textures/oak.jpg");

    const [indicePata, setIndicePata] = useState(-1);
    const [indicePuerta, setIndicePuerta] = useState(1);

    const [disabledOptions, setDisabledOptions] = useState(false);
    const [disableSueloDentro, setDisableSueloDentro] = useState(false);

    // Efecto para sincronizar la interfaz con el refItem actual
    useEffect(() => {
        if (refItem) {
            // Usar refItem.userData si existe, de lo contrario el objeto mismo
            const config = refItem.userData ? refItem.userData : refItem;

            setWidth(config.width || 2);
            setHeight(config.height || 2);
            setDepth(config.depth || 2);
            setAlturaPatas(config.alturaPatas || 0.01);
            setEspesor(config.espesor || 0.1);

            setWidthSliderValue((config.width || 2) * 100);
            setHeightSliderValue((config.height || 2) * 100);
            setDepthSliderValue((config.depth || 2) * 100);
            setPataHeightSliderValue(config.alturaPatas ? config.alturaPatas * 100 : 1);
            setEspesorSliderValue((config.espesor || 0.1) * 10);
            setRetranqueoTraseroSliderValue(config.retranqueoTrasero || 0);

            setEsquinaXTriangulada(config.esquinaXTriangulada || false);
            setEsquinaZTriangulada(config.esquinaZTriangulada || false);
            setSueloDentro(config.sueloDentro || false);
            setTechoDentro(config.techoDentro || false);
            setRetranquearSuelo(config.retranquearSuelo || false);
            setTraseroDentro(config.traseroDentro !== undefined ? config.traseroDentro : true);
            setRetranqueoTrasero(config.retranqueoTrasero || 0);
            setTexture(config.texture || "./textures/oak.jpg");

            setIndicePata(config.indicePata ?? -1);
            setIndicePuerta(config.indicePuerta ?? 1);
        }
    }, [refItem]);

    // Efecto para actualizar el objeto de configuración (refItem) cuando la interfaz cambia
    useEffect(() => {
        if (!refItem || !(refItem instanceof THREE.Object3D)) return;
        // Obtiene la configuración actual (ya sea desde userData o el propio objeto)
        const currentConfig = refItem.userData ? refItem.userData : refItem;

        // Crea el objeto de configuración nuevo con los estados locales
        const newConfig = {
            width,
            height,
            depth,
            espesor,
            esquinaXTriangulada,
            esquinaZTriangulada,
            sueloDentro,
            techoDentro,
            traseroDentro,
            retranqueoTrasero,
            retranquearSuelo,
            texture,
            indicePata,
            alturaPatas,
            indicePuerta,
        };

        // Verifica si alguno de los valores ha cambiado
        const hasChanged = Object.keys(newConfig).some(
            (key) => newConfig[key] !== currentConfig[key]
        );
        if (!hasChanged) return; // Si no hay cambios, finaliza el efecto


        Object.assign(refItem.userData, newConfig);
    }, [
        width,
        height,
        depth,
        espesor,
        esquinaXTriangulada,
        esquinaZTriangulada,
        sueloDentro,
        techoDentro,
        traseroDentro,
        retranqueoTrasero,
        retranquearSuelo,
        texture,
        indicePata,
        alturaPatas,
        indicePuerta,
    ]);

    // Actualizar la interfaz cuando las dimensiones controladas por TransformControls cambien
    useEffect(() => {
        setWidth(scaleDimensions.x);
        setWidthSliderValue(scaleDimensions.x * 100);
        setHeight(scaleDimensions.y);
        setHeightSliderValue(scaleDimensions.y * 100);
        setDepth(scaleDimensions.z);
        setDepthSliderValue(scaleDimensions.z * 100);
    }, [scaleDimensions]);

    // Lógica para deshabilitar opciones según relaciones de esquina
    useEffect(() => {
        const canUseOptions = !esquinaXTriangulada && !esquinaZTriangulada;
        setDisabledOptions(!canUseOptions);

        if (!canUseOptions) {
            setSueloDentro(false);
            setTechoDentro(false);
            setTraseroDentro(true);
            setRetranquearSuelo(false);
        }

        if (esquinaZTriangulada) {
            setSueloDentro(false);
            setTechoDentro(true);
        }
    }, [esquinaXTriangulada, esquinaZTriangulada]);

    useEffect(() => {
        if (!retranquearSuelo) {
            setDisableSueloDentro(false);
            return;
        }
        setDisableSueloDentro(true);
        setSueloDentro(true);
    }, [retranquearSuelo]);

    // Limitamos el offset trasero basado en la profundidad
    useEffect(() => {
        const maxOffset = depth / 3;
        if (retranqueoTrasero > maxOffset) {
            setRetranqueoTrasero(maxOffset);
            setRetranqueoTraseroSliderValue(maxOffset);
        }
    }, [depth]);

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
                            value={widthSliderValue}
                            onChange={(v) => {
                                setWidthSliderValue(v);
                                setWidth(v / 100);
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="Casco Height">
                        <Slider
                            step={1}
                            min={100}
                            max={600}
                            value={heightSliderValue}
                            onChange={(v) => {
                                setHeightSliderValue(v);
                                setHeight(v / 100);
                            }}
                        />
                    </Form.Item>
                    <Form.Item label="Casco Depth">
                        <Slider
                            step={1}
                            min={100}
                            max={400}
                            value={depthSliderValue}
                            onChange={(v) => {
                                setDepthSliderValue(v);
                                setDepth(v / 100);
                            }}
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
                            value={espesorSliderValue}
                            onChange={(v) => {
                                setEspesorSliderValue(v);
                                setEspesor(v / 100);
                            }}
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
                            checked={esquinaXTriangulada}
                            onChange={(e) => setEsquinaXTriangulada(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="45º Z">
                        <Checkbox
                            checked={esquinaZTriangulada}
                            onChange={(e) => setEsquinaZTriangulada(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Suelo dentro">
                        <Checkbox
                            disabled={disabledOptions || disableSueloDentro}
                            checked={sueloDentro}
                            onChange={(e) => setSueloDentro(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Techo dentro">
                        <Checkbox
                            disabled={disabledOptions}
                            checked={techoDentro}
                            onChange={(e) => setTechoDentro(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Trasero dentro">
                        <Checkbox
                            disabled={disabledOptions}
                            checked={traseroDentro}
                            onChange={(e) => setTraseroDentro(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Retranquear suelo">
                        <Checkbox
                            disabled={!traseroDentro || disabledOptions}
                            checked={retranquearSuelo}
                            onChange={(e) => setRetranquearSuelo(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Retranqueo Trasero">
                        <Slider
                            step={0.1}
                            disabled={!traseroDentro}
                            min={0}
                            max={depthSliderValue / 5}
                            value={retranqueoTraseroSliderValue}
                            onChange={(v) => {
                                setRetranqueoTraseroSliderValue(v);
                                setRetranqueoTrasero(v / 100);
                            }}
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
                            currentValue={texture}
                            onValueChange={setTexture}
                        />
                        <div style={{ marginTop: "10px" }}>
                            <TextureUploader
                                onValueChange={setTexture}
                                currentValue={texture}
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
                            currentValue={indicePata}
                            onValueChange={setIndicePata}
                        />
                        <Form.Item label="Patas Height">
                            <Slider
                                disabled={indicePata === -1}
                                min={1}
                                max={15}
                                value={pataHeightSliderValue}
                                onChange={(v) => {
                                    setPataHeightSliderValue(v);
                                    setAlturaPatas(v / 100);
                                }}
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
                            currentValue={indicePuerta}
                            onValueChange={setIndicePuerta}
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