import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useSelectedPieceProvider } from '../contexts/SelectedPieceProvider';

interface IntersectionOverlayData {
    isIntersection: boolean;
    intersectionData?: {
        id: string;
        originalIndex: number;
        position: { x: number; y: number };
        orientation: string;
        createdAt: Date;
        worldPosition: [number, number, number];
        dimensions?: { width: number; height: number; depth: number };
    };
    screenPosition?: { x: number; y: number };
    // Posiciones para múltiples divs según orientación
    overlayPositions?: {
        primary: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' };
        secondary: { x: number; y: number; placement: 'top' | 'bottom' | 'left' | 'right' };
    };
}

export const useIntersectionOverlay = (camera: THREE.Camera, canvas: HTMLCanvasElement | null) => {
    const { refPiece } = useSelectedPieceProvider();
    const [overlayData, setOverlayData] = useState<IntersectionOverlayData>({
        isIntersection: false
    });

    const updateScreenPosition = useCallback(() => {
        if (!refPiece || !camera || !canvas) {
            setOverlayData(prev => ({ ...prev, screenPosition: undefined, overlayPositions: undefined }));
            return;
        }

        // Verificar si la pieza seleccionada es una intersección
        const userData = refPiece.userData;
        const isIntersection = userData?.isIntersection === true;

        if (!isIntersection) {
            setOverlayData({ isIntersection: false });
            return;
        }

        // Obtener la posición 3D del objeto y sus dimensiones
        const worldPosition = new THREE.Vector3();
        let objectDimensions = { width: 0.1, height: 0.1, depth: 0.1 }; // defaults

        if (refPiece instanceof THREE.Mesh) {
            refPiece.getWorldPosition(worldPosition);

            // Intentar obtener dimensiones de la geometría
            if (refPiece.geometry instanceof THREE.BoxGeometry) {
                const params = refPiece.geometry.parameters;
                objectDimensions = {
                    width: params.width,
                    height: params.height,
                    depth: params.depth
                };
            }
        } else if (userData?.intersectionData?.worldPosition) {
            const [x, y, z] = userData.intersectionData.worldPosition;
            worldPosition.set(x, y, z);
        }

        // Convertir posición central a coordenadas de pantalla
        const centerScreenPos = worldPosition.clone().project(camera);
        const rect = canvas.getBoundingClientRect();
        const centerX = (centerScreenPos.x * 0.5 + 0.5) * rect.width;
        const centerY = (centerScreenPos.y * -0.5 + 0.5) * rect.height;

        // Calcular posiciones de los overlays según la orientación
        let overlayPositions;
        const orientation = userData.intersectionData?.orientation;

        if (orientation === 'vertical') {
            // Para verticales: un div a la izquierda y otro a la derecha
            // Calculamos los puntos laterales del objeto
            const leftPoint = worldPosition.clone();
            leftPoint.x -= objectDimensions.width / 2;
            const rightPoint = worldPosition.clone();
            rightPoint.x += objectDimensions.width / 2;

            const leftScreen = leftPoint.project(camera.clone());
            const rightScreen = rightPoint.project(camera.clone());

            const leftX = (leftScreen.x * 0.5 + 0.5) * rect.width;
            const leftY = (leftScreen.y * -0.5 + 0.5) * rect.height;
            const rightX = (rightScreen.x * 0.5 + 0.5) * rect.width;
            const rightY = (rightScreen.y * -0.5 + 0.5) * rect.height;

            overlayPositions = {
                primary: { x: leftX, y: leftY, placement: 'left' as const },
                secondary: { x: rightX, y: rightY, placement: 'right' as const }
            };
        } else {
            // Para horizontales: un div arriba y otro abajo
            const topPoint = worldPosition.clone();
            topPoint.y += objectDimensions.height / 2;
            const bottomPoint = worldPosition.clone();
            bottomPoint.y -= objectDimensions.height / 2;

            const topScreen = topPoint.project(camera.clone());
            const bottomScreen = bottomPoint.project(camera.clone());

            const topX = (topScreen.x * 0.5 + 0.5) * rect.width;
            const topY = (topScreen.y * -0.5 + 0.5) * rect.height;
            const bottomX = (bottomScreen.x * 0.5 + 0.5) * rect.width;
            const bottomY = (bottomScreen.y * -0.5 + 0.5) * rect.height;

            overlayPositions = {
                primary: { x: topX, y: topY, placement: 'top' as const },
                secondary: { x: bottomX, y: bottomY, placement: 'bottom' as const }
            };
        }

        setOverlayData({
            isIntersection: true,
            intersectionData: {
                ...userData.intersectionData,
                dimensions: objectDimensions
            },
            screenPosition: { x: centerX, y: centerY },
            overlayPositions
        });
    }, [refPiece, camera, canvas]);

    useEffect(() => {
        updateScreenPosition();
    }, [updateScreenPosition]);

    // Actualizar posición cuando la cámara se mueva
    useEffect(() => {
        if (!camera) return;

        const handleCameraChange = () => {
            updateScreenPosition();
        };

        // Si estás usando controles de cámara (como OrbitControls),
        // asegúrate de llamar a updateScreenPosition cuando la cámara cambie

        return () => {
            // Cleanup si es necesario
        };
    }, [camera, updateScreenPosition]);

    return overlayData;
};