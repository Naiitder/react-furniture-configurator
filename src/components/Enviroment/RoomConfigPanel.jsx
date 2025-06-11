import React, { useState, useRef, useEffect } from 'react';
import {Slider, Space, Form, Typography, FloatButton} from 'antd';
import { useRoomConfigurator } from "../../contexts/RoomConfigurator.jsx";
import { MoreOutlined } from "@ant-design/icons";

const { Title } = Typography;

const RoomConfigPanel = () => {
    const [visible, setVisible] = useState(false);
    const { roomWidth, setRoomWidth, roomHeight, setRoomHeight, opacity, setOpacity } = useRoomConfigurator();

    // Crear una referencia para el panel de configuración
    const panelRef = useRef(null);

    const togglePanel = () => {
        setVisible(!visible);
    };

    // Manejar clics fuera del panel para ocultarlo
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setVisible(false);
            }
        };

        // Agregar el listener
        document.addEventListener('mousedown', handleClickOutside);

        // Limpiar el listener cuando el componente se desmonte
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            {/* Floating Action Button */}
            <FloatButton
                type="primary"
                shape="circle"
                size="large"
                icon={<MoreOutlined />}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 100,
                }}
                onClick={togglePanel}
            />

            {/* Configuración de la habitación (panel expandido) */}
            {visible && (
                <div
                    ref={panelRef} // Asociamos la referencia aquí
                    style={{
                        position: 'fixed',
                        bottom: '80px',
                        right: '20px',
                        width: '300px',
                        padding: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                        zIndex: 101,
                    }}
                >
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <Title level={5}>Room Configurator</Title>
                        <Form>
                            <Form.Item label="Room Width">
                                <Slider
                                    min={10}
                                    max={32}
                                    value={roomWidth}
                                    onChange={(value) => setRoomWidth(value)}
                                />
                            </Form.Item>
                            <Form.Item label="Room Height">
                                <Slider
                                    min={5}
                                    max={15}
                                    value={roomHeight}
                                    onChange={(value) => setRoomHeight(value)}
                                />
                            </Form.Item>
                            <Form.Item label="Walls Opacity">
                                <Slider
                                    min={0}
                                    max={100}
                                    value={opacity}
                                    onChange={(value) => setOpacity(value)}
                                />
                            </Form.Item>
                        </Form>
                    </Space>
                </div>
            )}
        </div>
    );
};

export default RoomConfigPanel;