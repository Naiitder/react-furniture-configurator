import * as React from 'react';
import {Mesh} from 'three';
import {useState, useEffect, useMemo} from 'react';

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
        shootRaycasts: () => { arriba: Mesh[]; abajo: Mesh[]; izquierda: Mesh[]; derecha: Mesh[] }
    };
}

interface SingleOverlayProps {
    position: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' };
    intersectionData: NonNullable<IntersectionOverlayProps['intersectionData']>;
    baseStyle: React.CSSProperties;
}

// --- STYLES ---
const STATIC_STYLES = {
    overlay: {
        position: 'absolute' as const,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        pointerEvents: 'auto' as const,
        zIndex: 1000,
        whiteSpace: 'nowrap' as const,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(4px)',
    },
};

// --- CONSTANTS ---
const GAP_SIZE = 15;

// --- HELPER FUNCTION ---
const getTransformStyle = (placement: 'top' | 'bottom' | 'left' | 'right', gap: number = 0): string => {
    switch (placement) {
        case 'top':
            return `translate(-50%, calc(-100% - ${gap}px))`;
        case 'bottom':
            return `translate(-50%, ${gap}px)`;
        case 'left':
            return `translate(calc(-100% - ${gap}px), -50%)`;
        case 'right':
            return `translate(${gap}px, -50%)`;
        default:
            return 'translate(-50%, -50%)';
    }
};

// --- SUB-COMPONENT ---
const SingleOverlay: React.FC<SingleOverlayProps> = ({position, intersectionData, baseStyle}) => {
    // Cache raycast results with a unique key based on intersectionData
    const cacheKey = useMemo(() => {
        const key = `${intersectionData.id}-${intersectionData.position.x}-${intersectionData.position.y}`;
        return key;
    }, [
        intersectionData.id,
        intersectionData.position.x,
        intersectionData.position.y,
    ]);

    const [raycastResults, setRaycastResults] = useState<{
        arriba: Mesh[];
        abajo: Mesh[];
        izquierda: Mesh[];
        derecha: Mesh[];
    } | null>(null);

    // Trigger raycasts only on mount or when cacheKey changes
    useEffect(() => {
        if (!intersectionData.shootRaycasts) {
            console.error('[SingleOverlay] shootRaycasts is not a function');
            return;
        }

        // ALWAYS clear results when cacheKey changes
        setRaycastResults(null);

        const results = intersectionData.shootRaycasts();

        if (results && typeof results === 'object') {
            setRaycastResults(results);
        } else {
            console.warn('[SingleOverlay] Invalid raycast results:', results);
        }
    }, [cacheKey, intersectionData.shootRaycasts, position.placement]);

    // Compute neighbor information
    const neighborInfo = useMemo(() => {
        if (!raycastResults) {
            return `No hay vecinos (ID: ${intersectionData.id.substring(0, 8)})`;
        }

        const placementMap = {
            top: 'arriba',
            bottom: 'abajo',
            left: 'izquierda',
            right: 'derecha',
        };
        const rayDirection = placementMap[position.placement];

        const neighborMeshes: Mesh[] = raycastResults[rayDirection] ?? [];

        if (neighborMeshes.length === 0) {
            return 'Vacío';
        }

        const labels = neighborMeshes.map(mesh => {
            const name = mesh.userData?.name || mesh.name;
            const id = mesh.userData?.id || mesh.uuid;
            return name || `ID: ${id?.substring(0, 8)}`;
        });

        return labels.join(', ');
    }, [raycastResults, intersectionData.id, position.placement]);

    // Overlay content
    const overlayContent = useMemo(() => (
        <>
            <div><strong>{intersectionData.orientation === 'vertical' ? 'Vertical' : 'Horizontal'}</strong></div>
            <div>Pos: ({intersectionData.position.x.toFixed(2)}, {intersectionData.position.y.toFixed(2)})</div>
            <div>Vecino: {neighborInfo}</div>
            <div>{position.placement === 'top' ? '↑' : position.placement === 'left' ? '←' : position.placement === 'bottom' ? '↓' : '→'}</div>
        </>
    ), [intersectionData.orientation, intersectionData.position, neighborInfo]);

    // Overlay style
    const overlayStyle = useMemo(
        () => ({
            ...baseStyle,
            left: position.x,
            top: position.y,
            transform: getTransformStyle(position.placement, GAP_SIZE),
        }),
        [baseStyle, position.x, position.y, position.placement]
    );

    return <div style={overlayStyle}>{overlayContent}</div>;
};

// --- MAIN COMPONENT ---
const IntersectionOverlay: React.FC<IntersectionOverlayProps> = React.memo(
    ({isVisible, overlayPositions, intersectionData}) => {
        const baseStyle = useMemo(() => STATIC_STYLES.overlay, []);

        if (!isVisible || !overlayPositions || !intersectionData) {
            return null;
        }

        return (
            <>
                <SingleOverlay
                    key={`primary-${intersectionData.id}`}
                    position={overlayPositions.primary}
                    intersectionData={intersectionData}
                    baseStyle={baseStyle}
                />
                <SingleOverlay
                    key={`secondary-${intersectionData.id}`}
                    position={overlayPositions.secondary}
                    intersectionData={intersectionData}
                    baseStyle={baseStyle}
                />
            </>
        );
    }
);

IntersectionOverlay.displayName = 'IntersectionOverlay';

export default IntersectionOverlay;