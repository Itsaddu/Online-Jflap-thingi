import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { State, Transition, Automaton, ExecutionState, EditorMode, SelectedElement } from '@shared/schema';
import { EPSILON } from '@shared/schema';

interface AutomatonContextType {
  automaton: Automaton;
  setAutomaton: (automaton: Automaton) => void;
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  selectedElement: SelectedElement;
  setSelectedElement: (element: SelectedElement) => void;
  execution: ExecutionState;
  setExecution: (execution: ExecutionState) => void;
  transitionStart: string | null;
  setTransitionStart: (id: string | null) => void;
  
  addState: (x: number, y: number) => void;
  updateState: (id: string, updates: Partial<State>) => void;
  deleteState: (id: string) => void;
  setStartState: (id: string) => void;
  toggleAcceptState: (id: string) => void;
  
  addTransition: (fromId: string, toId: string, symbols: string[]) => void;
  updateTransition: (id: string, updates: Partial<Transition>) => void;
  deleteTransition: (id: string) => void;
  
  testString: (input: string) => void;
  stepForward: () => void;
  stepBackward: () => void;
  resetExecution: () => void;
  
  clearCanvas: () => void;
  newAutomaton: () => void;
}

const AutomatonContext = createContext<AutomatonContextType | null>(null);

const generateId = () => Math.random().toString(36).substring(2, 9);

const STORAGE_KEY = 'automaton-lab-current';

const createEmptyAutomaton = (): Automaton => ({
  id: generateId(),
  name: 'Untitled Automaton',
  states: [],
  transitions: [],
});

const loadFromStorage = (): Automaton => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
  }
  return createEmptyAutomaton();
};

const saveToStorage = (automaton: Automaton) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(automaton));
  } catch {
  }
};

const createInitialExecution = (): ExecutionState => ({
  currentStateIds: [],
  remainingInput: '',
  processedInput: '',
  step: 0,
  status: 'idle',
  history: [],
});

export function AutomatonProvider({ children }: { children: ReactNode }) {
  const [automaton, setAutomatonState] = useState<Automaton>(loadFromStorage);
  const [mode, setMode] = useState<EditorMode>('select');
  const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
  const [execution, setExecution] = useState<ExecutionState>(createInitialExecution);
  const [transitionStart, setTransitionStart] = useState<string | null>(null);

  const setAutomaton = useCallback((newAutomaton: Automaton | ((prev: Automaton) => Automaton)) => {
    setAutomatonState(prev => {
      const updated = typeof newAutomaton === 'function' ? newAutomaton(prev) : newAutomaton;
      saveToStorage(updated);
      return updated;
    });
  }, []);

  const addState = useCallback((x: number, y: number) => {
    const stateNumber = automaton.states.length;
    const newState: State = {
      id: generateId(),
      name: `q${stateNumber}`,
      x,
      y,
      isStart: automaton.states.length === 0,
      isAccept: false,
    };
    setAutomaton(prev => ({
      ...prev,
      states: [...prev.states, newState],
    }));
    setSelectedElement({ type: 'state', id: newState.id });
    setMode('select');
  }, [automaton.states.length]);

  const updateState = useCallback((id: string, updates: Partial<State>) => {
    setAutomaton(prev => ({
      ...prev,
      states: prev.states.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteState = useCallback((id: string) => {
    setAutomaton(prev => ({
      ...prev,
      states: prev.states.filter(s => s.id !== id),
      transitions: prev.transitions.filter(t => t.fromStateId !== id && t.toStateId !== id),
    }));
    setSelectedElement(null);
  }, []);

  const setStartState = useCallback((id: string) => {
    setAutomaton(prev => ({
      ...prev,
      states: prev.states.map(s => ({ ...s, isStart: s.id === id })),
    }));
  }, []);

  const toggleAcceptState = useCallback((id: string) => {
    setAutomaton(prev => ({
      ...prev,
      states: prev.states.map(s => 
        s.id === id ? { ...s, isAccept: !s.isAccept } : s
      ),
    }));
  }, []);

  const addTransition = useCallback((fromId: string, toId: string, symbols: string[]) => {
    const existingTransition = automaton.transitions.find(
      t => t.fromStateId === fromId && t.toStateId === toId
    );
    
    if (existingTransition) {
      const newSymbols = Array.from(new Set([...existingTransition.symbols, ...symbols]));
      setAutomaton(prev => ({
        ...prev,
        transitions: prev.transitions.map(t =>
          t.id === existingTransition.id ? { ...t, symbols: newSymbols } : t
        ),
      }));
      setSelectedElement({ type: 'transition', id: existingTransition.id });
    } else {
      const newTransition: Transition = {
        id: generateId(),
        fromStateId: fromId,
        toStateId: toId,
        symbols: symbols.length > 0 ? symbols : ['a'],
      };
      setAutomaton(prev => ({
        ...prev,
        transitions: [...prev.transitions, newTransition],
      }));
      setSelectedElement({ type: 'transition', id: newTransition.id });
    }
    setMode('select');
  }, [automaton.transitions]);

  const updateTransition = useCallback((id: string, updates: Partial<Transition>) => {
    setAutomaton(prev => ({
      ...prev,
      transitions: prev.transitions.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTransition = useCallback((id: string) => {
    setAutomaton(prev => ({
      ...prev,
      transitions: prev.transitions.filter(t => t.id !== id),
    }));
    setSelectedElement(null);
  }, []);

  const getEpsilonClosure = useCallback((stateIds: string[]): { stateIds: string[]; transitionIds: string[] } => {
    const closure = new Set(stateIds);
    const transitionIds: string[] = [];
    const stack = [...stateIds];
    
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const epsilonTransitions = automaton.transitions.filter(
        t => t.fromStateId === currentId && t.symbols.includes(EPSILON)
      );
      
      for (const t of epsilonTransitions) {
        if (!closure.has(t.toStateId)) {
          closure.add(t.toStateId);
          stack.push(t.toStateId);
        }
        if (!transitionIds.includes(t.id)) {
          transitionIds.push(t.id);
        }
      }
    }
    
    return { stateIds: Array.from(closure), transitionIds };
  }, [automaton.transitions]);

  const getNextStates = useCallback((currentIds: string[], symbol: string): { stateIds: string[]; transitionIds: string[] } => {
    const nextStateIds: string[] = [];
    const usedTransitionIds: string[] = [];
    
    for (const stateId of currentIds) {
      const transitions = automaton.transitions.filter(
        t => t.fromStateId === stateId && t.symbols.includes(symbol)
      );
      for (const t of transitions) {
        if (!nextStateIds.includes(t.toStateId)) {
          nextStateIds.push(t.toStateId);
        }
        usedTransitionIds.push(t.id);
      }
    }
    
    const epsilonResult = getEpsilonClosure(nextStateIds);
    const allStateIds = Array.from(new Set([...nextStateIds, ...epsilonResult.stateIds]));
    const allTransitionIds = [...usedTransitionIds, ...epsilonResult.transitionIds];
    
    return { stateIds: allStateIds, transitionIds: allTransitionIds };
  }, [automaton.transitions, getEpsilonClosure]);

  const testString = useCallback((input: string) => {
    const startState = automaton.states.find(s => s.isStart);
    if (!startState) {
      setExecution({
        currentStateIds: [],
        remainingInput: input,
        processedInput: '',
        step: 0,
        status: 'rejected',
        history: [],
      });
      return;
    }
    
    const initialClosure = getEpsilonClosure([startState.id]);
    
    if (input.length === 0) {
      const isAccepted = initialClosure.stateIds.some(id => {
        const state = automaton.states.find(s => s.id === id);
        return state?.isAccept;
      });
      setExecution({
        currentStateIds: initialClosure.stateIds,
        remainingInput: '',
        processedInput: '',
        step: 0,
        status: isAccepted ? 'accepted' : 'rejected',
        history: [],
      });
      setMode('test');
      return;
    }
    
    setExecution({
      currentStateIds: initialClosure.stateIds,
      remainingInput: input,
      processedInput: '',
      step: 0,
      status: 'running',
      history: [],
    });
    setMode('test');
  }, [automaton.states, getEpsilonClosure]);

  const stepForward = useCallback(() => {
    setExecution(prev => {
      if (prev.status !== 'running' || prev.remainingInput.length === 0) {
        const isAccepted = prev.currentStateIds.some(id => {
          const state = automaton.states.find(s => s.id === id);
          return state?.isAccept;
        });
        return {
          ...prev,
          status: isAccepted ? 'accepted' : 'rejected',
        };
      }
      
      const symbol = prev.remainingInput[0];
      const { stateIds, transitionIds } = getNextStates(prev.currentStateIds, symbol);
      
      const newHistory = [...prev.history, {
        stateIds: prev.currentStateIds,
        symbol,
        transitionIds,
      }];
      
      if (stateIds.length === 0) {
        return {
          ...prev,
          currentStateIds: [],
          processedInput: prev.processedInput + symbol,
          remainingInput: prev.remainingInput.slice(1),
          step: prev.step + 1,
          status: 'rejected',
          history: newHistory,
        };
      }
      
      const newRemainingInput = prev.remainingInput.slice(1);
      const isComplete = newRemainingInput.length === 0;
      const isAccepted = isComplete && stateIds.some(id => {
        const state = automaton.states.find(s => s.id === id);
        return state?.isAccept;
      });
      
      return {
        currentStateIds: stateIds,
        processedInput: prev.processedInput + symbol,
        remainingInput: newRemainingInput,
        step: prev.step + 1,
        status: isComplete ? (isAccepted ? 'accepted' : 'rejected') : 'running',
        history: newHistory,
      };
    });
  }, [automaton.states, getNextStates]);

  const stepBackward = useCallback(() => {
    setExecution(prev => {
      if (prev.step === 0 || prev.history.length === 0) return prev;
      
      const lastStep = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      
      return {
        currentStateIds: lastStep.stateIds,
        processedInput: prev.processedInput.slice(0, -1),
        remainingInput: lastStep.symbol + prev.remainingInput,
        step: prev.step - 1,
        status: 'running',
        history: newHistory,
      };
    });
  }, []);

  const resetExecution = useCallback(() => {
    setExecution(createInitialExecution());
    setMode('select');
  }, []);

  const clearCanvas = useCallback(() => {
    setAutomaton(prev => ({
      ...prev,
      states: [],
      transitions: [],
    }));
    setSelectedElement(null);
    resetExecution();
  }, [resetExecution]);

  const newAutomaton = useCallback(() => {
    setAutomaton(createEmptyAutomaton());
    setSelectedElement(null);
    resetExecution();
    setMode('select');
  }, [resetExecution]);

  return (
    <AutomatonContext.Provider
      value={{
        automaton,
        setAutomaton,
        mode,
        setMode,
        selectedElement,
        setSelectedElement,
        execution,
        setExecution,
        transitionStart,
        setTransitionStart,
        addState,
        updateState,
        deleteState,
        setStartState,
        toggleAcceptState,
        addTransition,
        updateTransition,
        deleteTransition,
        testString,
        stepForward,
        stepBackward,
        resetExecution,
        clearCanvas,
        newAutomaton,
      }}
    >
      {children}
    </AutomatonContext.Provider>
  );
}

export function useAutomaton() {
  const context = useContext(AutomatonContext);
  if (!context) {
    throw new Error('useAutomaton must be used within AutomatonProvider');
  }
  return context;
}
