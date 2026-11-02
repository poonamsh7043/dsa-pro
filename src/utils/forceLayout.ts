import { GraphNode, GraphEdge, NodePosition } from '../types/graph';

export interface ForceSimulationOptions {
  is2D?: boolean;
  repulsion?: number;
  springLength?: number;
  springStrength?: number;
  centerStrength?: number;
  damping?: number;
}

export function stepForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  options: ForceSimulationOptions = {}
): GraphNode[] {
  const {
    is2D = false,
    repulsion = 4.5,
    springLength = 2.4,
    springStrength = 0.08,
    centerStrength = 0.03,
    damping = 0.82,
  } = options;

  const nodeCount = nodes.length;
  if (nodeCount <= 1) return nodes;

  // Initialize forces
  const forces: Record<string, NodePosition> = {};
  nodes.forEach((n) => {
    forces[n.id] = { x: 0, y: 0, z: 0 };
  });

  // Repulsive force (Coulomb's Law)
  for (let i = 0; i < nodeCount; i++) {
    const n1 = nodes[i];
    for (let j = i + 1; j < nodeCount; j++) {
      const n2 = nodes[j];

      let dx = n1.position.x - n2.position.x;
      let dy = n1.position.y - n2.position.y;
      let dz = is2D ? 0 : n1.position.z - n2.position.z;

      let distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < 0.001) {
        dx = (Math.random() - 0.5) * 0.1;
        dy = (Math.random() - 0.5) * 0.1;
        dz = (Math.random() - 0.5) * 0.1;
        distSq = dx * dx + dy * dy + dz * dz;
      }

      const dist = Math.sqrt(distSq);
      // Force ~ repulsion / (dist^2)
      const forceMag = Math.min(repulsion / (distSq + 0.1), 3.0);
      const fx = (dx / dist) * forceMag;
      const fy = (dy / dist) * forceMag;
      const fz = is2D ? 0 : (dz / dist) * forceMag;

      forces[n1.id].x += fx;
      forces[n1.id].y += fy;
      forces[n1.id].z += fz;

      forces[n2.id].x -= fx;
      forces[n2.id].y -= fy;
      forces[n2.id].z -= fz;
    }
  }

  // Attractive spring force (Hooke's Law)
  edges.forEach((edge) => {
    const n1 = nodes.find((n) => n.id === edge.source);
    const n2 = nodes.find((n) => n.id === edge.target);
    if (!n1 || !n2) return;

    let dx = n2.position.x - n1.position.x;
    let dy = n2.position.y - n1.position.y;
    let dz = is2D ? 0 : n2.position.z - n1.position.z;

    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
    const displacement = dist - springLength;
    const forceMag = displacement * springStrength;

    const fx = (dx / dist) * forceMag;
    const fy = (dy / dist) * forceMag;
    const fz = is2D ? 0 : (dz / dist) * forceMag;

    forces[n1.id].x += fx;
    forces[n1.id].y += fy;
    forces[n1.id].z += fz;

    forces[n2.id].x -= fx;
    forces[n2.id].y -= fy;
    forces[n2.id].z -= fz;
  });

  // Center gravity force
  nodes.forEach((n) => {
    forces[n.id].x -= n.position.x * centerStrength;
    forces[n.id].y -= n.position.y * centerStrength;
    if (!is2D) {
      forces[n.id].z -= n.position.z * centerStrength;
    }
  });

  // Apply velocity & positions with damping
  return nodes.map((node) => {
    if (node.isFixed) {
      return node;
    }
    const currentVel = node.velocity || { x: 0, y: 0, z: 0 };
    const f = forces[node.id] || { x: 0, y: 0, z: 0 };

    const vx = (currentVel.x + f.x) * damping;
    const vy = (currentVel.y + f.y) * damping;
    const vz = is2D ? 0 : (currentVel.z + f.z) * damping;

    // Cap velocity to prevent runaway
    const maxV = 0.4;
    const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const scale = speed > maxV ? maxV / speed : 1;

    const newX = node.position.x + vx * scale;
    const newY = node.position.y + vy * scale;
    const newZ = is2D ? 0 : node.position.z + vz * scale;

    return {
      ...node,
      position: {
        x: Number(newX.toFixed(3)),
        y: Number(newY.toFixed(3)),
        z: Number(newZ.toFixed(3)),
      },
      velocity: {
        x: vx * scale,
        y: vy * scale,
        z: vz * scale,
      },
    };
  });
}
