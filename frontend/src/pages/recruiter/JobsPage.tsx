import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout';
import * as api from '../../services/api';
import type { Job, JobStatus } from '../../types';

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await api.getRecruiterJobs(statusFilter || undefined);
        setJobs(data);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [statusFilter]);

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      await api.updateJob(jobId, { status: newStatus });
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job))
      );
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? All applicants will be removed.')) return;
    
    try {
      await api.deleteJob(jobId);
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="recruiter" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
            <p className="mt-1 text-gray-600">Manage your job listings and view applicants</p>
          </div>
          <Link to="/jobs/create" className="btn-primary btn-lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Job
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as JobStatus | '')}
            className="input w-48"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {statusFilter ? `No ${statusFilter} jobs` : 'No jobs yet'}
            </h3>
            <p className="text-gray-500 mb-4">Create your first job posting to start receiving applications.</p>
            <Link to="/jobs/create" className="btn-primary">
              Create Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div key={job.id} className="card-hover p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
                      <span className={`badge ${
                        job.status === 'active' ? 'badge-success' :
                        job.status === 'closed' ? 'badge-danger' : 'badge-gray'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {job.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.employmentType}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.applicantCount || 0} applicants
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {job.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'active')}
                        className="btn-success btn-sm"
                      >
                        Publish
                      </button>
                    )}
                    {job.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'closed')}
                        className="btn-outline btn-sm"
                      >
                        Close
                      </button>
                    )}
                    {job.status === 'closed' && (
                      <button
                        onClick={() => handleStatusChange(job.id, 'active')}
                        className="btn-outline btn-sm"
                      >
                        Reopen
                      </button>
                    )}
                    <Link
                      to={`/jobs/${job.id}/applicants`}
                      className="btn-primary btn-sm"
                    >
                      View Applicants
                    </Link>
                    <Link
                      to={`/jobs/${job.id}/edit`}
                      className="btn-ghost btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="btn-ghost btn-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default JobsPage;

