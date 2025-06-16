export enum Orientacion {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
}

export interface Posicion {
    x: number;
    y: number;
}

export default class InterseccionMueble {
    position: Posicion;
    orientation: Orientacion;
    previsualization: boolean;
    piezasAdyacientes?: InterseccionMueble[];
    piezasLimitantes?: InterseccionMueble[];
    createdAt: Date;

    constructor(position: Posicion, orientation: Orientacion, previsualization?: boolean, createdAt?: Date, piezasAdyacientes?: InterseccionMueble[], piezasLimitantes?: InterseccionMueble[]) {
        this.position = position;
        this.orientation = orientation;
        this.previsualization = previsualization ?? false;
        this.createdAt = createdAt ?? new Date();
        this.piezasAdyacientes = piezasAdyacientes ?? null;
        this.piezasLimitantes = piezasLimitantes ?? null;
    }
}