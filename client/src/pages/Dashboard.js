import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI, vintagesAPI } from '../utils/api';
import { Building2, GlassWater, Calendar } from 'lucide-react';
import ChatBot from '../components/ChatBot';
import './Dashboard.css';

const Dashboard = () => {
  const { data: wineriesData } = useQuery('wineries-count', () => wineriesAPI.getAll({ limit: 1 }));
  const { data: winesData } = useQuery('wines-count', () => winesAPI.getAll({ limit: 1 }));
  const { data: vintagesData } = useQuery('vintages-count', () => vintagesAPI.getAll({ limit: 1 }));

  const stats = [
    {
      title: 'Wineries',
      subtitle: 'Total Count',
      value: wineriesData?.data?.total || 0,
      icon: Building2,
      link: '/wineries'
    },
    {
      title: 'Wines',
      subtitle: 'In Catalog',
      value: winesData?.data?.total || 0,
      icon: GlassWater,
      link: '/wines'
    },
    {
      title: 'Vintages',
      subtitle: 'Tracked',
      value: vintagesData?.data?.total || 0,
      icon: Calendar,
      link: '/vintages'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Wine Inventory</h1>
        <p>Manage your collection</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link to={stat.link} key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <div className="stat-label">
                  <span className="stat-subtitle">{stat.subtitle}</span>
                  <h3>{stat.title}</h3>
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
            </Link>
          );
        })}
      </div>

      <div className="dashboard-actions">
        <div className="actions-grid">
          <Link to="/wineries/new" className="action-card">
            <div className="action-icon">
              <Building2 size={32} strokeWidth={1.5} />
            </div>
            <h3>Add Winery</h3>
            <p>Create new winery profile</p>
          </Link>
          <Link to="/wines/new" className="action-card">
            <div className="action-icon">
              <GlassWater size={32} strokeWidth={1.5} />
            </div>
            <h3>Add Wine</h3>
            <p>Expand your catalog</p>
          </Link>
          <Link to="/vintages/new" className="action-card">
            <div className="action-icon">
              <Calendar size={32} strokeWidth={1.5} />
            </div>
            <h3>Add Vintage</h3>
            <p>Track new vintage</p>
          </Link>
        </div>
      </div>

      <ChatBot />
    </div>
  );
};

export default Dashboard;
