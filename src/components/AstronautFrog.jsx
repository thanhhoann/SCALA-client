import { useAnimations, useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import { Color, LoopOnce, MeshStandardMaterial } from "three";
import { SkeletonUtils } from "three-stdlib";

export function AstronautFrog({
  color = "black",
  animation = "Idle",
  ...props
}) {
  const group = useRef();
  const { scene, materials, animations } = useGLTF(
    "/models/Astronaut_FinnTheFrog.gltf",
  );
  // Skinned meshes cannot be re-used in threejs without cloning them
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  // useGraph creates two flat object collections for nodes and materials
  const { nodes } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  if (actions["Death"]) {
    actions["Death"].loop = LoopOnce;
    actions["Death"].clampWhenFinished = true;
  }

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.2).play();
    return () => actions[animation]?.fadeOut(0.2);
  }, [animation]);

  const playerColorMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(color),
      }),
    [color],
  );
  useEffect(() => {
    // ASSIGNING CHARACTER COLOR
    nodes.Body.traverse((child) => {
      if (child.isMesh && child.material.name === "Atlas") {
        child.material = playerColorMaterial;
      }
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    nodes.Head.traverse((child) => {
      if (child.isMesh && child.material.name === "Atlas") {
        child.material = playerColorMaterial;
      }
    });
    clone.traverse((child) => {
      if (child.isMesh && child.material.name === "Atlas") {
        child.material = playerColorMaterial;
      }
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
  }, [nodes, clone]);

  return (
    <group ref={group} {...props} dispose={null} scale={0.7}>
      <group name="Scene">
        <group name="CharacterArmature">
          <skinnedMesh
            name="FinnTheFrog"
            geometry={nodes.FinnTheFrog.geometry}
            material={materials.Atlas}
            skeleton={nodes.FinnTheFrog.skeleton}
          />
          <primitive object={nodes.Root} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/Astronaut_FinnTheFrog.gltf");
