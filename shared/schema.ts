import { z } from "zod";

export const EPSILON = 'ε';

export const stateSchema = z.object({
  id: z.string(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  isStart: z.boolean(),
  isAccept: z.boolean(),
});

export const transitionSchema = z.object({
  id: z.string(),
  fromStateId: z.string(),
  toStateId: z.string(),
  symbols: z.array(z.string()),
});

export const automatonSchema = z.object({
  id: z.string(),
  name: z.string(),
  states: z.array(stateSchema),
  transitions: z.array(transitionSchema),
});

export const insertAutomatonSchema = automatonSchema.omit({ id: true });

export type State = z.infer<typeof stateSchema>;
export type Transition = z.infer<typeof transitionSchema>;
export type Automaton = z.infer<typeof automatonSchema>;
export type InsertAutomaton = z.infer<typeof insertAutomatonSchema>;

export type ExecutionState = {
  currentStateIds: string[];
  remainingInput: string;
  processedInput: string;
  step: number;
  status: 'idle' | 'running' | 'accepted' | 'rejected';
  history: { stateIds: string[]; symbol: string; transitionIds: string[] }[];
};

export type EditorMode = 'select' | 'addState' | 'addTransition' | 'test';

export type SelectedElement = 
  | { type: 'state'; id: string }
  | { type: 'transition'; id: string }
  | null;
