import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI, vintagesAPI } from '../utils/api';
import { Search } from 'lucide-react';
import './DashboardAlt.css';

const DashboardAlt = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: wineriesData } = useQuery('wineries-count', () => wineriesAPI.getAll({ limit: 1 }));
  const { data: winesData } = useQuery('wines-count', () => winesAPI.getAll({ limit: 1 }));
  const { data: vintagesData } = useQuery('vintages-count', () => vintagesAPI.getAll({ limit: 1 }));

  const winesCount = winesData?.data?.total || 0;
  const wineriesCount = wineriesData?.data?.total || 0;
  const vintagesCount = vintagesData?.data?.total || 0;

  return (
    <div className="dashboard-alt">
      {/* Top bar */}
      <div className="dash-alt-topbar">
        <h1 className="dash-alt-heading">Dashboard</h1>
        <div className="dash-alt-search">
          <input
            type="text"
            placeholder="Find anything"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dash-alt-search-input"
          />
          <Search size={16} className="dash-alt-search-icon" />
        </div>
      </div>

      {/* Stat cards row */}
      <div className="dash-alt-cards-row">
        <Link to="/wines" className="dash-alt-card">
          <span className="dash-alt-card-label">Recently Added</span>
          <span className="dash-alt-card-value">{winesCount}</span>
          <span className="dash-alt-card-sub">Wines</span>
        </Link>
        <Link to="/wineries" className="dash-alt-card">
          <span className="dash-alt-card-label">Recently Added</span>
          <span className="dash-alt-card-value">{wineriesCount}</span>
          <span className="dash-alt-card-sub">Wineries</span>
        </Link>
      </div>

      {/* Wide stat card */}
      <div className="dash-alt-cards-wide">
        <Link to="/vintages" className="dash-alt-card dash-alt-card-wide">
          <span className="dash-alt-card-label">Recently Added</span>
          <span className="dash-alt-card-value">{vintagesCount}</span>
          <span className="dash-alt-card-sub">Vintages</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardAlt;
