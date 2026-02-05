import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { wineriesAPI, winesAPI, vintagesAPI } from '../utils/api';
import { Building2, GlassWater, Calendar, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { data: wineriesData } = useQuery('wineries-count', () => wineriesAPI.getAll({ limit: 1 }));
  const { data: winesData } = useQuery('wines-count', () => winesAPI.getAll({ limit: 1 }));
  const { data: vintagesData } = useQuery('vintages-count', () => vintagesAPI.getAll({ limit: 1 }));

  const stats = [
    {
      title: 'Total Wineries',
      value: wineriesData?.data?.total || 0,
      icon: Building2,
      color: '#722f37',
      link: '/wineries'
    },
    {
      title: 'Total Wines',
      value: winesData?.data?.total || 0,
      icon: GlassWater,
      color: '#e07a5f',
      link: '/wines'
    },
    {
      title: 'Total Vintages',
      value: vintagesData?.data?.total || 0,
      icon: Calendar,
      color: '#81b29a',
      link: '/vintages'
    },
    {
      title: 'Active Status',
      value: 'Operational',
      icon: TrendingUp,
      color: '#f2cc8f',
      link: '/'
    }
  ];

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link to={stat.link} key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <Icon size={32} />
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/wineries/new" className="action-card">
            <Building2 size={24} />
            <h3>Add Winery</h3>
            <p>Create a new winery profile</p>
          </Link>
          <Link to="/wines/new" className="action-card">
            <GlassWater size={24} />
            <h3>Add Wine</h3>
            <p>Add a new wine to your catalog</p>
          </Link>
          <Link to="/vintages/new" className="action-card">
            <Calendar size={24} />
            <h3>Add Vintage</h3>
            <p>Create a new vintage entry</p>
          </Link>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h3>Getting Started</h3>
          <ol>
            <li>Start by creating a <Link to="/wineries/new">winery</Link></li>
            <li>Add <Link to="/wines/new">wines</Link> to your winery</li>
            <li>Create <Link to="/vintages/new">vintages</Link> for each wine with specific years</li>
            <li>Upload assets like bottle images, tech sheets, and labels</li>
          </ol>
        </div>

        <div className="info-card">
          <h3>Features</h3>
          <ul>
            <li>Complete winery management with images and galleries</li>
            <li>Detailed wine information with awards tracking</li>
            <li>Vintage-specific assets and pricing</li>
            <li>Role-based access control (Admin, Editor, Viewer)</li>
            <li>RESTful API for external integrations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
