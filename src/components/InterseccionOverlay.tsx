import * as React from 'react';
import { useState, useEffect } from 'react';

interface IntersectionOverlayProps {
    isVisible: boolean;
    overlayPositions?: {
        primary: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' };
        secondary: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' };
    };
    intersectionData?: {
        id: string;
        originalIndex: number;
        position: { x: number; y: number };
        orientation: string;
        createdAt: Date;
        dimensions?: { width: number; height: number; depth: number };
    };
    // Nueva prop para habilitar/deshabilitar las tablas
    showTables?: boolean;
    // Datos de la tabla que se va a renderizar
    tableData?: {
        headers: string[];
        rows: string[][];
    };
}

const IntersectionOverlay: React.FC<IntersectionOverlayProps> = ({
                                                                     isVisible,
                                                                     overlayPositions,
                                                                     intersectionData,
                                                                     showTables = false,
                                                                     tableData
                                                                 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    if (!isVisible || !overlayPositions || !intersectionData) {
        return null;
    }

    // Función para obtener el estilo de transformación según la posición
    const getTransformStyle = (placement: 'top' | 'bottom' | 'left' | 'right') => {
        switch (placement) {
            case 'top':
                return 'translate(-50%, -100%)'; // Centrado horizontalmente, arriba del punto
            case 'bottom':
                return 'translate(-50%, 0%)'; // Centrado horizontalmente, debajo del punto
            case 'left':
                return 'translate(-100%, -50%)'; // A la izquierda del punto, centrado verticalmente
            case 'right':
                return 'translate(0%, -50%)'; // A la derecha del punto, centrado verticalmente
            default:
                return 'translate(-50%, -50%)';
        }
    };

    // Datos de ejemplo para la tabla si no se proporcionan
    const defaultTableData = {
        headers: ['Propiedad', 'Valor', 'Unidad'],
        rows: [
            ['Ancho', intersectionData?.dimensions?.width?.toFixed(2) || 'N/A', 'cm'],
            ['Alto', intersectionData?.dimensions?.height?.toFixed(2) || 'N/A', 'cm'],
            ['Profundidad', intersectionData?.dimensions?.depth?.toFixed(2) || 'N/A', 'cm'],
            ['Orientación', intersectionData?.orientation || 'N/A', '-'],
            ['ID', intersectionData?.id || 'N/A', '-'],
            ['Creado', intersectionData?.createdAt ? new Date(intersectionData.createdAt).toLocaleTimeString() : 'N/A', '-']
        ]
    };

    const currentTableData = tableData || defaultTableData;

    // Función para renderizar una tabla HTML
    const renderTable = (placement: 'top' | 'bottom' | 'left' | 'right', isPrimary: boolean) => {
        const tableStyle: React.CSSProperties = {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '4px',
            overflow: 'hidden'
        };

        const headerStyle: React.CSSProperties = {
            backgroundColor: 'rgba(0, 100, 200, 0.8)',
            color: 'white',
            padding: '4px 6px',
            textAlign: 'left',
            fontSize: '10px',
            fontWeight: 'bold'
        };

        const cellStyle: React.CSSProperties = {
            padding: '3px 6px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            fontSize: '10px',
            color: '#333'
        };

        return (
            <table style={tableStyle}>
                <thead>
                    <tr>
                        {currentTableData.headers.map((header, index) => (
                            <th key={index} style={headerStyle}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentTableData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} style={cellStyle}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // Función para obtener el contenido del overlay según la configuración
    const getOverlayContent = (placement: 'top' | 'bottom' | 'left' | 'right', isPrimary: boolean) => {
        if (showTables) {
            return (
                <div style={{ maxWidth: '250px', minWidth: '200px' }}>
                    <div style={{ 
                        marginBottom: '4px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        {intersectionData?.orientation === 'vertical' ? 
                            (placement === 'left' ? 'Lado Izquierdo' : 'Lado Derecho') :
                            (placement === 'top' ? 'Lado Superior' : 'Lado Inferior')
                        }
                    </div>
                    {renderTable(placement, isPrimary)}
                </div>
            );
        }

        // Contenido original si no se muestran tablas
        const baseInfo = (
            <>
                <div>
                    <strong>{intersectionData?.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}</strong>
                </div>
                <div>
                    Pos: ({intersectionData?.position.x.toFixed(2)}, {intersectionData?.position.y.toFixed(2)})
                </div>
            </>
        );

        // Agregar información específica según posición
        if (intersectionData?.orientation === 'vertical') {
            if (placement === 'left') {
                return (
                    <>
                        {baseInfo}
                        <div>← Izquierda</div>
                    </>
                );
            } else {
                return (
                    <>
                        {baseInfo}
                        <div>Derecha →</div>
                    </>
                );
            }
        } else {
            if (placement === 'top') {
                return (
                    <>
                        {baseInfo}
                        <div>↑ Arriba</div>
                    </>
                );
            } else {
                return (
                    <>
                        {baseInfo}
                        <div>Abajo ↓</div>
                    </>
                );
            }
        }
    };

    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        backgroundColor: showTables ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: showTables ? '8px' : '6px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        pointerEvents: showTables ? 'auto' : 'none', // Habilitar interacción con tablas
        zIndex: 1000,
        whiteSpace: showTables ? 'normal' : 'nowrap',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
        maxHeight: showTables ? '300px' : 'auto',
        overflowY: showTables ? 'auto' : 'visible',
        // Añadir cursor para indicar que se puede interactuar
        cursor: showTables ? 'move' : 'default'
    };

    // Funciones para manejar el arrastre de las tablas
    const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
        if (!showTables) return;
        
        setIsDragging(true);
        const rect = (e.target as HTMLElement).closest('.overlay-container')?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && showTables) {
            // Aquí podrías implementar lógica adicional para el arrastre
            // Por ahora, dejamos que CSS transform maneje la posición
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Effect para manejar eventos globales de mouse
    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseUp = () => setIsDragging(false);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
        }
    }, [isDragging]);

    return (
        <>
            {/* Overlay principal */}
            <div
                className="overlay-container"
                style={{
                    ...baseStyle,
                    left: overlayPositions.primary.x,
                    top: overlayPositions.primary.y,
                    transform: getTransformStyle(overlayPositions.primary.placement),
                }}
                onMouseDown={(e) => handleMouseDown(e, 'primary')}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {getOverlayContent(overlayPositions.primary.placement, true)}
            </div>

            {/* Overlay secundario */}
            <div
                className="overlay-container"
                style={{
                    ...baseStyle,
                    left: overlayPositions.secondary.x,
                    top: overlayPositions.secondary.y,
                    transform: getTransformStyle(overlayPositions.secondary.placement),
                }}
                onMouseDown={(e) => handleMouseDown(e, 'secondary')}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {getOverlayContent(overlayPositions.secondary.placement, false)}
            </div>
        </>
    );
};

export default IntersectionOverlay;