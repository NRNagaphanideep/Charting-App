import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import * as htmlToImage from "html-to-image";
import { parseISO, format, startOfWeek, startOfMonth } from "date-fns";

interface DataPoint {
  timestamp: string;
  value: number;
}

const ChartComponent: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<string>("daily");
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data); // Debug log
        setData(data);
      });
  }, []);

  const handleTimeframeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTimeframe(event.target.value);
  };

  const getGroupedData = () => {
    const groupedData: { [key: string]: number } = {};

    data.forEach((point) => {
      let key = point.timestamp;
      const date = parseISO(point.timestamp);

      if (timeframe === "weekly") {
        key = format(startOfWeek(date), "yyyy-MM-dd");
      } else if (timeframe === "monthly") {
        key = format(startOfMonth(date), "yyyy-MM");
      }

      if (!groupedData[key]) {
        groupedData[key] = 0;
      }

      groupedData[key] += point.value;
    });

    return Object.keys(groupedData).map((key) => ({
      timestamp: key,
      value: groupedData[key],
    }));
  };

  const handleClick = (data: any, index: number) => {
    if (data && data.activePayload && data.activePayload[0]) {
      setSelectedPoint(data.activePayload[0].payload);
    }
  };

  const handleExport = () => {
    if (chartRef.current === null) {
      return;
    }

    htmlToImage
      .toPng(chartRef.current)
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("oops, something went wrong!", error);
      });
  };

  return (
    <div>
      <select value={timeframe} onChange={handleTimeframeChange}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <div ref={chartRef} className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getGroupedData()} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {selectedPoint && (
        <div className="details">
          <h3>Details</h3>
          <p>Timestamp: {selectedPoint.timestamp}</p>
          <p>Value: {selectedPoint.value}</p>
        </div>
      )}
      <button onClick={handleExport}>Export as PNG</button>
    </div>
  );
};

export default ChartComponent;
