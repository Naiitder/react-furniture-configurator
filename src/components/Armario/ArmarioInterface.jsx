import { Slider, Form, Space } from "antd";
import { useArmarioConfigurator } from "../../contexts/ArmarioConfigurator.jsx";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface";
import ItemSelector from "../ItemSelector.jsx";
import TextureUploader from "../TextureUploader";

const ArmarioInterface = () => {
    const {
        closetWidth,
        setClosetWidth,
        closetHeight,
        setClosetHeight,
        closetDepth,
        setClosetDepth,
        texture,
        setTexture
    } = useArmarioConfigurator();

    const textureOptions = [
        { image: "./textures/oak.jpg", label: "Standard", value: "./textures/oak.jpg" },
        { image: "./textures/hard.jpg", label: "Dark", value: "./textures/hard.jpg" },
    ];

    return (
        <BaseConfiguratorInterface title="Closet Configurator">
            {/* Closet dimensions configuration */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form>
                    <Form.Item label="Closet Width">
                        <Slider
                            min={50}
                            max={200}
                            value={closetWidth}
                            onChange={(value) => setClosetWidth(value)}
                            tooltip={open}
                        />
                    </Form.Item>
                    <Form.Item label="Closet Height">
                        <Slider
                            min={50}
                            max={100}
                            value={closetHeight}
                            onChange={(value) => setClosetHeight(value)}
                            tooltip={open}
                        />
                    </Form.Item>
                    <Form.Item label="Closet Depth">
                        <Slider
                            min={50}
                            max={150}
                            value={closetDepth}
                            onChange={(value) => setClosetDepth(value)}
                            tooltip={open}
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

export default ArmarioInterface;