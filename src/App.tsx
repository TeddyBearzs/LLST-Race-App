import React, { useState } from 'react';
import { StudentsTab } from './components/StudentsTab';
import { ClockTab } from './components/ClockTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { Users, Clock, LayoutDashboard, Trophy } from 'lucide-react';

type Tab = 'students' | 'clock' | 'leaderboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('students');

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white border-bottom shadow-sm py-3 sticky-top">
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <div className="bg-primary p-2 rounded-3 me-3">
              <Trophy className="text-white" size={28} />
            </div>
            <h1 className="h3 mb-0 fw-bold text-dark tracking-tight">LLST Sport App</h1>
          </div>
          
          <nav className="nav nav-pills bg-light p-1 rounded-3">
            <button 
              className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'students' ? 'active shadow-sm' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <Users size={18} /> Students
            </button>
            <button 
              className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'clock' ? 'active shadow-sm' : ''}`}
              onClick={() => setActiveTab('clock')}
            >
              <Clock size={18} /> Clock
            </button>
            <button 
              className={`nav-link d-flex align-items-center gap-2 ${activeTab === 'leaderboard' ? 'active shadow-sm' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <LayoutDashboard size={18} /> Leaderboard
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-4">
        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'clock' && <ClockTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-muted border-top bg-white mt-auto">
        <div className="container">
          <p className="mb-0 small">&copy; 2026 LLST Sport Management System. Built for school staff.</p>
        </div>
      </footer>

      <style>{`
        .nav-pills .nav-link {
          color: #6c757d;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .nav-pills .nav-link.active {
          background-color: #0d6efd;
          color: white;
        }
        .nav-pills .nav-link:hover:not(.active) {
          background-color: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
        }
        .tracking-tight {
          letter-spacing: -0.025em;
        }
      `}</style>
    </div>
  );
}
