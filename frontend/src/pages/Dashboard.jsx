import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Package, TrendingUp } from 'lucide-react';
import api from '../api';

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, lowStock: 0, transactions: 0 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.stats);
        setData(res.data.chartData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-title"><Package size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'8px'}}/> Total Products</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-title" style={{color: 'var(--danger)'}}><AlertTriangle size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'8px'}}/> Low Stock Alerts</div>
          <div className="stat-value">{stats.lowStock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title"><TrendingUp size={16} style={{display:'inline', verticalAlign:'middle', marginRight:'8px'}}/> Monthly Transactions</div>
          <div className="stat-value">{stats.transactions}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Inventory Flow (Stock In vs Out)</h2>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1DFDD" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#F3F2F1'}} />
              <Bar dataKey="stockIn" fill="var(--azure-blue)" radius={[4, 4, 0, 0]} name="Stock In" />
              <Bar dataKey="stockOut" fill="var(--azure-light)" radius={[4, 4, 0, 0]} name="Stock Out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
