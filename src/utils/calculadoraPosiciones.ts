type PosicionesParams = DimensionesParams & {
    alturaPatas: number;
    indicePata: number;
    patas?: React.ReactNode[];
};

export const calcularPosiciones = ({
                                       width,
                                       height,
                                       depth,
                                       espesor,
                                       sueloDentro,
                                       techoDentro,
                                       traseroDentro,
                                       retranqueoTrasero,
                                       retranquearSuelo,
                                       esquinaXTriangulada,
                                       esquinaZTriangulada,
                                       alturaPatas,
                                       indicePata,
                                       patas
                                   }: PosicionesParams) => {
    const mitadAncho = width / 2;
    const mitadProfundidad = depth / 2;
    const extraAltura = patas && indicePata !== -1 ? alturaPatas : 0;

    const alturaLaterales =
        (height -
            (sueloDentro ? 0 : espesor) -
            (techoDentro ? 0 : espesor)) /
        2 +
        (sueloDentro ? 0 : espesor) -
        (esquinaZTriangulada && esquinaXTriangulada ? espesor / 2 : 0);

    return {
        suelo: [
            0,
            espesor / 2 + extraAltura,
            (sueloDentro && !traseroDentro ? espesor / 2 : 0) +
            (retranquearSuelo ? retranqueoTrasero / 2 : 0),
        ],
        techo: [
            0,
            height - espesor / 2 + extraAltura,
            techoDentro && esquinaZTriangulada
                ? 0
                : techoDentro && !traseroDentro
                    ? espesor / 2
                    : 0 - (esquinaZTriangulada && traseroDentro ? espesor / 2 : 0),
        ],
        izquierda: [
            -mitadAncho + espesor / 2,
            alturaLaterales + extraAltura,
            !traseroDentro ? espesor / 2 : 0,
        ],
        derecha: [
            mitadAncho - espesor / 2,
            alturaLaterales + extraAltura,
            !traseroDentro ? espesor / 2 : 0,
        ],
        trasero: [
            0,
            (height -
                (sueloDentro ? (traseroDentro ? espesor : 0) : espesor) -
                (techoDentro ? (traseroDentro ? espesor : 0) : espesor)) /
            2 +
            (sueloDentro ? (traseroDentro ? espesor : 0) : espesor) +
            extraAltura,
            -mitadProfundidad + espesor / 2 + (traseroDentro ? retranqueoTrasero : 0),
        ],
        puerta: [
            width / 2 - espesor * 2,
            height / 4 + extraAltura,
            depth / 2 + espesor / 2,
        ],
    };
};