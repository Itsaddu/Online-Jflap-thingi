import { useRef, useState, useCallback, useEffect } from 'react';
import { useAutomaton } from '@/lib/automaton-context';
import type { State, Transition } from '@shared/schema';

const STATE_RADIUS = 40;
const ACCEPT_INNER_RADIUS = 34;
const ARROW_SIZE = 12;

interface CanvasProps {
  width: number;
  height: number;
}

export function AutomatonCanvas({ width, height }: CanvasProps) {
  const {
    automaton,
    mode,
    selectedElement,
    setSelectedElement,
    execution,
    transitionStart,
    setTransitionStart,
    addState,
    updateState,
    addTransition,
  } = useAutomaton();

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX + viewBox.x,
      y: (clientY - rect.top) * scaleY + viewBox.y,
    };
  }, [viewBox]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement;
    const isBackgroundClick = target === svgRef.current || 
      target.tagName === 'rect' || 
      target.tagName === 'pattern' ||
      target.tagName === 'circle' && target.classList.contains('grid-dot');
    
    if (!isBackgroundClick && mode !== 'addState') return;
    
    const point = getSvgPoint(e.clientX, e.clientY);
    
    if (mode === 'addState') {
      const clickedOnState = automaton.states.some(state => {
        const dx = point.x - state.x;
        const dy = point.y - state.y;
        return Math.sqrt(dx * dx + dy * dy) <= STATE_RADIUS;
      });
      
      if (!clickedOnState) {
        addState(point.x, point.y);
      }
    } else if (mode === 'select' && isBackgroundClick) {
      setSelectedElement(null);
      setTransitionStart(null);
    }
  }, [mode, getSvgPoint, addState, setSelectedElement, setTransitionStart, automaton.states]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const point = getSvgPoint(e.clientX, e.clientY);
    setMousePos(point);

    if (isPanning) {
      const dx = (e.clientX - panStart.x) * (viewBox.width / (svgRef.current?.clientWidth || 1));
      const dy = (e.clientY - panStart.y) * (viewBox.height / (svgRef.current?.clientHeight || 1));
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (dragging) {
      updateState(dragging.id, {
        x: point.x - dragging.offsetX,
        y: point.y - dragging.offsetY,
      });
    }
  }, [getSvgPoint, isPanning, panStart, viewBox, dragging, updateState]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const point = getSvgPoint(e.clientX, e.clientY);
    
    setViewBox(prev => {
      const newWidth = Math.max(400, Math.min(4000, prev.width * scaleFactor));
      const newHeight = Math.max(300, Math.min(3000, prev.height * scaleFactor));
      const ratio = newWidth / prev.width;
      
      return {
        x: point.x - (point.x - prev.x) * ratio,
        y: point.y - (point.y - prev.y) * ratio,
        width: newWidth,
        height: newHeight,
      };
    });
  }, [getSvgPoint]);

  const handleStateClick = useCallback((state: State, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (mode === 'addTransition') {
      if (transitionStart === null) {
        setTransitionStart(state.id);
      } else {
        addTransition(transitionStart, state.id, ['a']);
        setTransitionStart(null);
      }
    } else if (mode === 'select') {
      setSelectedElement({ type: 'state', id: state.id });
    }
  }, [mode, transitionStart, setTransitionStart, addTransition, setSelectedElement]);

  const handleStateMouseDown = useCallback((state: State, e: React.MouseEvent) => {
    if (mode === 'select' && e.button === 0) {
      const point = getSvgPoint(e.clientX, e.clientY);
      setDragging({
        id: state.id,
        offsetX: point.x - state.x,
        offsetY: point.y - state.y,
      });
    }
  }, [mode, getSvgPoint]);

  const handleTransitionClick = useCallback((transition: Transition, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'select') {
      setSelectedElement({ type: 'transition', id: transition.id });
    }
  }, [mode, setSelectedElement]);

  const getTransitionPath = useCallback((transition: Transition) => {
    const fromState = automaton.states.find(s => s.id === transition.fromStateId);
    const toState = automaton.states.find(s => s.id === transition.toStateId);
    
    if (!fromState || !toState) return { path: '', labelPos: { x: 0, y: 0 }, labelAngle: 0 };
    
    if (fromState.id === toState.id) {
      const loopRadius = 35;
      const startAngle = -Math.PI / 4;
      const endAngle = -3 * Math.PI / 4;
      
      const startX = fromState.x + STATE_RADIUS * Math.cos(startAngle);
      const startY = fromState.y + STATE_RADIUS * Math.sin(startAngle);
      const endX = fromState.x + STATE_RADIUS * Math.cos(endAngle);
      const endY = fromState.y + STATE_RADIUS * Math.sin(endAngle);
      
      const controlX = fromState.x;
      const controlY = fromState.y - STATE_RADIUS - loopRadius * 2;
      
      return {
        path: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
        labelPos: { x: fromState.x, y: fromState.y - STATE_RADIUS - loopRadius - 10 },
        labelAngle: 0,
        endX,
        endY,
        arrowAngle: Math.PI / 4 + Math.PI,
      };
    }
    
    const dx = toState.x - fromState.x;
    const dy = toState.y - fromState.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    const hasReverseTransition = automaton.transitions.some(
      t => t.fromStateId === toState.id && t.toStateId === fromState.id
    );
    
    const startX = fromState.x + STATE_RADIUS * Math.cos(angle);
    const startY = fromState.y + STATE_RADIUS * Math.sin(angle);
    const endX = toState.x - STATE_RADIUS * Math.cos(angle);
    const endY = toState.y - STATE_RADIUS * Math.sin(angle);
    
    if (hasReverseTransition) {
      const curveOffset = 30;
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const perpX = -Math.sin(angle) * curveOffset;
      const perpY = Math.cos(angle) * curveOffset;
      
      const controlX = midX + perpX;
      const controlY = midY + perpY;
      
      const t = 0.5;
      const labelX = (1-t)*(1-t)*startX + 2*(1-t)*t*controlX + t*t*endX;
      const labelY = (1-t)*(1-t)*startY + 2*(1-t)*t*controlY + t*t*endY;
      
      const tangentX = 2*(1-t)*(controlX-startX) + 2*t*(endX-controlX);
      const tangentY = 2*(1-t)*(controlY-startY) + 2*t*(endY-controlY);
      const arrowAngle = Math.atan2(tangentY, tangentX);
      
      return {
        path: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
        labelPos: { x: labelX, y: labelY - 12 },
        labelAngle: 0,
        endX,
        endY,
        arrowAngle,
      };
    }
    
    return {
      path: `M ${startX} ${startY} L ${endX} ${endY}`,
      labelPos: { x: (startX + endX) / 2, y: (startY + endY) / 2 - 12 },
      labelAngle: 0,
      endX,
      endY,
      arrowAngle: angle,
    };
  }, [automaton.states, automaton.transitions]);

  const isStateActive = useCallback((stateId: string) => {
    return execution.status !== 'idle' && execution.currentStateIds.includes(stateId);
  }, [execution]);

  const isTransitionActive = useCallback((transitionId: string) => {
    if (execution.history.length === 0) return false;
    const lastStep = execution.history[execution.history.length - 1];
    return lastStep?.transitionIds.includes(transitionId) || false;
  }, [execution.history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTransitionStart(null);
        setSelectedElement(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTransitionStart, setSelectedElement]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      className="bg-background cursor-crosshair select-none"
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isPanning ? 'grabbing' : mode === 'addState' ? 'crosshair' : 'default' }}
    >
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1" className="fill-foreground/5" />
        </pattern>
        <marker
          id="arrowhead"
          markerWidth={ARROW_SIZE}
          markerHeight={ARROW_SIZE}
          refX={ARROW_SIZE - 2}
          refY={ARROW_SIZE / 2}
          orient="auto"
        >
          <polygon
            points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
            className="fill-foreground"
          />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth={ARROW_SIZE}
          markerHeight={ARROW_SIZE}
          refX={ARROW_SIZE - 2}
          refY={ARROW_SIZE / 2}
          orient="auto"
        >
          <polygon
            points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
            className="fill-primary"
          />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth={ARROW_SIZE}
          markerHeight={ARROW_SIZE}
          refX={ARROW_SIZE - 2}
          refY={ARROW_SIZE / 2}
          orient="auto"
        >
          <polygon
            points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
            className="fill-primary"
          />
        </marker>
      </defs>

      <rect
        x={viewBox.x - 1000}
        y={viewBox.y - 1000}
        width={viewBox.width + 2000}
        height={viewBox.height + 2000}
        fill="url(#grid)"
      />

      {automaton.transitions.map(transition => {
        const pathData = getTransitionPath(transition);
        const isSelected = selectedElement?.type === 'transition' && selectedElement.id === transition.id;
        const isActive = isTransitionActive(transition.id);
        
        return (
          <g key={transition.id} onClick={(e) => handleTransitionClick(transition, e)}>
            <path
              d={pathData.path}
              fill="none"
              strokeWidth={isSelected ? 4 : 3}
              className={`
                ${isActive ? 'stroke-primary animate-dash-flow' : isSelected ? 'stroke-primary' : 'stroke-foreground'}
                cursor-pointer transition-colors
              `}
              strokeDasharray={isActive ? "10 5" : "none"}
              markerEnd={isActive ? "url(#arrowhead-active)" : isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
            />
            <path
              d={pathData.path}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              className="cursor-pointer"
            />
            <g transform={`translate(${pathData.labelPos.x}, ${pathData.labelPos.y})`}>
              <rect
                x={-20}
                y={-12}
                width={40}
                height={24}
                rx={4}
                className="fill-card stroke-card-border"
                strokeWidth={1}
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-sm font-medium pointer-events-none select-none ${isActive ? 'fill-primary' : 'fill-foreground'}`}
              >
                {transition.symbols.join(', ')}
              </text>
            </g>
          </g>
        );
      })}

      {automaton.states.map(state => {
        const isSelected = selectedElement?.type === 'state' && selectedElement.id === state.id;
        const isActive = isStateActive(state.id);
        const isTransitionSource = transitionStart === state.id;
        
        return (
          <g
            key={state.id}
            onClick={(e) => handleStateClick(state, e)}
            onMouseDown={(e) => handleStateMouseDown(state, e)}
            className="cursor-pointer"
          >
            {state.isStart && (
              <g>
                <line
                  x1={state.x - STATE_RADIUS - 60}
                  y1={state.y}
                  x2={state.x - STATE_RADIUS - 5}
                  y2={state.y}
                  strokeWidth={3}
                  className="stroke-foreground"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            )}
            
            {isActive && (
              <circle
                cx={state.x}
                cy={state.y}
                r={STATE_RADIUS + 8}
                className="fill-primary/20 animate-pulse-glow"
                style={{ transformOrigin: `${state.x}px ${state.y}px` }}
              />
            )}
            
            <circle
              cx={state.x}
              cy={state.y}
              r={STATE_RADIUS}
              strokeWidth={isSelected || isTransitionSource ? 4 : 3}
              className={`
                fill-card transition-all duration-150
                ${isSelected || isTransitionSource ? 'stroke-primary' : isActive ? 'stroke-primary' : 'stroke-foreground'}
              `}
            />
            
            {state.isAccept && (
              <circle
                cx={state.x}
                cy={state.y}
                r={ACCEPT_INNER_RADIUS}
                fill="none"
                strokeWidth={isSelected ? 4 : 3}
                className={`
                  ${isSelected || isTransitionSource ? 'stroke-primary' : isActive ? 'stroke-primary' : 'stroke-foreground'}
                `}
              />
            )}
            
            <text
              x={state.x}
              y={state.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-base font-bold pointer-events-none select-none ${isActive ? 'fill-primary' : 'fill-foreground'}`}
            >
              {state.name}
            </text>
          </g>
        );
      })}

      {transitionStart && mode === 'addTransition' && (
        <line
          x1={automaton.states.find(s => s.id === transitionStart)?.x || 0}
          y1={automaton.states.find(s => s.id === transitionStart)?.y || 0}
          x2={mousePos.x}
          y2={mousePos.y}
          strokeWidth={2}
          strokeDasharray="8 4"
          className="stroke-primary/50 pointer-events-none"
        />
      )}

      {mode === 'addState' && (
        <g className="pointer-events-none opacity-50">
          <circle
            cx={mousePos.x}
            cy={mousePos.y}
            r={STATE_RADIUS}
            strokeWidth={2}
            strokeDasharray="8 4"
            className="fill-card/50 stroke-foreground"
          />
        </g>
      )}
    </svg>
  );
}
