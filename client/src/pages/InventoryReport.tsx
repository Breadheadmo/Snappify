import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const InventoryReport: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/reports/inventory')
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch inventory report');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading inventory report...</div>;
  if (error) return <div>{error}</div>;
  if (!report) return <div>No data available.</div>;

  // Chart data for low stock products
  const lowStockLabels = report.lowStock.map((prod: any) => prod.name);
  const lowStockData = report.lowStock.map((prod: any) => prod.countInStock);

  const barData = {
    labels: lowStockLabels,
    datasets: [
      {
        label: 'Stock Count',
        data: lowStockData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const doughnutData = {
    labels: ['Total Products', 'Out of Stock'],
    datasets: [
      {
        label: 'Inventory Overview',
        data: [report.totalProducts, report.outOfStock.length],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  };

  return (
    <div>
      <h2>Inventory Report</h2>
      <div className="mb-4">Total Products: {report.totalProducts}</div>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="mb-2">Low Stock Products (Bar Chart)</h3>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div>
          <h3 className="mb-2">Inventory Overview (Doughnut Chart)</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>
      <h3>Low Stock Products (≤ 5)</h3>
      <ul>
        {report.lowStock.map((prod: any) => (
          <li key={prod._id}>{prod.name} - {prod.countInStock}</li>
        ))}
      </ul>
      <h3>Out of Stock Products</h3>
      <ul>
        {report.outOfStock.map((prod: any) => (
          <li key={prod._id}>{prod.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryReport;
