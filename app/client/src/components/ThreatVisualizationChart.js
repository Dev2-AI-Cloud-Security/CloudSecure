import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ThreatVisualizationChart = ({ data }) => {
  // Ensure data is an array, default to [] if undefined
  const safeData = Array.isArray(data) ? data : [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={safeData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#1976d2"
          fill="#1976d2"
          fillOpacity={0.1}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ThreatVisualizationChart;