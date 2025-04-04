import {Slider, Form, Space, Checkbox, Typography} from "antd";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface.jsx";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader.jsx";
import {useEffect, useState} from "react";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";

const {Title} = Typography;

const CascoInterface = () => {
    const {ref, setRef} = useSelectedItemProvider();

    // Inicializamos estados locales
    const [width, setWidth] = useState(2);
    const [height, setHeight] = useState(2);
    const [depth, setDepth] = useState(2);
    const [alturaPatas, setAlturaPatas] = useState(0.01);
    const [espesor, setEspesor] = useState(0.2);

    // Estados para los sliders UI
    const [widthSliderValue, setWidthSliderValue] = useState(200); // width * 100
    const [heightSliderValue, setHeightSliderValue] = useState(200); // height * 100
    const [depthSliderValue, setDepthSliderValue] = useState(200); // depth * 100
    const [pataHeightSliderValue, setPataHeightSliderValue] = useState(1);
    const [espesorSliderValue, setEspesorSliderValue] = useState(20);
    const [retranqueoTraseroSliderValue, setRetranqueoTraseroSliderValue] = useState(0);

    const [esquinaXTriangulada, setEsquinaXTriangulada] = useState(false);
    const [esquinaZTriangulada, setEsquinaZTriangulada] = useState(false);
    const [sueloDentro, setSueloDentro] = useState(false);
    const [techoDentro, setTechoDentro] = useState(false);
    const [traseroDentro, setTraseroDentro] = useState(true);
    const [retranquearSuelo, setRetranquarSuelo] = useState(false);
    const [retranqueoTrasero, setRetranqueoTrasero] = useState(0);
    const [texture, setTexture] = useState("./textures/oak.jpg");


    const [disabledOptions, setDisabledOptions] = useState(false);
    const [disableSueloDentro, setDisableSueloDentro] = useState(false);

    const textureOptions = [
        {image: "./textures/oak.jpg", label: "Standard", value: "./textures/oak.jpg"},
        {image: "./textures/dark.jpg", label: "Dark", value: "./textures/dark.jpg"},
    ];


    const [indicePata, setIndicePata] = useState(-1);

    const patasOptions = [
        {label: "Ninguna", value: -1},
        {image: "./textures/dark.jpg", label: "Default", value: 1},
    ];

    const [indicePuerta, setIndicePuerta] = useState(-1);

    const puertaOptions = [
        {label: "Ninguna", value: -1},
        {image: "./textures/dark.jpg", label: "Default", value: 1},
    ];

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
            const newIndicePata = ref.indicePata ?? indicePata;
            const newIndicePuerta = ref.indicePuerta ?? indicePuerta;

            setWidth(newWidth);
            setHeight(newHeight);
            setDepth(newDepth);
            setAlturaPatas(newPataHeight);
            setEspesor(newEspesor);

            setIndicePata(newIndicePata);
            setIndicePuerta(newIndicePuerta);

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
            setRetranquarSuelo(ref.retranquearSuelo || false);
            setTraseroDentro(ref.traseroDentro !== undefined ? ref.traseroDentro : true);

            const newRetranqueoTrasero = ref.retranqueoTrasero || 0;
            setRetranqueoTrasero(newRetranqueoTrasero);
            setRetranqueoTraseroSliderValue(newRetranqueoTrasero);

            setTexture(ref.texture || texture);
        }
    }, []);

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
        };

        setRef(updatedConfig);
    }, [
        width, height, depth, alturaPatas, espesor,
        esquinaXTriangulada, esquinaZTriangulada,
        sueloDentro, techoDentro, traseroDentro, retranqueoTrasero, texture, indicePata, retranquearSuelo, indicePuerta
    ]);

    // Logica para deshabilitar opciones
    useEffect(() => {
        const canUseOptions = (!esquinaXTriangulada && !esquinaZTriangulada);
        setDisabledOptions(!canUseOptions);

        if (!canUseOptions) {
            setSueloDentro(false);
            setTechoDentro(false);
            setTraseroDentro(true);
            setRetranquarSuelo(false);
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
        <BaseConfiguratorInterface title="Casco Configurator">
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
                        <Slider
                            min={2}
                            max={20}
                            step={0.1}
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
                            disabled={disabledOptions}
                            checked={retranquearSuelo}
                            onChange={(e) => setRetranquarSuelo(e.target.checked)}
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
                        <ItemSelector options={patasOptions} currentValue={indicePata} onValueChange={setIndicePata}/>
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

        </BaseConfiguratorInterface>
    );
};

export default CascoInterface;