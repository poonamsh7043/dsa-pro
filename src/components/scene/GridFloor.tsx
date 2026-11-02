import React from 'react';
import { Grid } from '@react-three/drei';

export const GridFloor: React.FC = () => {
  return (
    <group position={[0, -3.2, 0]}>
      <Grid
        position={[0, 0, 0]}
        args={[30, 30]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#171717"
        sectionSize={2.4}
        sectionThickness={1.2}
        sectionColor="#2a2a2a"
        fadeDistance={22}
        fadeStrength={1.5}
        followCamera={false}
        infiniteGrid
      />
    </group>
  );
};
