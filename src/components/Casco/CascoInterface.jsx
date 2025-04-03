import {Slider, Form, Space, Checkbox} from "antd";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface.jsx";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader.jsx";
import {useEffect, useState} from "react";
import {useSelectedItemProvider} from "../../contexts/SelectedItemProvider.jsx";

const CascoInterface = () => {
    const { ref, setRef } = useSelectedItemProvider();

    // Inicializamos estados locales
    const [width, setWidth] = useState(2);
    const [height, setHeight] = useState(2);
    const [depth, setDepth] = useState(2);
    const [pataHeight, setPataHeight] = useState(1);
    const [espesor, setEspesor] = useState(0.1);
    const [esquinaXTriangulada, setEsquinaXTriangulada] = useState(false);
    const [esquinaZTriangulada, setEsquinaZTriangulada] = useState(false);
    const [sueloDentro, setSueloDentro] = useState(false);
    const [techoDentro, setTechoDentro] = useState(false);
    const [traseroDentro, setTraseroDentro] = useState(true);
    const [offsetTrasero, setOffsetTrasero] = useState(0);
    const [texture, setTexture] = useState("./textures/oak.jpg");
    const [disabledOptions, setDisabledOptions] = useState(false);

    const textureOptions = [
        {image: "./textures/oak.jpg", label: "Standard", value: "./textures/oak.jpg"},
        {image: "./textures/dark.jpg", label: "Dark", value: "./textures/dark.jpg"},
    ];

    // Inicializar el estado compartido al cargar la interfaz
    useEffect(() => {
        const initialConfig = {
            width,
            height,
            depth,
            pataHeight,
            espesor,
            esquinaXTriangulada,
            esquinaZTriangulada,
            sueloDentro,
            techoDentro,
            traseroDentro,
            offsetTrasero,
            texture
        };

        // Solo inicializamos si no existe o está vacío
        if (!ref) {
            setRef(initialConfig);
        } else {
            // Actualizamos el estado local con los valores del ref
            setWidth(ref.width || width);
            setHeight(ref.height || height);
            setDepth(ref.depth || depth);
            setPataHeight(ref.pataHeight || pataHeight);
            setEspesor(ref.espesor || espesor);
            setEsquinaXTriangulada(ref.esquinaXTriangulada || false);
            setEsquinaZTriangulada(ref.esquinaZTriangulada || false);
            setSueloDentro(ref.sueloDentro || false);
            setTechoDentro(ref.techoDentro || false);
            setTraseroDentro(ref.traseroDentro !== undefined ? ref.traseroDentro : true);
            setOffsetTrasero(ref.offsetTrasero || 0);
            setTexture(ref.texture || texture);
        }
    }, []);

    // Actualizamos el estado global cuando cambia cualquier valor local
    useEffect(() => {
        if (!ref) return;

        const updatedConfig = {
            width,
            height,
            depth,
            pataHeight,
            espesor,
            esquinaXTriangulada,
            esquinaZTriangulada,
            sueloDentro,
            techoDentro,
            traseroDentro,
            offsetTrasero,
            texture
        };

        if (JSON.stringify(ref) !== JSON.stringify(updatedConfig)) {
            setRef(updatedConfig);
        }
    }, [
        width, height, depth, pataHeight, espesor,
        esquinaXTriangulada, esquinaZTriangulada,
        sueloDentro, techoDentro, traseroDentro, offsetTrasero, texture
    ]);

    // Logica para deshabilitar opciones
    useEffect(() => {
        const canUseOptions = (!esquinaXTriangulada && !esquinaZTriangulada);
        setDisabledOptions(!canUseOptions);

        if (!canUseOptions) {
            setSueloDentro(false);
            setTechoDentro(false);
            setTraseroDentro(true);
        }

        if (esquinaZTriangulada) {
            setSueloDentro(false);
            setTechoDentro(true);
        }
    }, [esquinaXTriangulada, esquinaZTriangulada]);

    // Limitamos el offset trasero
    useEffect(() => {
        if (offsetTrasero > depth / 3) {
            setOffsetTrasero(depth / 3);
        }
    }, [depth, offsetTrasero]);

    return (
        <BaseConfiguratorInterface title="Casco Configurator">
            {/* Configuración de dimensiones */}
            <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
                <Form>
                    <Form.Item label="Casco Width">
                        <Slider
                            min={1}
                            max={5}
                            step={0.1}
                            value={width}
                            onChange={setWidth}
                        />
                    </Form.Item>
                    <Form.Item label="Casco Height">
                        <Slider
                            step={0.1}
                            min={1}
                            max={6}
                            value={height}
                            onChange={setHeight}
                        />
                    </Form.Item>
                    <Form.Item label="Casco Depth">
                        <Slider
                            step={0.1}
                            min={1}
                            max={4}
                            value={depth}
                            onChange={setDepth}
                        />
                    </Form.Item>
                    <Form.Item label="Patas Height">
                        <Slider
                            min={0}
                            max={30}
                            value={pataHeight}
                            onChange={setPataHeight}
                        />
                    </Form.Item>
                    <Form.Item label="Espesor">
                        <Slider
                            min={0.1}
                            max={0.3}
                            step={0.01}
                            value={espesor}
                            onChange={setEspesor}
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
                            disabled={disabledOptions}
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
                    <Form.Item label="Offset Trasero">
                        <Slider
                            step={0.01}
                            disabled={!traseroDentro}
                            min={0}
                            max={depth / 3}
                            value={offsetTrasero}
                            onChange={setOffsetTrasero}
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
        </BaseConfiguratorInterface>
    );
};

export default CascoInterface;