import React from "react";
import Casco from "../components/Casco/Casco.js";
import Aparador from "../components/Aparador/Aparador.js";
import Armario from "../components/Armario/Armario.js";
import Bodeguero from "../components/Armario/Bodeguero.js";

export const getItemComponents = (cascoInstances, handleCascoClick, version) => ({
    "Casco": (
        <>
            {Object.values(cascoInstances)
                .filter((casco) => ["casco1", "casco2", "casco3"].includes(casco.id))
                .map((casco) => (
                    <group key={casco.id}>
                        <Casco
                            key={casco.id}
                            id={casco.id}
                            position={casco.position}
                            rotation={casco.rotation}
                            {...casco.userData}
                            puertas={casco.puertas}
                            patas={casco.patas}
                            onClick={handleCascoClick}
                            version={version}
                            intersecciones={casco.intersecciones}
                        />
                    </group>
                ))}
        </>
    ),
    "Aparador": (
        <>
            {Object.values(cascoInstances)
                .filter((casco) => casco.id === "casco4")
                .map((casco) => (
                    <group key={casco.id}>
                        <Aparador
                            key={casco.id}
                            id={casco.id}
                            position={casco.position}
                            rotation={casco.rotation}
                            {...casco.userData}
                            patas={casco.patas}
                            puertas={casco.puertas}
                            onClick={handleCascoClick}
                            version={version}
                            indicePuerta={-1}
                            indicePata={0}
                        />
                    </group>
                ))}
        </>
    ),
    "Armario": (
        <>
            {Object.values(cascoInstances)
                .filter((casco) => casco.id === "casco5")
                .map((casco) => (
                    <group key={casco.id}>
                        <Armario
                            key={casco.id}
                            id={casco.id}
                            position={casco.position}
                            rotation={casco.rotation}
                            {...casco.userData}
                            intersecciones={casco.intersecciones}
                            patas={casco.patas}
                            puertas={casco.puertas}
                            onClick={handleCascoClick}
                            version={version}
                            indicePuerta={-1}
                            indicePata={0}
                        />
                    </group>
                ))}
        </>
    ),
    "Bodeguero": (
        <>
            {Object.values(cascoInstances)
                .filter((casco) => casco.id === "casco6")
                .map((casco) => (
                    <group key={casco.id}>
                        <Bodeguero
                            key={casco.id}
                            id={casco.id}
                            position={casco.position}
                            rotation={casco.rotation}
                            {...casco.userData}
                            intersecciones={casco.intersecciones}
                            patas={casco.patas}
                            puertas={casco.puertas}
                            onClick={handleCascoClick}
                            version={version}
                            indicePuerta={0}
                            indicePata={0}
                        />
                    </group>
                ))}
        </>
    ),
});