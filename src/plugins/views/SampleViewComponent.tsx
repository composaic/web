import React, { useEffect, useState, useRef } from 'react';
import './SampleViewComponent.scss';
import { useViewContext } from './components/ViewContext';

interface Trade {
  id: number;
  currencyPair: string;
  tradeDate: string;
  notional: number;
  price: number;
}

const trades: Trade[] = [
  {
    id: 1,
    currencyPair: 'EUR/USD',
    tradeDate: '2023-04-01',
    notional: 1000000,
    price: 1.1,
  },
  {
    id: 2,
    currencyPair: 'GBP/USD',
    tradeDate: '2023-04-02',
    notional: 2000000,
    price: 1.3,
  },
];

export const SampleViewComponent: React.FC = () => {
  const { emit, on } = useViewContext();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedReference, setSelectedReference] = useState<string>('');
  const [initialized, setInitialized] = useState(false);
  const initialSelectionMade = useRef(false);

  // Set up event listeners
  useEffect(() => {
    const unsubscribe = on((msg) => {
      if (msg.type === 'useReference') {
        console.log('Using trade:', msg.payload);
        setSelectedReference(msg.payload);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [on]);

  // Handle initial trade selection
  useEffect(() => {
    if (initialized || initialSelectionMade.current || trades.length === 0) {
      return;
    }

    // Delay initial selection to ensure all components are mounted
    const timeoutId = setTimeout(() => {
      console.log('Making initial trade selection');
      const firstTrade = trades[0];
      setSelectedTrade(firstTrade);
      emit({ type: 'selectedTradeChanged', payload: firstTrade });
      initialSelectionMade.current = true;
      setInitialized(true);
    }, 100); // Give more time for other components to initialize

    return () => clearTimeout(timeoutId);
  }, [initialized, emit]);

  const handleSelectionChange = (trade: Trade) => {
    console.log('Selection changed to:', trade);
    setSelectedTrade(trade);
    emit({ type: 'selectedTradeChanged', payload: trade });
    setSelectedReference('');
  };

  const handleReferenceChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSelectedReference(event.target.value);
  };

  return (
    <div className="trade-table-container">
      <table className="trade-table">
        <thead>
          <tr>
            <th>Currency Pair</th>
            <th>Trade Date</th>
            <th>Notional</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr
              key={trade.id}
              onClick={() => handleSelectionChange(trade)}
              className={selectedTrade?.id === trade.id ? 'selected' : ''}
            >
              <td>{trade.currencyPair}</td>
              <td>{trade.tradeDate}</td>
              <td>{trade.notional.toLocaleString()}</td>
              <td>{trade.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <input
        type="text"
        placeholder="Booking reference"
        value={selectedReference || ''}
        onChange={handleReferenceChange}
      />
    </div>
  );
};
