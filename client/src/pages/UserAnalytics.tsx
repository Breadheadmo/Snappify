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

const UserAnalytics: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/reports/users')
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch user analytics');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading user analytics...</div>;
  if (error) return <div>{error}</div>;
  if (!report) return <div>No data available.</div>;

  // Chart data for recent users
  const userLabels = report.recentUsers.map((user: any) => user.username);
  const userData = report.recentUsers.map(() => 1); // Each recent user counts as 1

  const barData = {
    labels: userLabels,
    datasets: [
      {
        label: 'Recent Registrations',
        data: userData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const doughnutData = {
    labels: ['Total Users', 'Recent Registrations'],
    datasets: [
      {
        label: 'User Overview',
        data: [report.totalUsers, report.recentUsers.length],
        backgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <div>
      <h2>User Analytics</h2>
      <div className="mb-4">Total Users: {report.totalUsers}</div>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="mb-2">Recent Registrations (Bar Chart)</h3>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div>
          <h3 className="mb-2">User Overview (Doughnut Chart)</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>
      <h3>Recent Users</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Registered At</th>
          </tr>
        </thead>
        <tbody>
          {report.recentUsers.map((user: any) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{new Date(user.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserAnalytics;
