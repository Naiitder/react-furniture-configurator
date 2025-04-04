// Primero vamos a agregar nuevos componentes para la interfaz
// Esto va en un nuevo archivo: src/components/DraggableIntersection.jsx

import * as React from 'react';
import { useDrag } from 'react-dnd';
import { Typography, Card } from 'antd';

const { Text } = Typography;

// Definir los tipos de intersección
export const INTERSECTION_TYPES = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

// Componente para una intersección arrastrable
const DraggableIntersection = ({ type, color = '#8B4513' }) => {
    // Configurar el comportamiento de arrastre
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'intersection',
        item: { type },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    // Estilos para los diferentes tipos de intersección
    const getIntersectionStyle = () => {
        const baseStyle = {
            backgroundColor: color,
            margin: '10px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            opacity: isDragging ? 0.5 : 1,
            cursor: 'move',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '10px',
        };

        if (type === INTERSECTION_TYPES.HORIZONTAL) {
            return {
                ...baseStyle,
                width: '100px',
                height: '20px',
            };
        } else { // VERTICAL
            return {
                ...baseStyle,
                width: '20px',
                height: '100px',
            };
        }
    };

    return (
        <div ref={drag} style={getIntersectionStyle()}>
            <Text style={{ color: 'white', fontSize: '12px', writingMode: type === INTERSECTION_TYPES.VERTICAL ? 'vertical-rl' : 'horizontal-tb' }}>
                {type === INTERSECTION_TYPES.HORIZONTAL ? 'Horizontal' : 'Vertical'}
            </Text>
        </div>
    );
};

export default DraggableIntersection;