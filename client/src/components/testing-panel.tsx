import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, FastForward, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAutomaton } from '@/lib/automaton-context';

export function TestingPanel() {
  const {
    automaton,
    execution,
    testString,
    stepForward,
    stepBackward,
    resetExecution,
    setMode,
  } = useAutomaton();

  const [inputString, setInputString] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState([500]);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const hasStartState = automaton.states.some(s => s.isStart);
  const hasStates = automaton.states.length > 0;
  const isTestMode = execution.status !== 'idle';
  const canStep = execution.status === 'running';

  useEffect(() => {
    if (autoPlay && canStep) {
      autoPlayRef.current = setTimeout(() => {
        stepForward();
      }, speed[0]);
    }
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [autoPlay, canStep, speed, stepForward, execution.step]);

  useEffect(() => {
    if (!canStep) {
      setAutoPlay(false);
    }
  }, [canStep]);

  const handleTest = () => {
    testString(inputString);
  };

  const handleReset = () => {
    setAutoPlay(false);
    resetExecution();
    setMode('select');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTestMode && hasStartState) {
      handleTest();
    }
  };

  return (
    <div className="bg-card border-t border-card-border">
      <div className="px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Label htmlFor="test-input" className="text-sm font-medium whitespace-nowrap">
            Test String:
          </Label>
          <Input
            id="test-input"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter input string..."
            className="max-w-xs font-mono"
            disabled={isTestMode}
            data-testid="input-test-string"
          />
          {!isTestMode ? (
            <Button
              onClick={handleTest}
              disabled={!hasStartState}
              className="gap-2"
              data-testid="button-test-string"
            >
              <Play className="h-4 w-4" />
              Test
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
              data-testid="button-reset-test"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {!hasStates && (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Add states to test
          </Badge>
        )}

        {hasStates && !hasStartState && (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Set a start state
          </Badge>
        )}

        {isTestMode && (
          <>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={stepBackward}
                disabled={execution.step === 0}
                data-testid="button-step-back"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant={autoPlay ? 'default' : 'ghost'}
                onClick={() => setAutoPlay(!autoPlay)}
                disabled={!canStep}
                data-testid="button-auto-play"
              >
                {autoPlay ? <Pause className="h-4 w-4" /> : <FastForward className="h-4 w-4" />}
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={stepForward}
                disabled={!canStep}
                data-testid="button-step-forward"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 min-w-[150px]">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">Speed:</Label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={100}
                max={1500}
                step={100}
                className="w-24"
                data-testid="slider-speed"
              />
            </div>

            <div className="flex items-center gap-2">
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
              {execution.status === 'running' && (
                <Badge variant="secondary" className="gap-1">
                  Step {execution.step}
                </Badge>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
