# Automaton Lab - Finite State Machine Builder

## Overview

Automaton Lab is an interactive web application for building, visualizing, and testing finite state automata (FSA). The application provides a drag-and-drop canvas interface where users can create states, define transitions, and validate input strings against their automaton designs. It's designed as an educational tool for learning automata theory and formal languages.

The application follows a client-server architecture with a React-based frontend and an Express backend. State management is handled through React Context, with local storage persistence for user automata. The UI is built using shadcn/ui components with Tailwind CSS styling, following Material Design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**State Management**: React Context API (`AutomatonContext`) provides centralized state management for:
- Automaton data (states, transitions)
- Editor modes (select, add state, add transition, test)
- Execution state for string testing
- Selected elements and UI interactions

**Routing**: Wouter for lightweight client-side routing, though the application is primarily a single-page editor interface.

**Canvas Rendering**: SVG-based canvas for drawing states and transitions, with custom interaction handlers for drag-and-drop, pan, zoom, and element manipulation.

**Local Persistence**: Browser localStorage is used to persist the current automaton across sessions, eliminating the need for immediate server interaction during editing.

**Component Structure**:
- Editor page serves as the main container
- Canvas component handles visualization and interactions
- Tool panel provides mode switching and file operations
- Properties panel shows selected element details
- Testing panel manages string validation and execution visualization

### Backend Architecture

**Server Framework**: Express.js with TypeScript, serving both API endpoints and static assets.

**Storage Layer**: Abstracted through an `IStorage` interface with in-memory implementation (`MemStorage`). The interface supports future database integration without changing API contracts.

**API Design**: RESTful endpoints for CRUD operations on automata:
- `GET /api/automata` - List all automata
- `GET /api/automata/:id` - Get specific automaton
- `POST /api/automata` - Create new automaton
- `PUT /api/automata/:id` - Update automaton
- `DELETE /api/automata/:id` - Delete automaton

**Validation**: Zod schemas defined in shared directory validate automaton data structure on both client and server, ensuring type safety and data integrity.

**Static Asset Serving**: Production builds serve pre-compiled React application from the `dist/public` directory. Development mode uses Vite middleware for hot module replacement.

### Design System

**UI Library**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components.

**Styling**: Tailwind CSS with custom configuration for:
- CSS variables for theming (light/dark mode support)
- Material Design-inspired spacing and elevation
- Custom color palette with semantic naming
- Responsive border radius and shadow systems

**Typography**: Multiple font families for different contexts:
- Inter for UI elements
- Fira Code/JetBrains Mono for code/technical content
- DM Sans and Architects Daughter for display text

**Theme System**: CSS custom properties enable dynamic theme switching between light and dark modes, persisted in localStorage.

### Data Model

**State Schema**:
- Unique ID, label, position (x, y coordinates)
- Boolean flags for start state and accept state
- Rendered as SVG circles with optional double border for accept states

**Transition Schema**:
- Unique ID, source and target state IDs
- Array of symbols that trigger the transition
- Rendered as curved SVG paths with arrow heads and label boxes

**Automaton Schema**:
- Collection of states and transitions
- Name for identification
- Server-assigned UUID for persistence

**Execution State**:
- Current state IDs (supports non-deterministic automata)
- Input string processing (remaining and processed portions)
- Step-by-step history for visualization
- Status flags (idle, running, accepted, rejected)

### Build System

**Development**:
- Vite dev server with HMR for fast iteration
- Express server with middleware mode integration
- TypeScript compilation without emit (type checking only)

**Production**:
- Custom build script using esbuild for server bundling
- Vite for client bundling with code splitting
- Selected dependencies bundled with server code to reduce cold start times
- Single executable output with embedded static assets

**Database Configuration**: Drizzle ORM configured for PostgreSQL with migration support, though currently using in-memory storage. The configuration is ready for database integration when needed.

## External Dependencies

### UI Component Libraries
- **Radix UI**: Comprehensive collection of unstyled, accessible UI primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.)
- **shadcn/ui**: Pre-styled components built on Radix UI following consistent design patterns
- **Tailwind CSS**: Utility-first CSS framework with custom configuration for theming
- **class-variance-authority**: Type-safe variant styling for components
- **cmdk**: Command palette component

### State & Data Management
- **TanStack React Query**: Server state management and caching
- **Zod**: Schema validation for type-safe data structures
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Development Tools
- **Vite**: Build tool and dev server with React plugin
- **TypeScript**: Type safety across frontend and backend
- **esbuild**: Fast JavaScript bundler for production builds
- **Replit plugins**: Development utilities for Replit environment (cartographer, dev banner, runtime error overlay)

### Backend Services
- **Express**: Web application framework
- **@neondatabase/serverless**: PostgreSQL driver (configured but not actively used)
- **Drizzle ORM**: Type-safe ORM for database operations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **wouter**: Lightweight routing library
- **react-hook-form**: Form state management with validation
- **embla-carousel-react**: Carousel component

### Font Resources
- **Google Fonts**: Inter, DM Sans, Fira Code, Architects Daughter, Geist Mono

### Future Integration Points
The application is architected to support:
- Database persistence through the existing storage interface
- User authentication (session infrastructure present)
- Collaboration features (WebSocket support configured)
- Export/import functionality (JSON-based automaton serialization)