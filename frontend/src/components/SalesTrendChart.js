import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SalesTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="empty-state">No sales data available yet.</div>;
  }

  // Format dates for display
  const labels = data.map(d => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const amounts = data.map(d => d.amount);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: amounts,
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108, 99, 255, 0.08)',
        pointBackgroundColor: '#6c63ff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1d27',
        borderColor: '#2e3348',
        borderWidth: 1,
        titleColor: '#e8eaf6',
        bodyColor: '#8892b0',
        callbacks: {
          label: ctx => ` $${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(46,51,72,0.5)', drawBorder: false },
        ticks: { color: '#8892b0', font: { size: 11 }, maxTicksLimit: 8 },
      },
      y: {
        grid: { color: 'rgba(46,51,72,0.5)', drawBorder: false },
        ticks: {
          color: '#8892b0', font: { size: 11 },
          callback: val => '$' + val.toLocaleString(),
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
