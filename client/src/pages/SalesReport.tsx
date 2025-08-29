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

const SalesReport: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/reports/sales')
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch sales report');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading sales report...</div>;
  if (error) return <div>{error}</div>;
  if (!report) return <div>No data available.</div>;

  // Chart data for top products
  const topProductsLabels = report.topProducts.map((prod: any) => prod._id);
  const topProductsData = report.topProducts.map((prod: any) => prod.sold);

  const barData = {
    labels: topProductsLabels,
    datasets: [
      {
        label: 'Units Sold',
        data: topProductsData,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const doughnutData = {
    labels: ['Total Sales', 'Total Orders'],
    datasets: [
      {
        label: 'Sales Overview',
        data: [report.totalSales, report.totalOrders],
        backgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <div>
      <h2>Sales Report</h2>
      <div className="mb-4">Total Sales: ${report.totalSales}</div>
      <div className="mb-4">Total Orders: {report.totalOrders}</div>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="mb-2">Top Products (Bar Chart)</h3>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div>
          <h3 className="mb-2">Sales Overview (Doughnut Chart)</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>
      <h3>Top Products (Table)</h3>
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Sold</th>
          </tr>
        </thead>
        <tbody>
          {report.topProducts.map((prod: any) => (
            <tr key={prod._id}>
              <td>{prod._id}</td>
              <td>{prod.sold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport;
