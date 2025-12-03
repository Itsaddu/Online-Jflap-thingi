import { useState, useEffect } from 'react';
import { Moon, Sun, HelpCircle, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAutomaton } from '@/lib/automaton-context';
import { Badge } from './ui/badge';

export function Header() {
  const { automaton, setAutomaton } = useAutomaton();
  const [isDark, setIsDark] = useState(false);
  const [name, setName] = useState(automaton.name);

  useEffect(() => {
    const dark = document.documentElement.classList.contains('dark');
    setIsDark(dark);
  }, []);

  useEffect(() => {
    setName(automaton.name);
  }, [automaton.name]);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleNameChange = (newName: string) => {
    setName(newName);
    setAutomaton({ ...automaton, name: newName });
  };

  return (
    <header className="h-14 bg-sidebar border-b border-sidebar-border px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">FA</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">Automaton Lab</span>
            <span className="text-xs text-muted-foreground leading-tight">FSA Builder</span>
          </div>
        </div>

        <div className="h-6 w-px bg-border" />

        <Input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-48 h-8 text-sm"
          placeholder="Automaton name..."
          data-testid="input-automaton-name"
        />
      </div>

      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" data-testid="button-help">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Use these shortcuts to work more efficiently
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Tools</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Select Mode</span>
                      <Badge variant="outline">V</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Add State</span>
                      <Badge variant="outline">S</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Add Transition</span>
                      <Badge variant="outline">T</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Delete Selected</span>
                      <Badge variant="outline">Delete</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Canvas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Pan</span>
                      <Badge variant="outline">Alt + Drag</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Zoom</span>
                      <Badge variant="outline">Scroll</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Deselect</span>
                      <Badge variant="outline">Esc</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Testing</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Run Test</span>
                    <Badge variant="outline">Enter</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Step Forward</span>
                    <Badge variant="outline">Space</Badge>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
