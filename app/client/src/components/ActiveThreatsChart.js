// src/components/Charts/ActiveThreatsChart.js
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', threats: 30 },
  { name: 'Feb', threats: 20 },
  { name: 'Mar', threats: 50 },
  { name: 'Apr', threats: 40 },
  { name: 'May', threats: 60 },
];

const ActiveThreatsChart = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="threats" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ActiveThreatsChart;