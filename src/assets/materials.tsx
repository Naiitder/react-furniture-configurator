// hooks/useWoodMaterial.ts
import { useGLTF } from '@react-three/drei'

export const useMaterial = () => {
    const { materials } = useGLTF('./models/Materials.glb')
    return materials
}

useGLTF.preload('./models/Materials.glb')