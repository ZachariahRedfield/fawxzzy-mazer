import { describe, expect, test } from 'vitest';

import { createDemoWalkerState, stepDemoWalker } from '../../src/domain/ai';
import { generateMaze } from '../../src/domain/maze';

const config = {
  scale: 20,
  seed: 22,
  checkPointModifier: 0.3,
  shortcutCountModifier: 0.15
};

describe('demo walker', () => {
  test('explores walkable floor tiles and eventually loops', () => {
    const maze = generateMaze(config);
    let state = createDemoWalkerState(maze);

    let sawBacktrack = false;
    let sawGoal = false;
    const maxSteps = 6000;

    for (let i = 0; i < maxSteps; i += 1) {
      const prevTrailLength = state.trailIndices.length;
      state = stepDemoWalker(maze, state);

      expect(maze.tiles[state.currentIndex].floor).toBe(true);

      if (state.trailIndices.length < prevTrailLength) {
        sawBacktrack = true;
      }

      if (state.reachedGoal) {
        sawGoal = true;
      }

      if (state.loops > 0) {
        break;
      }
    }

    expect(sawBacktrack).toBe(true);
    expect(sawGoal).toBe(true);
    expect(state.loops).toBeGreaterThan(0);
    expect(state.currentIndex).toBe(maze.startIndex);
  });
});
