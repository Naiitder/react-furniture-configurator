import {v4 as uuidv4} from 'uuid';

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
    createdAt: Date;

    constructor(position: Posicion, orientation: Orientacion, createdAt?: Date) {
        this.position = position;
        this.orientation = orientation;
        this.createdAt = createdAt ?? new Date();
    }
}