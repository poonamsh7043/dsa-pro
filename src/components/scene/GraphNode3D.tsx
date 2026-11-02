import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GraphNode } from '../../types/graph';
import { useGraphStore } from '../../store/graphStore';
import { getColorDef, getNodeBorderColor, getNodeFillColor, getNodeTextColor } from '../../utils/colors';

interface GraphNode3DProps {
  node: GraphNode;
  isActive: boolean;
  isNeighbor: boolean;
  isConflicting: boolean;
  isBacktracking: boolean;
  colorIndex: number | null | undefined;
}

export const GraphNode3D: React.FC<GraphNode3DProps> = ({
  node,
  isActive,
  isNeighbor,
  isConflicting,
  isBacktracking,
  colorIndex,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const isColorMode = useGraphStore((s) => s.isColorMode);
  const is2D = useGraphStore((s) => s.is2D);
  const editorMode = useGraphStore((s) => s.editorMode);
  const edgeStartNodeId = useGraphStore((s) => s.edgeStartNodeId);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);

  const updateNodePosition = useGraphStore((s) => s.updateNodePosition);
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId);
  const startAddEdge = useGraphStore((s) => s.startAddEdge);
  const completeAddEdge = useGraphStore((s) => s.completeAddEdge);
  const deleteVertex = useGraphStore((s) => s.deleteVertex);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Drag plane calculation
  const dragPlane = useMemo(() => new THREE.Plane(), []);
  const dragOffset = useRef(new THREE.Vector3());
  const planeIntersection = useRef(new THREE.Vector3());

  // Shake offset for conflict and backtracking
  const shakeRef = useRef(0);
  const targetScale = useRef(1.0);
  const currentScale = useRef(1.0);

  const colorDef = getColorDef(colorIndex);
  const targetFillHex = getNodeFillColor(colorIndex, isColorMode);
  const targetBorderHex = getNodeBorderColor(colorIndex, isColorMode);
  const currentFill = useRef(new THREE.Color(targetFillHex));

  // Determine selection / edge-creation states
  const isSelected = selectedNodeId === node.id;
  const isEdgeStart = edgeStartNodeId === node.id;

  useFrame(({ clock }, delta) => {
    // Smooth color transition
    const destColor = new THREE.Color(targetFillHex);
    currentFill.current.lerp(destColor, Math.min(delta * 10, 0.4));
    if (meshRef.current && (meshRef.current.material as THREE.MeshStandardMaterial)) {
      (meshRef.current.material as THREE.MeshStandardMaterial).color.copy(currentFill.current);
    }

    // Scale spring animation
    let s = 1.0;
    if (isActive) s = 1.25;
    else if (isNeighbor) s = 1.1;
    else if (isSelected) s = 1.18;
    else if (isHovered) s = 1.12;

    targetScale.current = s;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, delta * 12);

    if (meshRef.current) {
      // Shaking animation for conflict or backtrack
      let shakeX = 0;
      let shakeY = 0;
      if (isConflicting || isBacktracking) {
        shakeRef.current += delta * 35;
        const amp = isConflicting ? 0.08 : 0.05;
        shakeX = Math.sin(shakeRef.current) * amp;
        shakeY = Math.cos(shakeRef.current * 1.3) * amp;
      } else {
        shakeRef.current = 0;
      }

      meshRef.current.position.set(
        node.position.x + shakeX,
        node.position.y + shakeY,
        is2D ? 0 : node.position.z
      );
      meshRef.current.scale.setScalar(currentScale.current);
    }

    // Halo pulse ring
    if (ringRef.current) {
      if (isActive || isSelected) {
        const pulse = 1.25 + Math.sin(clock.getElapsedTime() * 4.5) * 0.12;
        ringRef.current.scale.set(pulse, pulse, pulse);
        ringRef.current.rotation.z += delta * 1.5;
        ringRef.current.rotation.x += delta * 0.8;
      }
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();

    if (editorMode === 'delete') {
      deleteVertex(node.id);
      return;
    }

    if (editorMode === 'add-edge') {
      if (!edgeStartNodeId) {
        startAddEdge(node.id);
      } else {
        completeAddEdge(node.id);
      }
      return;
    }

    // Drag start
    setIsDragging(true);
    setSelectedNodeId(node.id);

    // Set drag plane parallel to camera through node position
    const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
    dragPlane.setFromNormalAndCoplanarPoint(
      normal,
      new THREE.Vector3(node.position.x, node.position.y, is2D ? 0 : node.position.z)
    );

    // Compute offset
    if (e.ray.intersectPlane(dragPlane, planeIntersection.current)) {
      dragOffset.current
        .set(node.position.x, node.position.y, is2D ? 0 : node.position.z)
        .sub(planeIntersection.current);
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();

    if (e.ray.intersectPlane(dragPlane, planeIntersection.current)) {
      const newPos = planeIntersection.current.add(dragOffset.current);
      updateNodePosition(node.id, newPos.x, newPos.y, is2D ? 0 : newPos.z);
    }
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging) {
      e.stopPropagation();
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture release safety
      }
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[node.position.x, node.position.y, is2D ? 0 : node.position.z]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
        }}
        castShadow
        receiveShadow
      >
        {/* Icosahedron geometry gives crisp geometric facets */}
        <icosahedronGeometry args={[0.42, 2]} />
        <meshStandardMaterial
          roughness={0.25}
          metalness={0.2}
          color={targetFillHex}
          emissive={
            isConflicting
              ? '#ffffff'
              : isActive
              ? '#ffffff'
              : isNeighbor
              ? '#666666'
              : isSelected
              ? '#888888'
              : '#000000'
          }
          emissiveIntensity={isConflicting ? 0.9 : isActive ? 0.45 : isNeighbor ? 0.25 : 0}
        />

        {/* Outer wireframe shell for high aesthetic monochrome definition */}
        <lineSegments>
          <wireframeGeometry args={[new THREE.IcosahedronGeometry(0.425, 1)]} />
          <lineBasicMaterial
            color={isConflicting ? '#ffffff' : isActive ? '#ffffff' : targetBorderHex}
            linewidth={1}
            transparent
            opacity={0.7}
          />
        </lineSegments>

        {/* Pulsing White Halo Ring when Active or Selected */}
        {(isActive || isSelected || isEdgeStart) && (
          <mesh ref={ringRef}>
            <ringGeometry args={[0.56, 0.62, 32]} />
            <meshBasicMaterial
              color="#ffffff"
              side={THREE.DoubleSide}
              transparent
              opacity={isActive ? 0.85 : 0.6}
            />
          </mesh>
        )}

        {/* HTML Camera-Facing Label */}
        <Html
          position={[0, 0.62, 0]}
          center
          distanceFactor={10}
          className="pointer-events-none select-none"
        >
          <div
            className={`flex flex-col items-center transition-transform duration-200 ${
              isHovered || isActive ? 'scale-110' : 'scale-100'
            }`}
          >
            {/* Status badges */}
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm border backdrop-blur-md shadow-lg ${
                isConflicting
                  ? 'bg-white text-black border-white animate-shake'
                  : isActive
                  ? 'bg-white text-black border-white ring-2 ring-white/50'
                  : isNeighbor
                  ? 'bg-mono-900/90 text-white border-mono-500'
                  : 'bg-black/85 text-mono-200 border-mono-700'
              }`}
            >
              <span className="font-mono font-bold text-xs tracking-tight">{node.label}</span>

              {colorDef && (
                <span
                  className="flex items-center gap-0.5 px-1 py-0.2 rounded-sm text-[10px] font-mono font-semibold"
                  style={{
                    backgroundColor: isColorMode ? colorDef.colorFill : colorDef.monoFill,
                    color: getNodeTextColor(colorIndex, isColorMode),
                  }}
                >
                  <span>{colorDef.symbol}</span>
                  <span>{colorDef.label}</span>
                </span>
              )}

              {/* Conflict / Backtrack indicator marker */}
              {isConflicting && (
                <span className="font-mono font-black text-xs text-black">✖</span>
              )}
              {isBacktracking && (
                <span className="font-mono font-bold text-[10px] text-white bg-black px-0.5">↺</span>
              )}
            </div>
          </div>
        </Html>
      </mesh>
    </group>
  );
};
