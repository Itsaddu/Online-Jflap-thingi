import { useState, useEffect, useCallback } from 'react';
import { AutomatonCanvas } from '@/components/automaton-canvas';
import { ToolPanel } from '@/components/tool-panel';
import { PropertiesPanel } from '@/components/properties-panel';
import { TestingPanel } from '@/components/testing-panel';
import { Header } from '@/components/header';
import { useAutomaton } from '@/lib/automaton-context';

export default function Editor() {
  const { 
    mode, 
    setMode, 
    selectedElement, 
    deleteState, 
    deleteTransition,
    stepForward,
    execution,
  } = useAutomaton();
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('canvas-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    const observer = new ResizeObserver(updateDimensions);
    const container = document.getElementById('canvas-container');
    if (container) {
      observer.observe(container);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
    };
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const isTestMode = execution.status !== 'idle';

    switch (e.key.toLowerCase()) {
      case 'v':
        if (!isTestMode) setMode('select');
        break;
      case 's':
        if (!isTestMode && !e.ctrlKey && !e.metaKey) setMode('addState');
        break;
      case 't':
        if (!isTestMode) setMode('addTransition');
        break;
      case 'delete':
      case 'backspace':
        if (!isTestMode && selectedElement) {
          if (selectedElement.type === 'state') {
            deleteState(selectedElement.id);
          } else if (selectedElement.type === 'transition') {
            deleteTransition(selectedElement.id);
          }
        }
        break;
      case ' ':
        if (isTestMode && execution.status === 'running') {
          e.preventDefault();
          stepForward();
        }
        break;
    }
  }, [mode, setMode, selectedElement, deleteState, deleteTransition, execution, stepForward]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="editor-page">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <ToolPanel />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div 
            id="canvas-container" 
            className="flex-1 overflow-hidden relative"
            data-testid="canvas-container"
          >
            <AutomatonCanvas width={dimensions.width} height={dimensions.height} />
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-md px-3 py-2 border border-card-border">
              <span className="text-xs text-muted-foreground">
                {mode === 'select' && 'Select mode: Click to select, drag to move'}
                {mode === 'addState' && 'Click on canvas to add a state'}
                {mode === 'addTransition' && 'Click a state to start, then click another to create transition'}
                {mode === 'test' && 'Testing mode: Use controls to step through execution'}
              </span>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-md px-3 py-2 border border-card-border">
              <span className="text-xs text-muted-foreground">
                Scroll to zoom, Alt+drag to pan
              </span>
            </div>
          </div>
          
          <TestingPanel />
        </div>
        
        <PropertiesPanel />
      </div>
    </div>
  );
}
