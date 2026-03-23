import React, { useState, useEffect } from 'react';
import { Student, House } from '../types';
import { gasService } from '../services/gasService';
import { UserPlus, RefreshCw, User } from 'lucide-react';

export const StudentsTab: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState('');
  const [house, setHouse] = useState<House>('Blue');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await gasService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (editingId) {
        await gasService.updateStudent(editingId, name);
        setEditingId(null);
      } else {
        await gasService.addStudent(name, house);
      }
      setName('');
      await fetchStudents();
    } catch (error) {
      console.error('Operation failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setName(student.name);
    setHouse(student.house);
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Student Registration</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label">Full Name</label>
              <div className="input-group">
                <span className="input-group-text"><User size={18} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Color House</label>
              <select
                className="form-select"
                value={house}
                onChange={(e) => setHouse(e.target.value as House)}
                disabled={!!editingId}
              >
                <option value="Blue">Blue House</option>
                <option value="Red">Red House</option>
                <option value="Yellow">Yellow House</option>
              </select>
            </div>
            <div className="col-md-4">
              <button type="submit" className={`btn ${editingId ? 'btn-warning' : 'btn-success'} w-100`} disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : editingId ? (
                  <><RefreshCw size={18} className="me-2" /> Update Name</>
                ) : (
                  <><UserPlus size={18} className="me-2" /> Register Student</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Registered Students</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={fetchStudents}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>House</th>
                  <th>Points</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">No students registered yet.</td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td className="fw-medium">{student.name}</td>
                      <td>
                        <span className={`badge rounded-pill bg-${student.house.toLowerCase() === 'yellow' ? 'warning text-dark' : student.house.toLowerCase()}`}>
                          {student.house}
                        </span>
                      </td>
                      <td className="fw-bold text-primary">{student.points}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleEdit(student)}
                        >
                          Edit Name
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
