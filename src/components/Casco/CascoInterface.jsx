import { Slider, Form, Space, Checkbox } from "antd";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface.jsx";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader.jsx";
import { useCascoConfigurator } from "../../contexts/useCascoConfigurator.jsx";

const CascoInterface = () => {
    const {
        width,
        setWidth,
        height,
        setHeight,
        depth,
        setDepth,
        texture,
        setTexture,
        esquinaXTriangulada,
        setEsquinaXTriangulada,
        esquinaZTriangulada,
        setEsquinaZTriangulada,
        espesor,
        setEspesor,
        sueloDentro,
        setSueloDentro,
        techoDentro,
        setTechoDentro,
        traseroDentro,
        setTraseroDentro,
        offsetTrasero,
        setOffsetTrasero,
        pataHeight,
        setPataHeight,
    } = useCascoConfigurator();

    const textureOptions = [
        { image: "./textures/oak.jpg", label: "Standard", value: "./textures/oak.jpg" },
        { image: "./textures/dark.jpg", label: "Dark", value: "./textures/dark.jpg" },
    ];

    return (
        <BaseConfiguratorInterface title="Casco Configurator">
            {/* Closet dimensions configuration */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form>
                    <Form.Item label="Casco Width">
                        <Slider
                            min={50}
                            max={500}
                            value={width}
                            onChange={(value) => setWidth(value)}
                        />
                    </Form.Item>
                    <Form.Item label="Casco Height">
                        <Slider
                            min={50}
                            max={100}
                            value={height}
                            onChange={(value) => setHeight(value)}
                        />
                    </Form.Item>
                    <Form.Item label="Casco Depth">
                        <Slider
                            min={50}
                            max={150}
                            value={depth}
                            onChange={(value) => setDepth(value)}
                        />
                    </Form.Item>
                    <Form.Item label="Patas Height">
                        <Slider
                            min={0}
                            max={30}
                            value={pataHeight}
                            onChange={(value) => setPataHeight(value)}
                        />
                    </Form.Item>
                    <Form.Item label="Espesor">
                        <Slider
                            min={0}
                            max={1}
                            step={0.01}
                            value={espesor}
                            onChange={(value) => setEspesor(value)}
                        />
                    </Form.Item>
                </Form>
            </div>

            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
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
                            checked={sueloDentro}
                            onChange={(e) => setSueloDentro(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Techo dentro">
                        <Checkbox
                            checked={techoDentro}
                            onChange={(e) => setTechoDentro(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Trasero dentro">
                        <Checkbox
                            checked={traseroDentro}
                            onChange={(e) => setTraseroDentro(e.target.checked)}
                        />
                    </Form.Item>
                    <Form.Item label="Offset Trasero">
                        <Slider
                            min={0}
                            max={depth/3}
                            value={offsetTrasero}
                            onChange={(value) => setOffsetTrasero(value)}
                        />
                    </Form.Item>
                </Form>
            </div>

            {/* Texture configuration */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form.Item label="Textura">
                    <div style={{ marginTop: "10px" }}>
                        {/* Texturas predefinidas */}
                        <ItemSelector
                            options={textureOptions}
                            currentValue={texture}
                            onValueChange={setTexture}
                        />

                        {/* Carga de textura personalizada */}
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
        </BaseConfiguratorInterface>
    );
};

export default CascoInterface;