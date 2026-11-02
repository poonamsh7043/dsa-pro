import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGraphStore } from '../../store/graphStore';

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const is2D = useGraphStore((s) => s.is2D);
  const cameraResetTrigger = useGraphStore((s) => s.cameraResetTrigger);
  const cameraFocusNodeId = useGraphStore((s) => s.cameraFocusNodeId);
  const nodes = useGraphStore((s) => s.nodes);

  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 8.5));
  const isTransitioning = useRef(false);

  // Handle Camera Reset and 2D mode changes
  useEffect(() => {
    if (is2D) {
      targetCamPos.current.set(0, 0, 8.2);
      targetLookAt.current.set(0, 0, 0);
    } else {
      targetCamPos.current.set(0, 2.5, 7.8);
      targetLookAt.current.set(0, 0, 0);
    }
    isTransitioning.current = true;
  }, [cameraResetTrigger, is2D]);

  // Gentle focus on active node if requested
  useEffect(() => {
    if (cameraFocusNodeId) {
      const node = nodes.find((n) => n.id === cameraFocusNodeId);
      if (node) {
        targetLookAt.current.set(node.position.x * 0.4, node.position.y * 0.4, is2D ? 0 : node.position.z * 0.4);
        isTransitioning.current = true;
      }
    }
  }, [cameraFocusNodeId, nodes, is2D]);

  useFrame((_, delta) => {
    if (isTransitioning.current && controlsRef.current) {
      const lerpSpeed = Math.min(delta * 4, 0.2);
      camera.position.lerp(targetCamPos.current, lerpSpeed);
      controlsRef.current.target.lerp(targetLookAt.current, lerpSpeed);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(targetCamPos.current) < 0.05 &&
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.05
      ) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={!is2D}
      enablePan={true}
      enableZoom={true}
      minDistance={2.5}
      maxDistance={25}
      dampingFactor={0.08}
      enableDamping
    />
  );
};
