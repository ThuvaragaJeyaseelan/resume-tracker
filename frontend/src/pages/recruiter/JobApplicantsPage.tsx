import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout';
import * as api from '../../services/api';
import type { Applicant, Job, JobApplicantStats, ApplicantStatus } from '../../types';

export function JobApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [stats, setStats] = useState<JobApplicantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('jobRelevancyScore');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | ''>('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        const data = await api.getJobApplicants(jobId, sortBy, 'desc', statusFilter || undefined);
        setApplicants(data.applicants);
        setJob(data.job);
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch applicants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, sortBy, statusFilter]);

  const handleStatusChange = async (applicantId: string, newStatus: ApplicantStatus) => {
    try {
      const updated = await api.updateApplicantStatus(applicantId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicantId ? updated : a))
      );
      if (selectedApplicant?.id === applicantId) {
        setSelectedApplicant(updated);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDownloadResume = async (applicantId: string, name: string) => {
    try {
      const blob = await api.downloadResume(applicantId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download resume:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusBadge = (status: ApplicantStatus) => {
    const styles: Record<ApplicantStatus, string> = {
      new: 'badge-primary',
      reviewed: 'badge-secondary',
      shortlisted: 'badge-success',
      rejected: 'badge-danger',
      hired: 'badge-success',
    };
    return styles[status] || 'badge-gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar variant="recruiter" />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="recruiter" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job?.title}</h1>
              <p className="mt-1 text-gray-600">
                {job?.department && `${job.department} • `}
                {job?.location || 'Remote'} • {job?.employmentType}
              </p>
            </div>
            <span className={`badge ${
              job?.status === 'active' ? 'badge-success' :
              job?.status === 'closed' ? 'badge-danger' : 'badge-gray'
            }`}>
              {job?.status}
            </span>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card p-4">
              <p className="text-sm text-gray-600">Total Applicants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-600">High Matches</p>
              <p className="text-2xl font-bold text-green-600">{stats.highMatches}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-600">Avg Match Score</p>
              <p className="text-2xl font-bold text-primary-600">{Math.round(stats.avgRelevancyScore)}%</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-secondary-600">{stats.byStatus?.shortlisted || 0}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-48"
          >
            <option value="jobRelevancyScore">Sort by Match Score</option>
            <option value="createdAt">Sort by Date Applied</option>
            <option value="priorityScore">Sort by General Score</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicantStatus | '')}
            className="input w-40"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>

        <div className="flex gap-6">
          {/* Applicants List */}
          <div className={`${selectedApplicant ? 'w-1/2' : 'w-full'} space-y-4 transition-all`}>
            {applicants.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No applicants yet</h3>
                <p className="text-gray-500">Applications will appear here when candidates apply.</p>
              </div>
            ) : (
              applicants.map((applicant) => (
                <div
                  key={applicant.id}
                  onClick={() => setSelectedApplicant(applicant)}
                  className={`card-hover p-4 cursor-pointer ${
                    selectedApplicant?.id === applicant.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{applicant.name}</h3>
                        <span className={`badge ${getStatusBadge(applicant.status)}`}>
                          {applicant.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{applicant.email}</p>
                      {applicant.summary && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{applicant.summary}</p>
                      )}
                      {applicant.skillMatches && applicant.skillMatches.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {applicant.skillMatches.slice(0, 4).map((skill) => (
                            <span key={skill} className="badge-success text-xs">{skill}</span>
                          ))}
                          {applicant.skillMatches.length > 4 && (
                            <span className="badge-gray text-xs">+{applicant.skillMatches.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`ml-4 px-3 py-1 rounded-lg font-bold text-lg ${getScoreColor(applicant.jobRelevancyScore)}`}>
                      {applicant.jobRelevancyScore}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Applicant Detail Panel */}
          {selectedApplicant && (
            <div className="w-1/2 card sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedApplicant.name}</h2>
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{selectedApplicant.email}</span>
                  {selectedApplicant.phone && <span>{selectedApplicant.phone}</span>}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${getScoreColor(selectedApplicant.jobRelevancyScore)}`}>
                    <p className="text-sm font-medium opacity-75">Job Match</p>
                    <p className="text-3xl font-bold">{selectedApplicant.jobRelevancyScore}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-100">
                    <p className="text-sm font-medium text-gray-600">General Score</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedApplicant.priorityScore}</p>
                  </div>
                </div>

                {/* Match Summary */}
                {selectedApplicant.jobMatchSummary && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Match Analysis</h4>
                    <p className="text-sm text-gray-600">{selectedApplicant.jobMatchSummary}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedApplicant.skillMatches && selectedApplicant.skillMatches.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Matching Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.skillMatches.map((skill) => (
                        <span key={skill} className="badge-success">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedApplicant.skillGaps && selectedApplicant.skillGaps.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Skill Gaps</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.skillGaps.map((skill) => (
                        <span key={skill} className="badge-warning">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights */}
                {selectedApplicant.highlights && selectedApplicant.highlights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
                    <ul className="space-y-1">
                      {selectedApplicant.highlights.map((highlight, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Status:</label>
                    <select
                      value={selectedApplicant.status}
                      onChange={(e) => handleStatusChange(selectedApplicant.id, e.target.value as ApplicantStatus)}
                      className="input w-40"
                    >
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleDownloadResume(selectedApplicant.id, selectedApplicant.name)}
                    className="btn-primary w-full"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Resume
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default JobApplicantsPage;

