// src/components/Charts/ThreatVisualizationChart.js
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '12:00', threats: 30 },
  { name: '13:00', threats: 50 },
  { name: '14:00', threats: 20 },
  { name: '15:00', threats: 70 },
  { name: '16:00', threats: 40 },
];

const ThreatVisualizationChart = () => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="threats" stroke="#1976d2" fill="#e0f7fa" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ThreatVisualizationChart;