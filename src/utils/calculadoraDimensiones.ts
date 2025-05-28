type DimensionesParams = {
    width: number;
    height: number;
    depth: number;
    espesor: number;
    sueloDentro: boolean;
    techoDentro: boolean;
    traseroDentro: boolean;
    retranqueoTrasero: number;
    retranquearSuelo: boolean;
    esquinaXTriangulada: boolean;
    esquinaZTriangulada: boolean;
};

export const calcularDimensiones = ({
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
                                        esquinaZTriangulada
                                    }: DimensionesParams) => {
    const offsetDepthTraseroDentro = traseroDentro ? depth : depth - espesor;

    return {
        suelo: {
            width: sueloDentro ? width - espesor * 2 : width,
            height: espesor,
            depth:
                (sueloDentro ? offsetDepthTraseroDentro : depth) -
                (retranquearSuelo ? retranqueoTrasero - espesor + (espesor % 2) : 0),
        },
        techo: {
            width: techoDentro ? width - espesor * 2 : width,
            height: espesor,
            depth: techoDentro ? offsetDepthTraseroDentro : depth,
        },
        lateral: {
            width: espesor,
            height:
                height -
                (sueloDentro ? 0 : espesor) -
                (techoDentro ? 0 : espesor) -
                (esquinaZTriangulada && esquinaXTriangulada ? espesor : 0),
            depth: offsetDepthTraseroDentro,
        },
        trasero: {
            width: traseroDentro ? width - espesor * 2 : width,
            height:
                height -
                (sueloDentro ? (traseroDentro ? espesor : 0) : espesor) -
                (techoDentro ? (traseroDentro ? espesor : 0) : espesor),
            depth: espesor,
        },
    };
};