# Design Guidelines: Finite State Automaton Builder

## Design Approach
**System:** Material Design principles with focus on workspace efficiency and educational clarity
**Justification:** Utility-focused application requiring clear visual feedback, structured information display, and custom canvas interactions. Material Design provides excellent patterns for tools, workspaces, and state management.

## Typography
- **Primary Font:** Inter (Google Fonts)
- **Hierarchy:**
  - Tool labels/buttons: 14px medium weight
  - Canvas state labels: 16px bold
  - Transition labels: 14px regular
  - Panel headers: 18px semibold
  - Input fields: 15px regular
  - Help/instructions: 14px regular

## Layout System
**Spacing Units:** Tailwind 2, 4, 6, 8, 12 for consistency
- Canvas padding: p-0 (full bleed)
- Panel spacing: p-6
- Tool spacing: gap-4
- Button padding: px-4 py-2
- Section margins: mb-6

**Application Structure:**
- Top toolbar (h-16): Logo, file operations, help
- Left tool panel (w-64): State tools, transition tools, testing controls
- Main canvas (flex-1): Infinite workspace with grid overlay
- Right properties panel (w-80, collapsible): Selected element properties, string testing interface
- Bottom status bar (h-10): Current mode, cursor position, zoom level

## Component Library

### Canvas & Workspace
- **Grid Background:** Subtle dot pattern (2% opacity) at 20px intervals
- **Pan/Zoom Controls:** Fixed bottom-right corner buttons
- **State Nodes:** 
  - Circle radius: 40px
  - Double circle for accept states (inner radius: 34px)
  - Start arrow: 60px length pointing to initial state
  - Labels centered inside circles
  - Stroke width: 3px
- **Transitions:**
  - Curved paths for better visibility
  - Arrow heads: 12px triangles
  - Self-loops: 80px radius arcs above states
  - Label boxes: white background, 4px padding, rounded corners

### Tool Panel
- **State Tools:**
  - Add Normal State button with circle icon
  - Add Accept State button with double-circle icon
  - Set Start State toggle
  - Delete State button
- **Transition Tools:**
  - Add Transition mode button
  - Edit Transition Labels button
- **Testing Interface:**
  - Input string text field (monospace font)
  - Test String button (prominent)
  - Step Forward/Backward buttons
  - Reset button
  - Auto-play toggle with speed slider

### Properties Panel
- **Selected Element Details:**
  - State name input field
  - Transition symbol input (comma-separated for multiple)
  - From/To state labels
- **Execution Visualization:**
  - Current state indicator (large, highlighted)
  - Remaining input display (monospace)
  - Step counter
  - Accept/Reject status badge

### Visual States & Feedback
- **During Execution:**
  - Active state: Pulsing glow effect
  - Active transition: Animated dashed line
  - Processed symbols: Strike-through in input display
  - Current symbol: Highlighted in bold
- **Interactive States:**
  - Hover: Subtle scale (1.05) on states
  - Selected: Bold stroke on states/transitions
  - Dragging: Slight elevation shadow
- **Status Indicators:**
  - Success: Green badge/border
  - Error: Red badge/border
  - Processing: Blue pulsing indicator

### Toolbar Actions
- New Automaton button
- Open/Save buttons (JSON format)
- Export to PNG button
- Clear Canvas button with confirmation
- Help/Documentation link

## Execution Flow Design
1. **Input Mode:** Clean canvas with subtle prompt "Click to add state"
2. **Building Mode:** Active tools highlighted, cursor changes for add/connect modes
3. **Testing Mode:** Canvas locked, execution controls active, visual feedback prominent
4. **Step Mode:** Clear highlighting of current computation path, frame-by-frame navigation

## Interaction Patterns
- Click to add states on canvas
- Click-drag between states to create transitions
- Double-click states to edit name
- Double-click transitions to edit symbols
- Drag states to reposition
- Right-click for context menu (delete, set as start, toggle accept)

## Responsive Considerations
- Tablet: Collapse right panel, move testing to modal
- Mobile: Stack panels vertically, simplify tools to dropdown

## Accessibility
- Keyboard shortcuts for all tools (displayed in tooltips)
- Tab navigation through all interactive elements
- ARIA labels for canvas elements
- High contrast mode support
- Screen reader announcements for execution steps

## Images
No hero images needed - this is a functional application workspace.