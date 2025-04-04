import {Slider, Form, Space, Checkbox, Typography, Divider, Row, Col, Card, Select} from "antd";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface.jsx";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader.jsx";
import {useEffect, useState} from "react";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";
import DraggableIntersection, {INTERSECTION_TYPES} from "./DraggableIntersection.js";

const {Title} = Typography;
import TransformControlPanel from "../../pages/TransformControlPanel.js";

const CascoInterface = ({ show, setShow, mode, setMode }) => {
    const { ref, setRef } = useSelectedItemProvider();

    // Inicializamos estados locales
    const [width, setWidth] = useState(2);
    const [height, setHeight] = useState(2);
    const [depth, setDepth] = useState(2);
    const [alturaPatas, setAlturaPatas] = useState(0.01);
    const [espesor, setEspesor] = useState(0.1);

    // Estados para los sliders UI
    const [widthSliderValue, setWidthSliderValue] = useState(200); // width * 100
    const [heightSliderValue, setHeightSliderValue] = useState(200); // height * 100
    const [depthSliderValue, setDepthSliderValue] = useState(200); // depth * 100
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


    const [disabledOptions, setDisabledOptions] = useState(false);
    const [disableSueloDentro, setDisableSueloDentro] = useState(false);

    const [enableConnectors, setEnableConnectors] = useState(true);
    const [connectionThickness, setConnectionThickness] = useState(0.1);

    const textureOptions = [
        {image: "./textures/oak.jpg", label: "Standard", value: "./textures/oak.jpg"},
        {image: "./textures/dark.jpg", label: "Dark", value: "./textures/dark.jpg"},
    ];


    const [indicePata, setIndicePata] = useState(-1);

    const patasOptions = [
        {label: "Ninguna", value: -1},
        {image: "./images/ImagenPata.png", label: "Default", value: 1},
    ];

    const [indicePuerta, setIndicePuerta] = useState(1);

    const puertaOptions = [
        {label: "Ninguna", value: -1},
        {image: "./textures/dark.jpg", label: "Default", value: 1},
    ];

    const espesorOptions = [
        {label: "10", value: 10},
        {label: "12", value: 12},
        {label: "14", value: 14},
        {label: "16", value: 16},
        {label: "18", value: 18},
        {label: "20", value: 20},
        {label: "22", value: 22},
    ]

    // Inicializar el estado compartido al cargar la interfaz
    useEffect(() => {
        const initialConfig = {
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
            texture,
            indicePata,
            indicePuerta,
            enableConnectors,
            connectionThickness,
        };

        // Solo inicializamos si no existe o está vacío
        if (!ref) {
            setRef(initialConfig);
        } else {
            // Actualizamos el estado local con los valores del ref
            const newWidth = ref.width || width;
            const newHeight = ref.height || height;
            const newDepth = ref.depth || depth;
            const newPataHeight = ref.alturaPatas || alturaPatas;
            const newEspesor = ref.espesor || espesor;
            const newEnableConnectors = ref.enableConnectors || enableConnectors;
            const newConnectionThickness = ref.connectionThickness || connectionThickness;
            const newIndicePata = ref.indicePata ?? indicePata;
            const newIndicePuerta = ref.indicePuerta ?? indicePuerta;

            setWidth(newWidth);
            setHeight(newHeight);
            setDepth(newDepth);
            setAlturaPatas(newPataHeight);
            setEspesor(newEspesor);

            setIndicePata(newIndicePata);
            setIndicePuerta(newIndicePuerta);

            setEnableConnectors(newEnableConnectors);
            setConnectionThickness(newConnectionThickness);

            // Actualizar también los valores de los sliders
            setWidthSliderValue(newWidth);
            setHeightSliderValue(newHeight);
            setDepthSliderValue(newDepth * 100);
            setPataHeightSliderValue(newPataHeight);
            setEspesorSliderValue(newEspesor * 10);

            setEsquinaXTriangulada(ref.esquinaXTriangulada || false);
            setEsquinaZTriangulada(ref.esquinaZTriangulada || false);
            setSueloDentro(ref.sueloDentro || false);
            setTechoDentro(ref.techoDentro || false);
            setRetranquearSuelo(ref.retranquearSuelo || false);
            setTraseroDentro(ref.traseroDentro !== undefined ? ref.traseroDentro : true);

            const newRetranqueoTrasero = ref.retranqueoTrasero || 0;
            setRetranqueoTrasero(newRetranqueoTrasero);
            setRetranqueoTraseroSliderValue(newRetranqueoTrasero);

            setTexture(ref.texture || texture);
        }
    }, []);

    useEffect(() => {
        if (!traseroDentro) {
            setRetranquearSuelo(false);
        }
    }, [traseroDentro])

    useEffect(() => {
        if (!ref) return;

        const updatedConfig = {
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
            enableConnectors,
            connectionThickness
        };

        setRef(updatedConfig);
    }, [
        width, height, depth, alturaPatas, espesor,
        esquinaXTriangulada, esquinaZTriangulada,
        sueloDentro, techoDentro, traseroDentro, retranqueoTrasero, texture, indicePata, retranquearSuelo, indicePuerta,
        enableConnectors,
        connectionThickness
    ]);

    // Logica para deshabilitar opciones
    useEffect(() => {
        const canUseOptions = (!esquinaXTriangulada && !esquinaZTriangulada);
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
            setDisableSueloDentro(false)
            return
        }

        setDisableSueloDentro(true);
        setSueloDentro(true);

    }, [retranquearSuelo]);


    // Limitamos el offset trasero
    useEffect(() => {
        const maxOffset = depth / 3;
        if (retranqueoTrasero > maxOffset) {
            setRetranqueoTrasero(maxOffset);
            setRetranqueoTraseroSliderValue(maxOffset);
        }
    }, [depth]);

    return (
        <BaseConfiguratorInterface title="Casco Configurator" show={show} setShow={setShow} mode={mode} setMode={setMode}>
            {/* Configuración de dimensiones */}
            <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
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
                        options={espesorOptions}
                        value={espesorSliderValue}
                        onChange={(v) => {
                            setEspesorSliderValue(v);
                            setEspesor(v / 100);
                        }}
                        />
                    </Form.Item>
                </Form>
            </div>

            <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
                <Form>
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

            {/* Configuración de textura */}
            <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
                <Form.Item label="Textura">
                    <div style={{marginTop: "10px"}}>
                        {/* Texturas predefinidas */}
                        <ItemSelector
                            options={textureOptions}
                            currentValue={texture}
                            onValueChange={setTexture}
                        />

                        {/* Carga de textura personalizada */}
                        <div style={{marginTop: "10px"}}>
                            <TextureUploader
                                onValueChange={setTexture}
                                currentValue={texture}
                                defaultTexture="./textures/oak.jpg"
                            />
                        </div>
                    </div>
                </Form.Item>
            </div>

            {/* Configuración de componentes */}
            <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
                <Form>
                    <Title level={4}>Componentes</Title>

                    <Title level={5}>Patas</Title>
                    <Form.Item>
                        <ItemSelector options={patasOptions} currentValue={indicePata}
                                      onValueChange={setIndicePata}/>
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
                        <ItemSelector options={puertaOptions} currentValue={indicePuerta}
                                      onValueChange={setIndicePuerta}/>
                    </Form.Item>
                </Form>
            </div>

            <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px", marginTop: "16px"}}>
                <Title level={4}>Intersecciones</Title>
                <Form>
                    <Form.Item label="Habilitar conectores">
                        <Checkbox
                            checked={enableConnectors}
                            onChange={(e) => setEnableConnectors(e.target.checked)}
                        />
                    </Form.Item>

                    <Form.Item label="Grosor de conexión">
                        <Slider
                            disabled={!enableConnectors}
                            min={1}
                            max={20}
                            value={connectionThickness * 100}
                            onChange={(v) => setConnectionThickness(v / 100)}
                        />
                    </Form.Item>

                    <Divider>Arrastra un conector a la escena</Divider>

                    <Row gutter={16} justify="center">
                        <Col>
                            <Card title="Conectores arrastrables" variant={"borderless"}>
                                <p>Arrastra un conector al mueble para añadir una intersección:</p>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <DraggableIntersection type={INTERSECTION_TYPES.HORIZONTAL}/>
                                </div>
                                <div style={{display: 'flex', justifyContent: 'center'}}>
                                    <DraggableIntersection type={INTERSECTION_TYPES.VERTICAL}/>
                                </div>
                                <p style={{marginTop: '10px', fontSize: '12px', color: 'gray'}}>
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