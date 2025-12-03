import { Circle, CircleDot, ArrowRight, MousePointer2, Play, Trash2, RotateCcw, FileDown, FileUp, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAutomaton } from '@/lib/automaton-context';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export function ToolPanel() {
  const { mode, setMode, automaton, setAutomaton, clearCanvas, newAutomaton, execution } = useAutomaton();
  const { toast } = useToast();
  const isTestMode = execution.status !== 'idle';

  const handleSave = () => {
    const data = JSON.stringify(automaton, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${automaton.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Automaton saved',
      description: `Saved as ${automaton.name}.json`,
    });
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        setAutomaton(data);
        toast({
          title: 'Automaton loaded',
          description: `Loaded ${data.name}`,
        });
      } catch {
        toast({
          title: 'Error loading file',
          description: 'Invalid automaton file format',
          variant: 'destructive',
        });
      }
    };
    input.click();
  };

  return (
    <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-2">
      <div className="flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={mode === 'select' && !isTestMode ? 'default' : 'ghost'}
              onClick={() => setMode('select')}
              disabled={isTestMode}
              data-testid="button-select-mode"
            >
              <MousePointer2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Select (V)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={mode === 'addState' ? 'default' : 'ghost'}
              onClick={() => setMode('addState')}
              disabled={isTestMode}
              data-testid="button-add-state"
            >
              <Circle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add State (S)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant={mode === 'addTransition' ? 'default' : 'ghost'}
              onClick={() => setMode('addTransition')}
              disabled={isTestMode}
              data-testid="button-add-transition"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Add Transition (T)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator className="my-2 w-10" />

      <div className="flex flex-col gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => newAutomaton()}
              disabled={isTestMode}
              data-testid="button-new-automaton"
            >
              <FilePlus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>New Automaton</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              data-testid="button-save"
            >
              <FileDown className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Save (Ctrl+S)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleLoad}
              disabled={isTestMode}
              data-testid="button-load"
            >
              <FileUp className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Load (Ctrl+O)</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <Separator className="my-2 w-10" />

      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                disabled={isTestMode || automaton.states.length === 0}
                data-testid="button-clear-canvas"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Clear Canvas</p>
          </TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all states and transitions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearCanvas}>Clear</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex-1" />

      <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
        <span className="font-medium">{automaton.states.length}</span>
        <CircleDot className="h-3 w-3" />
      </div>
    </div>
  );
}
