import { Slider, Form, Select } from "antd";
import { useConfigurator } from "../../contexts/Configurator.jsx";
import BaseConfiguratorInterface from "../BaseConfiguratorInterface";
import TextureUploader from "../TextureUploader";
import ItemSelector from "../ItemSelector.jsx";

const MesaInterface = () => {
    const {
        legs,
        setLegs,
        legsColor,
        setLegsColor,
        tableWidth,
        setTableWidth,
        tableHeight,
        setTableHeight,
        tableDepth,
        setTableDepth,
        plankTexture,
        setPlankTexture
    } = useConfigurator();

    const legOptions = [
        {image: "./images/standardLegs.png", label: "Standard", value: 0},
        {image: "./images/Standard2Legs.png", label: "Standard2", value: 1},
        {image: "./images/SolidLegs.png", label: "Solid", value: 2},
        {image: "./images/DesignLegs.png", label: "Design", value: 3},
        {image: "./images/Design2Legs.png", label: "Design2", value: 4},
    ];

    // Define color options with their labels and hex values
    const colorOptions = [
        {label: "Black", value: "#777777"},
        {label: "Chrome", value: "#ECECEC"},
        {label: "Gold", value: "#C9BD71"},
        {label: "Pink Gold", value: "#C9A3B9"},
    ];


    const textureOptions = [
        { image: "./textures/oak.jpg", label: "Roble", value: "./textures/oak.jpg" },
        { image: "./textures/dark.jpg", label: "Oscuro", value: "./textures/dark.jpg" },
    ];

    return (
        <BaseConfiguratorInterface title="Table Configurator">
            {/* Table dimensions configuration */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form>
                    <Form.Item label="Table Width">
                        <Slider
                            min={60}
                            max={120}
                            value={tableWidth}
                            onChange={(value) => setTableWidth(value)}
                            tooltip={open}
                        />
                    </Form.Item>
                    <Form.Item label="Table Height">
                        <Slider
                            min={70}
                            max={90}
                            value={tableHeight}
                            onChange={(value) => setTableHeight(value)}
                            tooltip={open}
                        />
                    </Form.Item>
                    <Form.Item label="Table Length">
                        <Slider
                            min={100}
                            max={220}
                            value={tableDepth}
                            onChange={(value) => setTableDepth(value)}
                            tooltip={open}
                        />
                    </Form.Item>
                </Form>
            </div>


            {/* Legs configuration */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form.Item label="Patas">
                    <div style={{ marginTop: "10px" }}>
                        <ItemSelector
                            options={legOptions}
                            currentValue={legs}
                            onValueChange={setLegs}
                        />
                    </div>
                </Form.Item>
            </div>

            {/* Legs color configuration */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form.Item label="Color patas">
                    <div style={{ marginTop: "10px" }}>
                        <ItemSelector
                            options={colorOptions}
                            currentValue={legsColor}
                            onValueChange={setLegsColor}
                        />
                    </div>
                </Form.Item>
            </div>


            {/* Table texture configuration */}
            <div style={{ padding: "16px", background: "#f0f2f5", borderRadius: "8px" }}>
                <Form.Item label="Textura">
                    <div style={{ marginTop: "10px" }}>
                        {/* Texturas predefinidas */}
                        <ItemSelector
                            options={textureOptions}
                            currentValue={plankTexture}
                            onValueChange={setPlankTexture}
                        />

                        {/* Carga de textura personalizada */}
                        <div style={{ marginTop: "10px" }}>
                            <TextureUploader
                                onTextureChange={setPlankTexture}
                                currentTexture={plankTexture}
                                defaultTexture="./textures/oak.jpg"
                            />
                        </div>
                    </div>
                </Form.Item>
            </div>
        </BaseConfiguratorInterface>
    );
};

export default MesaInterface;