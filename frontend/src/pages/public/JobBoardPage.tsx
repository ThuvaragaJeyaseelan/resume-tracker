import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout';
import * as api from '../../services/api';
import type { Job, JobFilters, EmploymentType } from '../../types';

export function JobBoardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<JobFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPublicJobs(pagination.page, 12, {
        search: search || undefined,
        department: department || undefined,
        location: location || undefined,
        employmentType: employmentType || undefined,
      });
      setJobs(data.jobs);
      if (data.pagination) {
        setPagination({
          page: data.pagination.page,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, department, location, employmentType]);

  const fetchFilters = useCallback(async () => {
    try {
      const data = await api.getJobFilters();
      setFilters(data);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearch('');
    setDepartment('');
    setLocation('');
    setEmploymentType('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="public" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-secondary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              Discover amazing opportunities at top companies. Your next career move starts here.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search jobs by title or keyword..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-white focus:outline-none"
                  />
                </div>
                <button type="submit" className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="input w-48"
          >
            <option value="">All Departments</option>
            {filters?.departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="input w-48"
          >
            <option value="">All Locations</option>
            {filters?.locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={employmentType}
            onChange={(e) => {
              setEmploymentType(e.target.value as EmploymentType | '');
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="input w-40"
          >
            <option value="">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>

          {(search || department || location || employmentType) && (
            <button onClick={clearFilters} className="btn-ghost text-sm">
              Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-gray-600">
            {pagination.total} jobs found
          </span>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="card-hover p-6 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="badge-primary">{job.employmentType}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {job.title}
                  </h3>
                  
                  {job.recruiter?.companyName && (
                    <p className="text-sm text-gray-600 mb-3">{job.recruiter.companyName}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
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
                  </div>
                  
                  {job.salaryRange && (
                    <p className="text-sm font-medium text-gray-900 mt-3">{job.salaryRange}</p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn-outline btn-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg">ATS Pro</span>
          </div>
          <p className="text-sm">AI-Powered Applicant Tracking System</p>
          <p className="text-xs mt-4">&copy; {new Date().getFullYear()} ATS Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default JobBoardPage;

