import { useState, useEffect, useCallback } from 'react';
import { FileUpload } from './components/molecules';
import { ApplicantList } from './components/organisms';
import type { Applicant, ApplicantStatus, ApplicantStats } from './types';
import * as api from './services/api';
import './App.css';

function App() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [stats, setStats] = useState<ApplicantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'priorityScore' | 'createdAt'>('priorityScore');
  const [filterStatus, setFilterStatus] = useState<ApplicantStatus | ''>('');

  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getApplicants(
        sortBy,
        'desc',
        filterStatus || undefined
      );
      setApplicants(data);
      setError(null);
    } catch (err) {
      setError('Failed to load applicants');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterStatus]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
    fetchStats();
  }, [fetchApplicants, fetchStats]);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      const newApplicant = await api.uploadResume(file);
      setApplicants((prev) => [newApplicant, ...prev].sort((a, b) => b.priorityScore - a.priorityScore));
      fetchStats();
    } catch (err) {
      setError('Failed to upload and analyze resume. Please check your API key and try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ApplicantStatus) => {
    try {
      const updated = await api.updateApplicantStatus(id, status);
      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      fetchStats();
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this applicant?')) return;

    try {
      await api.deleteApplicant(id);
      setApplicants((prev) => prev.filter((a) => a.id !== id));
      fetchStats();
    } catch (err) {
      setError('Failed to delete applicant');
      console.error(err);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Resume Tracker</h1>
          <p>AI-Powered Applicant Prioritization</p>
        </div>
      </header>

      <main className="app-main">
        <div className="dashboard-grid">
          <aside className="sidebar">
            <div className="upload-section">
              <h2>Upload Resume</h2>
              <FileUpload onFileSelect={handleFileUpload} isUploading={uploading} />
            </div>

            {stats && (
              <div className="stats-section">
                <h2>Overview</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{Math.round(stats.avgScore)}</span>
                    <span className="stat-label">Avg Score</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{stats.byStatus?.shortlisted || 0}</span>
                    <span className="stat-label">Shortlisted</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">{stats.byStatus?.new || 0}</span>
                    <span className="stat-label">New</span>
                  </div>
                </div>
              </div>
            )}
          </aside>

          <section className="main-content">
            <div className="content-header">
              <h2>Applicants</h2>
              <div className="filters">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'priorityScore' | 'createdAt')}
                >
                  <option value="priorityScore">Sort by Score</option>
                  <option value="createdAt">Sort by Date</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ApplicantStatus | '')}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="error-banner">
                <span>{error}</span>
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            <ApplicantList
              applicants={applicants}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              loading={loading}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
