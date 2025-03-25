// src/components/Charts/ResolvedIssuesChart.js
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Q1', resolved: 120 },
  { name: 'Q2', resolved: 90 },
  { name: 'Q3', resolved: 150 },
  { name: 'Q4', resolved: 110 },
];

const ResolvedIssuesChart = () => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="resolved" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ResolvedIssuesChart;