import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../api';

function Reports() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports');
        setProducts(res.data.products || []);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = () => {
    if (products.length === 0) return;
    
    // Generate simple CSV
    const headers = ['ID', 'Name', 'SKU', 'Quantity', 'Price'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => `${p.Id},"${p.Name}",SKU-${p.Id},${p.Quantity},${p.Price}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Inventory Reports</h1>
        <button className="btn btn-primary" onClick={handleDownload} disabled={loading || products.length === 0}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="card">
        <h2 className="section-title"><FileText size={20} style={{display:'inline', verticalAlign:'middle', marginRight:'8px'}}/> Current Inventory Snapshot</h2>
        {loading ? (
          <p>Loading report data...</p>
        ) : (
          <p>The current inventory snapshot contains {products.length} products. Click "Export CSV" to download the full detailed report.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;
