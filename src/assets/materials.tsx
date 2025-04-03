// hooks/useWoodMaterial.ts
import { useGLTF } from '@react-three/drei'

export const useWoodMaterial = () => {
    const { materials } = useGLTF('./models/OakWood.glb')
    return materials
}

useGLTF.preload('./models/OakWood.glb')