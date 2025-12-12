import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../../components/layout';
import * as api from '../../services/api';
import type { EmploymentType, JobStatus } from '../../types';

export function EditJobPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    location: '',
    employmentType: 'full-time' as EmploymentType,
    salaryRange: '',
    status: 'draft' as JobStatus,
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      try {
        const job = await api.getJob(jobId);
        setFormData({
          title: job.title,
          department: job.department || '',
          description: job.description || '',
          requirements: job.requirements || '',
          location: job.location || '',
          employmentType: job.employmentType,
          salaryRange: job.salaryRange || '',
          status: job.status,
        });
      } catch (err) {
        console.error('Failed to fetch job:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    
    setError('');
    setSaving(true);

    try {
      await api.updateJob(jobId, formData);
      navigate('/jobs');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
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
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Jobs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Job Posting</h1>
          <p className="mt-1 text-gray-600">Update the job details</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="label">Job Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="label">Department</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Engineering"
                />
              </div>
              <div>
                <label htmlFor="location" className="label">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., San Francisco, CA or Remote"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="employmentType" className="label">Employment Type</label>
                <select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label htmlFor="salaryRange" className="label">Salary Range</label>
                <input
                  id="salaryRange"
                  name="salaryRange"
                  type="text"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., $100k - $150k"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="label">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input w-48"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Job Details</h2>
            
            <div>
              <label htmlFor="description" className="label">Job Description</label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="input"
                placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              />
            </div>

            <div>
              <label htmlFor="requirements" className="label">
                Requirements
                <span className="text-gray-400 font-normal ml-1">(Used for AI matching)</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={6}
                value={formData.requirements}
                onChange={handleChange}
                className="input"
                placeholder="List the skills, experience, and qualifications required for this role..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Be specific about required skills and experience. The AI will use this to score candidates.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link to="/jobs" className="btn-outline">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default EditJobPage;

