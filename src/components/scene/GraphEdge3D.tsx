import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GraphEdge, GraphNode } from '../../types/graph';
import { useGraphStore } from '../../store/graphStore';

interface GraphEdge3DProps {
  edge: GraphEdge;
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
  isActive: boolean;
  isConflicting: boolean;
}

export const GraphEdge3D: React.FC<GraphEdge3DProps> = ({
  edge,
  sourceNode,
  targetNode,
  isActive,
  isConflicting,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const is2D = useGraphStore((s) => s.is2D);
  const editorMode = useGraphStore((s) => s.editorMode);
  const deleteEdge = useGraphStore((s) => s.deleteEdge);

  const [pos, rot, len] = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return [new THREE.Vector3(0, 0, 0), new THREE.Euler(0, 0, 0), 1];
    }

    const p1 = new THREE.Vector3(
      sourceNode.position.x,
      sourceNode.position.y,
      is2D ? 0 : sourceNode.position.z
    );
    const p2 = new THREE.Vector3(
      targetNode.position.x,
      targetNode.position.y,
      is2D ? 0 : targetNode.position.z
    );

    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const distance = p1.distanceTo(p2);

    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const euler = new THREE.Euler().setFromQuaternion(quaternion);

    return [mid, euler, distance];
  }, [sourceNode, targetNode, is2D]);

  useFrame(({ clock }) => {
    if (meshRef.current && (isActive || isConflicting)) {
      const pulse = Math.sin(clock.getElapsedTime() * 8) * 0.5 + 0.5;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = isConflicting ? 0.8 + pulse * 0.4 : 0.4 + pulse * 0.3;
      }
    }
  });

  if (!sourceNode || !targetNode) return null;

  const radius = isConflicting ? 0.05 : isActive ? 0.038 : 0.018;

  return (
    <mesh
      ref={meshRef}
      position={pos}
      rotation={rot}
      onClick={(e) => {
        if (editorMode === 'delete') {
          e.stopPropagation();
          deleteEdge(edge.id);
        }
      }}
    >
      <cylinderGeometry args={[radius, radius, len, 8]} />
      <meshStandardMaterial
        color={isConflicting ? '#ffffff' : isActive ? '#e5e5e5' : '#383838'}
        emissive={isConflicting ? '#ffffff' : isActive ? '#ffffff' : '#000000'}
        emissiveIntensity={isConflicting ? 0.9 : isActive ? 0.5 : 0}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
};
