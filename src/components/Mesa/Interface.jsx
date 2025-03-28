import {Slider, Radio, Typography, Form, Space, message, Button, Upload} from "antd";
import {useConfigurator} from "../../contexts/Configurator";
import {useState} from "react";
import {ArrowLeftOutlined, UploadOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

const {Title} = Typography;

const Interface = () => {
    const {
        legs, setLegs,
        legsColor, setLegsColor,
        tableWidth, setTableWidth,
        tableHeight, setTableHeight,
        tableDepth, setTableDepth,
        plankTexture, setPlankTexture,
    } = useConfigurator();
    const navigate = useNavigate();

    const [customTexture, setCustomTexture] = useState(null);


    // Define color options with their labels and hex values
    const colorOptions = [
        {label: "Black", value: "#777777"},
        {label: "Chrome", value: "#ECECEC"},
        {label: "Gold", value: "#C9BD71"},
        {label: "Pink Gold", value: "#C9A3B9"},
    ];

    const legOptions = [
        {image: "./images/standardLegs.png", label: "Standard", value: 0},
        {image: "./images/Standard2Legs.png", label: "Standard2", value: 1},
        {image: "./images/SolidLegs.png", label: "Solid", value: 2},
        {image: "./images/DesignLegs.png", label: "Design", value: 3},
        {image: "./images/Design2Legs.png", label: "Design2", value: 4},
    ];

    const textureOptions = [
        {image: "./textures/oak.jpg", label: "Standard", value: "./textures/oak.jpg"},
        {image: "./textures/hard.jpg", label: "Dark", value: "./textures/hard.jpg"},
    ];

    const handleRemoveCustomTexture = () => {
        setCustomTexture(null);
        // Volver a la textura por defecto
        setPlankTexture('./textures/oak.jpg');
    };

    // Configuración del Uploader de Ant Design
    const uploadProps = {
        name: 'texture',
        accept: '.jpg,.jpeg,.png,.webp',
        maxCount: 1,
        // Eliminar la propiedad 'action'

        // Manejador personalizado de carga
        customRequest: ({ file, onSuccess, onError }) => {
            // Validar tamaño del archivo
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('La imagen debe ser menor a 5MB');
                onError(new Error('File too large'));
                return;
            }

            // Validar tipo de archivo
            const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
            if (!isImage) {
                message.error('Solo se permiten archivos de imagen (JPEG, PNG, WebP)');
                onError(new Error('Invalid file type'));
                return;
            }

            // Crear FileReader para leer el archivo localmente
            const reader = new FileReader();
            reader.onload = (e) => {
                // Guardar la imagen como URL de datos
                setCustomTexture(e.target.result);

                // Simular éxito de carga
                onSuccess('Ok');

                message.success(`${file.name} archivo cargado exitosamente`);
            };

            reader.onerror = (error) => {
                message.error('Error al leer el archivo');
                onError(error);
            };

            // Leer el archivo como URL de datos
            reader.readAsDataURL(file);
        },

        // Deshabilitar la lista de archivos
        showUploadList: false,
    };

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                padding: "20px",
                width: "300px",
                overflow: "auto",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px",
                margin: "10px",
                boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
            }}
        >
            <Button onClick={() => navigate(`/`)}>
                <ArrowLeftOutlined/>
            </Button>
            <Space direction="vertical" size={16}>


                <Title level={5}>Table Configurator</Title>

                {/* Table dimensions configuration */}
                <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
                    <Form>
                        <Form.Item label="Table Width">
                            <Slider
                                min={50}
                                max={200}
                                value={tableWidth}
                                onChange={(value) => setTableWidth(value)}
                                tooltip={open}
                            />
                        </Form.Item>
                        <Form.Item label="Table Height">
                            <Slider
                                min={50}
                                max={100}
                                value={tableHeight}
                                onChange={(value) => setTableHeight(value)}
                                tooltip={open}
                            />
                        </Form.Item>
                        <Form.Item label="Table Depth">
                            <Slider
                                min={50}
                                max={200}
                                value={tableDepth}
                                onChange={(value) => setTableDepth(value)}
                                tooltip={open}
                            />
                        </Form.Item>
                    </Form>
                </div>

                {/* Legs layout configuration */}
                <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
                    <Form.Item label="Legs Layout">
                        <div style={{marginTop: "10px"}}>
                            <div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
                                {legOptions.map(option => (
                                    <div
                                        key={option.value}
                                        onClick={() => setLegs(option.value)}
                                        style={{
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                border: option.value === legs ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                                borderRadius: "4px",
                                                boxShadow: option.value === legs ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                                                transition: "all 0.3s ease",
                                                overflow: "hidden", // Para contener la imagen dentro del div
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                padding: "4px"
                                            }}
                                        >
                                            <img
                                                src={option.image}
                                                alt={option.label}
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "100%",
                                                    objectFit: "contain"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Form.Item>
                </div>

                {/* Legs color configuration with custom color swatches */}
                <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
                    <Form.Item label="Legs Color">
                        <div style={{marginTop: "10px"}}>
                            <div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
                                {colorOptions.map(option => (
                                    <div
                                        key={option.value}
                                        onClick={() => setLegsColor(option.value)}
                                        style={{
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                backgroundColor: option.value,
                                                border: option.value === legsColor ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                                borderRadius: "4px",
                                                boxShadow: option.value === legsColor ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                                                transition: "all 0.3s ease"
                                            }}
                                        />
                                        <span style={{
                                            fontSize: "12px",
                                            fontWeight: option.value === legsColor ? "bold" : "normal",
                                            color: option.value === legsColor ? "#1890ff" : "inherit"
                                        }}>
                      {option.label}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Form.Item>
                </div>

                {/* Texture configuration */}
                <div style={{padding: "16px", background: "#f0f2f5", borderRadius: "8px"}}>
                    <Form.Item label="Textura">
                        <div style={{marginTop: "10px"}}>
                            {/* Texturas predefinidas */}
                            <div style={{display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "10px"}}>
                                {textureOptions.map(option => (
                                    <div
                                        key={option.value}
                                        onClick={() => {
                                            setPlankTexture(option.value);
                                        }}
                                        style={{
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                border: option.value === plankTexture ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                                borderRadius: "4px",
                                                boxShadow: option.value === plankTexture ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                                                transition: "all 0.3s ease",
                                                overflow: "hidden",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                padding: "4px"
                                            }}
                                        >
                                            <img
                                                src={option.image}
                                                alt={option.label}
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "100%",
                                                    objectFit: "contain"
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Carga de textura personalizada */}
                            <div style={{marginTop: "10px"}}>
                                <Upload {...uploadProps}>
                                    <Button icon={<UploadOutlined />}>
                                        Subir Textura Personalizada
                                    </Button>
                                </Upload>
                                {customTexture && (
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <div
                                            onClick={() => {
                                                setPlankTexture(customTexture);
                                            }}
                                        >
                                            <img
                                                src={customTexture}
                                                alt="Custom Texture"
                                                style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    border: customTexture === plankTexture ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                                    borderRadius: "4px",
                                                    boxShadow: customTexture === plankTexture ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
                                                    transition: "all 0.3s ease",
                                                    overflow: "hidden",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    padding: "4px"
                                                }}
                                            />
                                        </div>
                                        <Button
                                            type="link"
                                            onClick={handleRemoveCustomTexture}
                                            style={{color: 'red'}}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Form.Item>
                </div>
            </Space>
        </div>
    );
};

export default Interface;