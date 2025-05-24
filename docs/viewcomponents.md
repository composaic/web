<!--
[instructions]
1. do not delete this comment
2. keep your documentation in this file, below the comment
3. the key files to look at:
    [web]/src/plugins/navbar/Example1Page.tsx - for how everything put together in the UI
    [web]/src/plugins/views/views-plugin.json - for the relevant configuration of master slot
    [web]/src/plugins/views/SampleViewComponent.tsx - for the implementation for the master slot component
    [demo]/applications/plugin-template/src/plugins/views/PluginTestComponent.tsx for the plugin config (decorators!) implementation of the detail slot component
4. Your task is to keep the current semantic, behaviour but move to a React context based implementation (replacing the LocalEventBus)
5. While doing so, make sure you keep the framework classes ViewContext, ViewContainer and ViewComponent absolutely agnostic of the application level concerns and state
6. Start by renaming the 'context' property of ViewContainer to 'id' (as that's really just an id)
7. Remove the eventBus as property
8. Define a viewcontext behind the scenes (ViewContainer should set it up for it's children to communicate)
-->

# React Context-Based Communication Design

## Framework Components

```typescript
// Basic message type
interface ViewMessage {
  type: string;
  payload: any;
}

// Context value type
interface ViewContextValue {
  emit: (msg: ViewMessage) => void;
  on: (handler: (msg: ViewMessage) => void) => () => void;
}

// Create the context
const ViewContext = React.createContext<ViewContextValue | null>(null);

// ViewContainer Component
interface ViewContainerProps {
  id: string;  // renamed from 'context'
  children?: React.ReactNode;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({
  id,
  children
}) => {
  const handlers = useRef<((msg: ViewMessage) => void)[]>([]);

  const emit = useCallback((msg: ViewMessage) => {
    handlers.current.forEach(h => h(msg));
  }, []);

  const on = useCallback((handler: (msg: ViewMessage) => void) => {
    handlers.current.push(handler);
    return () => {
      handlers.current = handlers.current.filter(h => h !== handler);
    };
  }, []);

  const contextValue = useMemo(() => ({
    emit,
    on
  }), [emit, on]);

  return (
    <ViewContext.Provider value={contextValue}>
      <div data-view-container={id}>
        {children}
      </div>
    </ViewContext.Provider>
  );
};

// ViewComponent base
interface ViewComponentProps {
  slot: string;
}

export const ViewComponent: React.FC<ViewComponentProps> = ({
  slot
}) => {
  // Component loading logic remains the same
  // But uses context instead of eventBus
  return null;
};

// Hook for components to use
export const useViewContext = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useViewContext must be used within ViewContainer');
  }
  return context;
};
```

## Example Usage

```typescript
// Example Page (simplified props)
export const Example1Page: React.FC = () => {
  return (
    <ViewContainer id="sample.container">
      <ViewComponent slot="master" />
      <ViewComponent slot="detail" />
    </ViewContainer>
  );
};

// Master Component
export const SampleViewComponent = () => {
  const { emit, on } = useViewContext();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Listen for reference usage
  useEffect(() => {
    return on(msg => {
      if (msg.type === 'useReference') {
        console.log('Using reference:', msg.payload);
      }
    });
  }, [on]);

  const handleTradeSelect = (trade: Trade) => {
    setSelectedTrade(trade);
    emit({ type: 'selectedTradeChanged', payload: trade });
  };

  return (
    // Trade selection UI
  );
};

// Detail Component
export const PluginTestComponent = () => {
  const { emit, on } = useViewContext();
  const [trade, setTrade] = useState<Trade | null>(null);

  // Listen for trade selection
  useEffect(() => {
    return on(msg => {
      if (msg.type === 'selectedTradeChanged') {
        setTrade(msg.payload);
      }
    });
  }, [on]);

  const handleUseReference = (ref: string) => {
    emit({ type: 'useReference', payload: ref });
  };

  return (
    // Trade detail UI
  );
};
```

## Key Points

1. **Framework Components**:

   - ViewContainer only manages communications
   - ViewComponent handles slot-based loading
   - No knowledge of specific message types/payloads

2. **Communication**:

   - Simple emit/on pattern
   - Scoped to container
   - Type-agnostic messaging

3. **Usage**:
   - Same component structure
   - Same communication patterns
   - No external dependencies
