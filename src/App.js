import React, { useState, useEffect } from "react";
import "./App.css";
const BaseURL = "https://sample-sse-server.onrender.com";

function App() {
  const [status, setStatus] = useState("idle");
  const [stockPrices, setStockPrices] = useState([]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("us-EN", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "narrowSymbol",
    }).format(price);
  };

  const fetchStockPrice = () => {
    setStatus("idle");
    fetch(`${BaseURL}/stocks`, { method: "GET" })
      .then((res) => (res.status === 200 ? res.json() : setStatus("rejected")))
      .then((result) => setStockPrices(result.data))
      .catch((err) => setStatus("rejected"));
  };

  const updateStockPrices = (data) => {
    setStatus("updated");
    const parsedData = JSON.parse(data);
    setStockPrices((stockPrices) =>
      [...stockPrices].map((stock) => {
        if (stock.id === parsedData.id) {
          return parsedData;
        }
        return stock;
      })
    );
  };

  useEffect(() => {
    fetchStockPrice();
    const eventSource = new EventSource(`${BaseURL}/realtime-price`);
    eventSource.onmessage = (e) => updateStockPrices(e.data);
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="App">
      <table>
        <caption>Stock Prices - {status}</caption>
        <thead>
          <tr>
            <th>S/N</th>
            <th>Ticker Symbol</th>
            <th>Real Time Price</th>
          </tr>
        </thead>
        <tbody>
          {stockPrices.map(({ id, ticker, price }, index) => (
            <tr key={id}>
              <td>{index + 1}</td>
              <td>{ticker}</td>
              <td>{formatPrice(price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App