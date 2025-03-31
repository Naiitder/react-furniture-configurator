import { useState } from "react";
import { Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const TextureUploader = ({
                             onTextureChange,
                             currentTexture,
                             defaultTexture = "./textures/oak.jpg"
                         }) => {
    const [customTexture, setCustomTexture] = useState(null);

    const handleRemoveCustomTexture = () => {
        setCustomTexture(null);
        // Volver a la textura por defecto
        onTextureChange(defaultTexture);
    };

    // Configuración del Uploader de Ant Design
    const uploadProps = {
        name: 'texture',
        accept: '.jpg,.jpeg,.png,.webp',
        maxCount: 1,

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
                const textureUrl = e.target.result;
                setCustomTexture(textureUrl);

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
        <div>
            <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>
                    Subir Textura Personalizada
                </Button>
            </Upload>
            {customTexture && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <div
                        onClick={() => {
                            onTextureChange(customTexture);
                        }}
                    >
                        <img
                            src={customTexture}
                            alt="Custom Texture"
                            style={{
                                width: "60px",
                                height: "60px",
                                border: customTexture === currentTexture ? "2px solid #1890ff" : "1px solid #d9d9d9",
                                borderRadius: "4px",
                                boxShadow: customTexture === currentTexture ? "0 0 8px rgba(24, 144, 255, 0.5)" : "none",
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
                        style={{ color: 'red' }}
                    >
                        Eliminar
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TextureUploader;