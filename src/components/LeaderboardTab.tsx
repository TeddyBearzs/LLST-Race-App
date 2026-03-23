import React, { useState, useEffect } from 'react';
import { HousePoints } from '../types';
import { gasService } from '../services/gasService';
import { Trophy, TrendingUp } from 'lucide-react';

export const LeaderboardTab: React.FC = () => {
  const [points, setPoints] = useState<HousePoints>({ Blue: 0, Red: 0, Yellow: 0 });
  const [loading, setLoading] = useState(false);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const data = await gasService.getHousePoints();
      setPoints(data);
    } catch (error) {
      console.error('Failed to fetch points', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPoints, 30000);
    return () => clearInterval(interval);
  }, []);

  const sortedHouses = (Object.entries(points) as [keyof HousePoints, number][])
    .sort(([, a], [, b]) => b - a);

  const getHouseColor = (house: string) => {
    switch (house) {
      case 'Blue': return '#0000ff';
      case 'Red': return '#ff0000';
      case 'Yellow': return '#ffff00';
      default: return '#ccc';
    }
  };

  const getHouseTextColor = (house: string) => {
    return house === 'Yellow' ? '#000' : '#fff';
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold text-dark">
          <Trophy className="me-3 text-warning" size={48} />
          House Standings
        </h2>
        <p className="text-muted">Real-time points accumulated from all events</p>
      </div>

      <div className="row g-4 justify-content-center">
        {sortedHouses.map(([house, score], index) => (
          <div key={house} className="col-md-4">
            <div 
              className="card shadow-lg border-0 h-100 transition-all hover-scale"
              style={{ 
                backgroundColor: getHouseColor(house),
                color: getHouseTextColor(house),
                minHeight: '250px'
              }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
                <div className="mb-2 opacity-75 text-uppercase fw-bold tracking-wider">
                  {index === 0 && '🏆 Current Leader'}
                  {index === 1 && '🥈 Second Place'}
                  {index === 2 && '🥉 Third Place'}
                </div>
                <h1 className="display-1 fw-black mb-0">{score}</h1>
                <h3 className="fw-bold text-uppercase">{house} House</h3>
                <div className="mt-3 p-2 rounded-circle bg-white bg-opacity-25">
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 card shadow-sm border-0 bg-light">
        <div className="card-body text-center py-4">
          <button className="btn btn-outline-primary px-5" onClick={fetchPoints} disabled={loading}>
            {loading ? 'Refreshing...' : 'Manual Refresh'}
          </button>
        </div>
      </div>

      <style>{`
        .hover-scale {
          transition: transform 0.3s ease;
        }
        .hover-scale:hover {
          transform: translateY(-10px);
        }
        .fw-black {
          font-weight: 900;
        }
      `}</style>
    </div>
  );
};
