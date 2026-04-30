import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Bot, LogOut, FileText } from 'lucide-react';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Smart Cloud Inventory
      </div>
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "active" : ""}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className={({isActive}) => isActive ? "active" : ""}>
            <Package size={20} /> Products
          </NavLink>
        </li>
        <li>
          <NavLink to="/ai-assistant" className={({isActive}) => isActive ? "active" : ""}>
            <Bot size={20} /> AI Assistant
          </NavLink>
        </li>
        <li>
          <NavLink to="/reports" className={({isActive}) => isActive ? "active" : ""}>
            <FileText size={20} /> Reports
          </NavLink>
        </li>
      </ul>
      <div style={{marginTop: 'auto', padding: '10px 0'}}>
        <ul className="sidebar-nav">
          <li>
            <NavLink to="/login">
              <LogOut size={20} /> Logout
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
