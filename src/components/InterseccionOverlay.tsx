import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';

// --- INTERFACES ---
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
    showTables?: boolean;
    tableData?: {
        headers: string[];
        rows: string[][];
    };
}

// --- ESTILOS ESTÁTICOS ---
const STATIC_STYLES = {
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        fontSize: '11px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    header: {
        backgroundColor: 'rgba(0, 100, 200, 0.8)',
        color: 'white',
        padding: '4px 6px',
        textAlign: 'left' as const,
        fontSize: '10px',
        fontWeight: 'bold' as const
    },
    cell: {
        padding: '3px 6px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        fontSize: '10px',
        color: '#333'
    },
    tableContainer: {
        maxWidth: '250px',
        minWidth: '200px'
    },
    tableTitle: {
        marginBottom: '4px',
        fontSize: '12px',
        fontWeight: 'bold' as const,
        color: 'white',
        textAlign: 'center' as const
    }
};

// --- FUNCIÓN HELPER ---
// Hecha más segura para manejar valores undefined
const getTransformStyle = (placement?: 'top' | 'bottom' | 'left' | 'right'): string => {
    switch (placement) {
        case 'top': return 'translate(-50%, -100%)';
        case 'bottom': return 'translate(-50%, 0%)';
        case 'left': return 'translate(-100%, -50%)';
        case 'right': return 'translate(0%, -50%)';
        default: return 'translate(-50%, -50%)';
    }
};


// --- COMPONENTE CORREGIDO ---
const IntersectionOverlay: React.FC<IntersectionOverlayProps> = React.memo(({
                                                                                isVisible,
                                                                                overlayPositions,
                                                                                intersectionData,
                                                                                showTables = false,
                                                                                tableData
                                                                            }) => {
    // --- HOOKS ---
    // Todos los hooks se declaran incondicionalmente al principio del componente.
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseUp = () => setIsDragging(false);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
        }
    }, [isDragging]);

    const currentTableData = useMemo(() => {
        if (tableData) return tableData;
        return {
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
    }, [tableData, intersectionData]);

    const TableComponent = useMemo(() => {
        if (!showTables) return null;
        return (
            <table style={STATIC_STYLES.table}>
                <thead>
                <tr>
                    {currentTableData.headers.map((header, index) => (
                        <th key={index} style={STATIC_STYLES.header}>{header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {currentTableData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex} style={STATIC_STYLES.cell}>{cell}</td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        );
    }, [showTables, currentTableData]);

    const overlayContent = useMemo(() => {
        if (showTables) {
            const placement = overlayPositions?.primary.placement;
            const titleText = intersectionData?.orientation === 'vertical'
                ? (placement === 'left' ? 'Lado Izquierdo' : 'Lado Derecho')
                : (placement === 'top' ? 'Lado Superior' : 'Lado Inferior');
            return (
                <div style={STATIC_STYLES.tableContainer}>
                    <div style={STATIC_STYLES.tableTitle}>{titleText}</div>
                    {TableComponent}
                </div>
            );
        }
        const baseInfo = (
            <>
                <div><strong>{intersectionData?.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}</strong></div>
                <div>Pos: ({intersectionData?.position.x.toFixed(2)}, {intersectionData?.position.y.toFixed(2)})</div>
            </>
        );
        const placement = overlayPositions?.primary.placement;
        if (intersectionData?.orientation === 'vertical') {
            return <>{baseInfo}<div>{placement === 'left' ? '← Izquierda' : 'Derecha →'}</div></>;
        } else {
            return <>{baseInfo}<div>{placement === 'top' ? '↑ Arriba' : 'Abajo ↓'}</div></>;
        }
    }, [showTables, overlayPositions?.primary.placement, intersectionData, TableComponent]);

    const baseStyle = useMemo(() => ({
        position: 'absolute' as const,
        backgroundColor: showTables ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: showTables ? '8px' : '6px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        pointerEvents: showTables ? 'auto' as const : 'none' as const,
        zIndex: 1000,
        whiteSpace: showTables ? 'normal' as const : 'nowrap' as const,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
        maxHeight: showTables ? '300px' : 'auto',
        overflowY: showTables ? 'auto' as const : 'visible' as const,
        cursor: showTables ? 'move' : 'default'
    }), [showTables]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!showTables) return;
        setIsDragging(true);
        const rect = (e.target as HTMLElement).closest('.overlay-container')?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    }, [showTables]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && showTables) {
            // Lógica de arrastre puede ir aquí si se necesita
        }
    }, [isDragging, showTables]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // **LA CORRECCIÓN ESTÁ AQUÍ**
    // 1. Este hook se mueve ANTES del retorno condicional.
    // 2. Usa encadenamiento opcional (?.) y el operador nullish coalescing (??) para seguridad.
    const overlayStyle = useMemo(() => ({
        ...baseStyle,
        left: overlayPositions?.primary.x ?? 0,
        top: overlayPositions?.primary.y ?? 0,
        transform: getTransformStyle(overlayPositions?.primary.placement),
    }), [baseStyle, overlayPositions]);

    // El retorno condicional ahora es seguro, porque todos los hooks se han ejecutado.
    if (!isVisible || !overlayPositions || !intersectionData) {
        return null;
    }

    // --- RENDER ---
    return (
        <div
            className="overlay-container"
            style={overlayStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {overlayContent}
        </div>
    );
});

IntersectionOverlay.displayName = 'IntersectionOverlay';

export default IntersectionOverlay;