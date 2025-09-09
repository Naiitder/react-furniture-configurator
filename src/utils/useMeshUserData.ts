import { useEffect, useRef } from "react";
import * as THREE from "three";

export type AnyObj3D = THREE.Object3D | THREE.Mesh | null;
export type AnyRef<T extends AnyObj3D = AnyObj3D> = React.MutableRefObject<T>;

export function useMeshUserData<T extends object>(
    ref: AnyRef,
    initial: T,
    deps: React.DependencyList = []
) {
    const initialized = useRef(false);
    
    useEffect(() => {
        if (!ref.current) return;
        if (!initialized.current) {
            ref.current.userData = { ...(ref.current.userData ?? {}), ...initial };
            initialized.current = true;
        }
    }, []);

    useEffect(() => {
        if (!ref.current) return;
        ref.current.userData = { ...(ref.current.userData ?? {}), ...initial };
    }, deps);
}
