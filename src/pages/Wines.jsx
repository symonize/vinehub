import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { winesAPI } from '../utils/api';
import './Wines.css';

const Wines = () => {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [region, setRegion] = useState('');

  const { data, isLoading } = useQuery(
    ['wines', search, type, region],
    () => winesAPI.getAll({ search, type, region, limit: 100 }),
    { keepPreviousData: true }
  );

  const wines = data?.data?.data || [];

  const getWineTypeColor = (wineType) => {
    const colors = {
      red: '#722f37',
      white: '#d4a574',
      sparkling: '#d4a017',
      rosé: '#e07a5f',
      dessert: '#5a9279',
      fortified: '#5a252c'
    };
    return colors[wineType] || '#6c757d';
  };

  return (
    <div className="wines-page">
      <section className="page-hero">
        <div className="container">
          <h1>Explore Wines</h1>
          <p>Discover exceptional wines from our curated collection</p>
        </div>
      </section>

      <div className="container-narrow">
        <div className="filters">
          <input
            type="text"
            placeholder="Search wines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="red">Red</option>
            <option value="white">White</option>
            <option value="sparkling">Sparkling</option>
            <option value="rosé">Rosé</option>
            <option value="dessert">Dessert</option>
            <option value="fortified">Fortified</option>
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="filter-select"
          >
            <option value="">All Regions</option>
            <option value="Napa Valley">Napa Valley</option>
            <option value="Sonoma County">Sonoma County</option>
            <option value="Paso Robles">Paso Robles</option>
            <option value="Willamette Valley">Willamette Valley</option>
            <option value="Columbia Valley">Columbia Valley</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : wines.length === 0 ? (
          <div className="empty-state">
            <p>No wines found</p>
          </div>
        ) : (
          <div className="wines-grid">
            {wines.map((wine) => (
              <Link
                key={wine._id}
                to={`/wines/${wine._id}`}
                className="wine-card card"
              >
                <div className="wine-card-image">
                  {wine.bottleImage?.url ? (
                    <img src={wine.bottleImage.url} alt={wine.name} />
                  ) : (
                    <div className="wine-card-placeholder">
                      <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                        <path d="M50 10 L35 40 L20 90 L80 90 L65 40 Z" fill={getWineTypeColor(wine.type)}/>
                        <ellipse cx="50" cy="35" rx="15" ry="8" fill={getWineTypeColor(wine.type)} opacity="0.3"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="wine-card-content">
                  <h4>{wine.name}</h4>
                  {wine.winery?.name && (
                    <p className="wine-winery">{wine.winery.name}</p>
                  )}
                  <div className="wine-meta">
                    <span
                      className="wine-type-badge"
                      style={{
                        backgroundColor: `${getWineTypeColor(wine.type)}20`,
                        color: getWineTypeColor(wine.type),
                        border: `1px solid ${getWineTypeColor(wine.type)}40`
                      }}
                    >
                      {wine.type}
                    </span>
                    <span className="wine-region">{wine.region}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wines;
