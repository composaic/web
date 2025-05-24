import React, { useEffect, useState } from 'react';
import './SampleViewComponent.scss';
import { LocalEventBus } from './LocalEventBus';

interface Trade {
  id: number;
  currencyPair: string;
  tradeDate: string;
  notional: number;
  price: number;
}

export const DetailViewComponent: React.FC<{ events: LocalEventBus }> = ({
  events,
}) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    const handleTradeSelected = (trade: Trade) => {
      console.log('Detail received trade:', trade);
      setSelectedTrade(trade);
    };

    events.on('selectedTradeChanged', handleTradeSelected);

    return () => {
      events.off('selectedTradeChanged', handleTradeSelected);
    };
  }, [events]);

  if (!selectedTrade) {
    return <div className="detail-view">Select a trade to view details</div>;
  }

  return (
    <div className="detail-view">
      <h3>Trade Details</h3>
      <div className="detail-content">
        <div className="detail-row">
          <span className="label">ID:</span>
          <span className="value">{selectedTrade.id}</span>
        </div>
        <div className="detail-row">
          <span className="label">Currency Pair:</span>
          <span className="value">{selectedTrade.currencyPair}</span>
        </div>
        <div className="detail-row">
          <span className="label">Trade Date:</span>
          <span className="value">{selectedTrade.tradeDate}</span>
        </div>
        <div className="detail-row">
          <span className="label">Notional:</span>
          <span className="value">
            {selectedTrade.notional.toLocaleString()}
          </span>
        </div>
        <div className="detail-row">
          <span className="label">Price:</span>
          <span className="value">{selectedTrade.price}</span>
        </div>
      </div>
    </div>
  );
};
