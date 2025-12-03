import { useState, useEffect } from 'react';
import { Trash2, Play, CheckCircle2, XCircle, CircleDot, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutomaton } from '@/lib/automaton-context';
import { EPSILON } from '@shared/schema';

export function PropertiesPanel() {
  const {
    automaton,
    selectedElement,
    updateState,
    deleteState,
    setStartState,
    toggleAcceptState,
    updateTransition,
    deleteTransition,
    execution,
  } = useAutomaton();

  const selectedState = selectedElement?.type === 'state'
    ? automaton.states.find(s => s.id === selectedElement.id)
    : null;
  
  const selectedTransition = selectedElement?.type === 'transition'
    ? automaton.transitions.find(t => t.id === selectedElement.id)
    : null;

  const [stateName, setStateName] = useState('');
  const [transitionSymbols, setTransitionSymbols] = useState('');

  useEffect(() => {
    if (selectedState) {
      setStateName(selectedState.name);
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedTransition) {
      setTransitionSymbols(selectedTransition.symbols.join(', '));
    }
  }, [selectedTransition]);

  const handleStateNameChange = (name: string) => {
    setStateName(name);
    if (selectedState) {
      updateState(selectedState.id, { name });
    }
  };

  const handleSymbolsChange = (value: string) => {
    setTransitionSymbols(value);
    if (selectedTransition) {
      const symbols = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      if (symbols.length > 0) {
        updateTransition(selectedTransition.id, { symbols });
      }
    }
  };

  const fromState = selectedTransition
    ? automaton.states.find(s => s.id === selectedTransition.fromStateId)
    : null;
  const toState = selectedTransition
    ? automaton.states.find(s => s.id === selectedTransition.toStateId)
    : null;

  const currentStates = execution.currentStateIds
    .map(id => automaton.states.find(s => s.id === id))
    .filter(Boolean);

  const isTestMode = execution.status !== 'idle';

  if (isTestMode) {
    return (
      <div className="w-72 bg-sidebar border-l border-sidebar-border p-4 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Execution</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-sm">Status</Label>
              <div className="mt-1">
                {execution.status === 'running' && (
                  <Badge variant="secondary" className="gap-1">
                    <Play className="h-3 w-3" />
                    Running
                  </Badge>
                )}
                {execution.status === 'accepted' && (
                  <Badge className="gap-1 bg-green-600 text-white">
                    <CheckCircle2 className="h-3 w-3" />
                    Accepted
                  </Badge>
                )}
                {execution.status === 'rejected' && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Rejected
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground text-sm">Step</Label>
              <p className="text-2xl font-bold">{execution.step}</p>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground text-sm">Current State{currentStates.length > 1 ? 's' : ''}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentStates.length > 0 ? (
                  currentStates.map(state => (
                    <Badge key={state?.id} variant="outline" className="gap-1">
                      <CircleDot className="h-3 w-3" />
                      {state?.name}
                      {state?.isAccept && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No active state</span>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-muted-foreground text-sm">Input String</Label>
              <div className="mt-2 font-mono text-lg bg-card rounded-md p-3 border border-card-border">
                <span className="text-muted-foreground line-through">
                  {execution.processedInput}
                </span>
                {execution.remainingInput.length > 0 && (
                  <>
                    <span className="text-primary font-bold underline">
                      {execution.remainingInput[0]}
                    </span>
                    <span>{execution.remainingInput.slice(1)}</span>
                  </>
                )}
                {execution.remainingInput.length === 0 && execution.processedInput.length === 0 && (
                  <span className="text-muted-foreground italic">empty string</span>
                )}
              </div>
            </div>

            {execution.history.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-sm">History</Label>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {execution.history.map((step, i) => {
                      const fromStates = step.stateIds
                        .map(id => automaton.states.find(s => s.id === id)?.name)
                        .filter(Boolean);
                      return (
                        <div key={i} className="text-sm font-mono flex items-center gap-2">
                          <span className="text-muted-foreground">{i + 1}.</span>
                          <span>{fromStates.join(', ')}</span>
                          <ArrowRightCircle className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="secondary">{step.symbol}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedElement) {
    return (
      <div className="w-72 bg-sidebar border-l border-sidebar-border p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>
        <p className="text-muted-foreground text-sm">
          Select a state or transition to view and edit its properties.
        </p>
        
        {automaton.states.length === 0 && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Click the circle icon in the toolbar, then click on the canvas to add states.</p>
              <p>Click the arrow icon to create transitions between states.</p>
              <p>The first state you create will be the start state.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (selectedState) {
    return (
      <div className="w-72 bg-sidebar border-l border-sidebar-border p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">State Properties</h2>
        
        <div className="space-y-4 flex-1">
          <div>
            <Label htmlFor="state-name">Name</Label>
            <Input
              id="state-name"
              value={stateName}
              onChange={(e) => handleStateNameChange(e.target.value)}
              className="mt-1"
              data-testid="input-state-name"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Start State</Label>
              <p className="text-xs text-muted-foreground">Initial state of the automaton</p>
            </div>
            <Switch
              checked={selectedState.isStart}
              onCheckedChange={() => setStartState(selectedState.id)}
              data-testid="switch-start-state"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Accept State</Label>
              <p className="text-xs text-muted-foreground">Final/accepting state</p>
            </div>
            <Switch
              checked={selectedState.isAccept}
              onCheckedChange={() => toggleAcceptState(selectedState.id)}
              data-testid="switch-accept-state"
            />
          </div>

          <Separator />

          <div>
            <Label className="text-muted-foreground text-sm">Position</Label>
            <p className="text-sm font-mono">
              x: {Math.round(selectedState.x)}, y: {Math.round(selectedState.y)}
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          className="w-full gap-2 mt-4"
          onClick={() => deleteState(selectedState.id)}
          data-testid="button-delete-state"
        >
          <Trash2 className="h-4 w-4" />
          Delete State
        </Button>
      </div>
    );
  }

  if (selectedTransition) {
    return (
      <div className="w-72 bg-sidebar border-l border-sidebar-border p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Transition Properties</h2>
        
        <div className="space-y-4 flex-1">
          <div>
            <Label htmlFor="transition-symbols">Symbols (comma-separated)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="transition-symbols"
                value={transitionSymbols}
                onChange={(e) => handleSymbolsChange(e.target.value)}
                placeholder="a, b, c"
                className="font-mono flex-1"
                data-testid="input-transition-symbols"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const hasEpsilon = transitionSymbols.includes(EPSILON);
                  if (!hasEpsilon) {
                    const newSymbols = transitionSymbols.length > 0 
                      ? `${transitionSymbols}, ${EPSILON}` 
                      : EPSILON;
                    handleSymbolsChange(newSymbols);
                  }
                }}
                title="Add epsilon transition (empty string)"
                data-testid="button-add-epsilon"
              >
                <span className="text-lg font-serif">{EPSILON}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use {EPSILON} for epsilon (empty) transitions
            </p>
          </div>

          <Separator />

          <div>
            <Label className="text-muted-foreground text-sm">From</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="gap-1">
                <CircleDot className="h-3 w-3" />
                {fromState?.name || 'Unknown'}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground text-sm">To</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="gap-1">
                <CircleDot className="h-3 w-3" />
                {toState?.name || 'Unknown'}
                {toState?.isAccept && (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                )}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          variant="destructive"
          className="w-full gap-2 mt-4"
          onClick={() => deleteTransition(selectedTransition.id)}
          data-testid="button-delete-transition"
        >
          <Trash2 className="h-4 w-4" />
          Delete Transition
        </Button>
      </div>
    );
  }

  return null;
}
