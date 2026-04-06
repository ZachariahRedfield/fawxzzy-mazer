import type { MazeBuildResult } from '../maze';

export interface DemoWalkerState {
  currentIndex: number;
  trailIndices: number[];
  alternatives: number[];
  visited: Set<number>;
  loops: number;
  reachedGoal: boolean;
}

interface Candidate {
  index: number;
  score: number;
}

export const createDemoWalkerState = (maze: MazeBuildResult): DemoWalkerState => ({
  currentIndex: maze.startIndex,
  trailIndices: [maze.startIndex],
  alternatives: [],
  visited: new Set([maze.startIndex]),
  loops: 0,
  reachedGoal: false
});

const distanceSquaredToGoal = (maze: MazeBuildResult, index: number): number => {
  const tile = maze.tiles[index];
  const goal = maze.tiles[maze.endIndex];
  const dx = goal.x - tile.x;
  const dy = goal.y - tile.y;
  return (dx * dx) + (dy * dy);
};

const getWalkableNeighbors = (maze: MazeBuildResult, fromIndex: number): number[] => maze.tiles[fromIndex].neighbors
  .filter((neighborIndex) => neighborIndex !== -1 && maze.tiles[neighborIndex].floor) as number[];

const scoreCandidates = (maze: MazeBuildResult, neighbors: number[]): Candidate[] => neighbors
  .map((index) => ({
    index,
    score: distanceSquaredToGoal(maze, index) + Math.random() * 0.4
  }))
  .sort((a, b) => a.score - b.score);

const backtrack = (state: DemoWalkerState): number | null => {
  while (state.alternatives.length > 0) {
    const candidate = state.alternatives.pop();
    if (candidate !== undefined && !state.visited.has(candidate)) {
      return candidate;
    }
  }

  return null;
};

const resetLoop = (maze: MazeBuildResult, state: DemoWalkerState): DemoWalkerState => ({
  currentIndex: maze.startIndex,
  trailIndices: [maze.startIndex],
  alternatives: [],
  visited: new Set([maze.startIndex]),
  loops: state.loops + 1,
  reachedGoal: false
});

export const stepDemoWalker = (maze: MazeBuildResult, state: DemoWalkerState): DemoWalkerState => {
  if (state.reachedGoal) {
    return resetLoop(maze, state);
  }

  const neighbors = getWalkableNeighbors(maze, state.currentIndex);
  const unseenNeighbors = neighbors.filter((index) => !state.visited.has(index));

  if (unseenNeighbors.length > 0) {
    const scored = scoreCandidates(maze, unseenNeighbors);
    const [best, ...rest] = scored;
    const alternatives = [...state.alternatives, ...rest.map((item) => item.index)];
    const nextTrail = [...state.trailIndices, best.index];
    const nextVisited = new Set(state.visited);
    nextVisited.add(best.index);

    return {
      ...state,
      currentIndex: best.index,
      trailIndices: nextTrail,
      alternatives,
      visited: nextVisited,
      reachedGoal: best.index === maze.endIndex
    };
  }

  const candidate = backtrack(state);
  if (candidate !== null) {
    const branchStart = state.trailIndices.lastIndexOf(candidate);
    const backtrackedTrail = branchStart >= 0 ? state.trailIndices.slice(0, branchStart + 1) : [...state.trailIndices, candidate];

    return {
      ...state,
      currentIndex: candidate,
      trailIndices: backtrackedTrail
    };
  }

  return resetLoop(maze, state);
};
