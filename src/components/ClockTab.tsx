import React, { useState, useEffect, useRef } from 'react';
import { RaceType, Student, House } from '../types';
import { gasService } from '../services/gasService';
import { Play, Square, RotateCcw, Save, Plus, Minus, Timer } from 'lucide-react';

interface LaneState {
  id: number;
  athleteName: string;
  leg1Name: string;
  leg2Name: string;
  time: string;
  finished: boolean;
  batonChanged: boolean;
}

export const ClockTab: React.FC = () => {
  const [raceType, setRaceType] = useState<RaceType>('100M');
  const [division, setDivision] = useState('Junior');
  const [heat, setHeat] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Stopwatch state
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lanes state
  const [lanes, setLanes] = useState<LaneState[]>([
    { id: 1, athleteName: '', leg1Name: '', leg2Name: '', time: '', finished: false, batonChanged: false },
    { id: 2, athleteName: '', leg1Name: '', leg2Name: '', time: '', finished: false, batonChanged: false },
    { id: 3, athleteName: '', leg1Name: '', leg2Name: '', time: '', finished: false, batonChanged: false },
  ]);

  useEffect(() => {
    gasService.getStudents().then(setStudents);
  }, []);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      const startTime = Date.now() - time;
      timerRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    }
  };

  const stopTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTime(0);
    setLanes(lanes.map(l => ({ ...l, time: '', finished: false, batonChanged: false })));
  };

  const handleFinish = (laneId: number) => {
    if (!isRunning && time === 0) return;
    const currentTime = formatTime(time);
    setLanes(lanes.map(l => l.id === laneId ? { ...l, time: currentTime, finished: true } : l));
  };

  const handleBatonChange = (laneId: number) => {
    setLanes(lanes.map(l => l.id === laneId ? { ...l, batonChanged: true } : l));
  };

  const addLane = () => {
    if (lanes.length < 6) {
      setLanes([...lanes, { id: lanes.length + 1, athleteName: '', leg1Name: '', leg2Name: '', time: '', finished: false, batonChanged: false }]);
    }
  };

  const removeLane = () => {
    if (lanes.length > 1) {
      setLanes(lanes.slice(0, -1));
    }
  };

  const saveResults = async () => {
    const finishedLanes = lanes.filter(l => l.finished && (raceType === 'Relay' ? (l.leg1Name || l.leg2Name) : l.athleteName));
    if (finishedLanes.length === 0) {
      alert('No finished lanes with athletes assigned!');
      return;
    }

    for (const lane of finishedLanes) {
      const athleteName = raceType === 'Relay' ? `${lane.leg1Name} & ${lane.leg2Name}` : lane.athleteName;
      const student = students.find(s => s.name === (raceType === 'Relay' ? lane.leg1Name : lane.athleteName));
      
      await gasService.saveRaceResult({
        raceType,
        division,
        heat,
        lane: lane.id,
        athleteName,
        house: student?.house || 'Blue', // Fallback
        time: lane.time
      });
    }

    alert('Results saved successfully!');
    resetTimer();
    setHeat(h => h + 1);
  };

  return (
    <div className="container mt-4 pb-5">
      <div className="row g-4">
        {/* Race Config */}
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-dark text-white">Race Configuration</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Race Type</label>
                <select className="form-select" value={raceType} onChange={(e) => setRaceType(e.target.value as RaceType)}>
                  <option value="100M">100M</option>
                  <option value="Relay">Relay</option>
                  <option value="Egg and Spoon">Egg and Spoon</option>
                  <option value="Sack">Sack</option>
                  <option value="Wheel-Chair">Wheel-Chair</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Division</label>
                <select className="form-select" value={division} onChange={(e) => setDivision(e.target.value)}>
                  <option value="Junior">Junior</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Heat</label>
                <div className="input-group">
                  <button className="btn btn-outline-secondary" onClick={() => setHeat(Math.max(1, heat - 1))}><Minus size={16} /></button>
                  <input type="number" className="form-control text-center" value={heat} readOnly />
                  <button className="btn btn-outline-secondary" onClick={() => setHeat(heat + 1)}><Plus size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stopwatch */}
        <div className="col-md-8">
          <div className="card shadow-sm h-100 text-center">
            <div className="card-header bg-primary text-white">Stopwatch</div>
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="display-1 fw-bold font-monospace mb-4 text-primary">
                {formatTime(time)}
              </div>
              <div className="d-flex justify-content-center gap-3">
                {!isRunning ? (
                  <button className="btn btn-success btn-lg px-4" onClick={startTimer}>
                    <Play className="me-2" /> Start
                  </button>
                ) : (
                  <button className="btn btn-danger btn-lg px-4" onClick={stopTimer}>
                    <Square className="me-2" /> Stop
                  </button>
                )}
                <button className="btn btn-info btn-lg px-4 text-white" onClick={() => {}}>
                  <Timer className="me-2" /> Sync
                </button>
                <button className="btn btn-secondary btn-lg px-4" onClick={resetTimer}>
                  <RotateCcw className="me-2" /> Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lane Assignments */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Lane Assignments</h5>
              <div className="btn-group">
                <button className="btn btn-sm btn-outline-primary" onClick={addLane} disabled={lanes.length >= 6}>
                  <Plus size={14} /> Add Lane
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={removeLane} disabled={lanes.length <= 1}>
                  <Minus size={14} /> Remove Lane
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {lanes.map((lane) => (
                  <div key={lane.id} className="col-lg-4 col-md-6">
                    <div className={`card h-100 ${lane.finished ? 'border-success bg-success-subtle' : ''}`}>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-dark fs-6">Lane {lane.id}</span>
                          <span className="font-monospace fw-bold text-primary">{lane.time || '--:--.--'}</span>
                        </div>

                        {raceType === 'Relay' ? (
                          <>
                            <div className="mb-2">
                              <label className="small text-muted">Leg 1 Athlete</label>
                              <select 
                                className="form-select form-select-sm"
                                value={lane.leg1Name}
                                onChange={(e) => setLanes(lanes.map(l => l.id === lane.id ? { ...l, leg1Name: e.target.value } : l))}
                              >
                                <option value="">Select Athlete</option>
                                {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.house})</option>)}
                              </select>
                            </div>
                            <div className="mb-3">
                              <label className="small text-muted">Leg 2 Athlete</label>
                              <select 
                                className="form-select form-select-sm"
                                value={lane.leg2Name}
                                onChange={(e) => setLanes(lanes.map(l => l.id === lane.id ? { ...l, leg2Name: e.target.value } : l))}
                              >
                                <option value="">Select Athlete</option>
                                {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.house})</option>)}
                              </select>
                            </div>
                            <div className="d-flex gap-2">
                              <button 
                                className={`btn btn-sm flex-grow-1 ${lane.batonChanged ? 'btn-secondary' : 'btn-warning'}`}
                                onClick={() => handleBatonChange(lane.id)}
                                disabled={lane.finished}
                              >
                                Baton Change
                              </button>
                              <button 
                                className="btn btn-sm btn-primary flex-grow-1"
                                onClick={() => handleFinish(lane.id)}
                                disabled={lane.finished}
                              >
                                Finish
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="mb-3">
                              <label className="small text-muted">Athlete</label>
                              <select 
                                className="form-select"
                                value={lane.athleteName}
                                onChange={(e) => setLanes(lanes.map(l => l.id === lane.id ? { ...l, athleteName: e.target.value } : l))}
                              >
                                <option value="">Select Athlete</option>
                                {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.house})</option>)}
                              </select>
                            </div>
                            <button 
                              className="btn btn-primary w-100"
                              onClick={() => handleFinish(lane.id)}
                              disabled={lane.finished}
                            >
                              Finish
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-footer bg-white border-top-0 pt-0 pb-3 px-3">
              <button className="btn btn-success w-100 btn-lg shadow-sm" onClick={saveResults}>
                <Save className="me-2" /> Submit All Results & Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
