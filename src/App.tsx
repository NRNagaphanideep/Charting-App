import React from "react";
import "./App.css";
import ChartComponent from "./ChartComponent";

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Charting App</h1>
      <ChartComponent />
    </div>
  );
};

export default App;
