import {Object3D, MathUtils} from "three";

export enum Orientacion {
    Vertical = 'vertical',
    Horizontal = 'horizontal',
}

export interface Posicion {
    x: number;
    y: number;
}

export default class InterseccionMueble {
    uuid : string;
    position: Posicion;
    orientation: Orientacion;
    previsualization: boolean;
    createdAt: Date;
    adyacentTop?: Object3D;
    adyacentBottom?: Object3D;
    adyacentLeft?: Object3D;
    adyacentRight?: Object3D;

    constructor(position: Posicion, orientation: Orientacion, previsualization?: boolean, createdAt?: Date) {
        this.position = position;
        this.orientation = orientation;
        this.previsualization = previsualization ?? false;
        this.createdAt = createdAt ?? new Date();
    }

}