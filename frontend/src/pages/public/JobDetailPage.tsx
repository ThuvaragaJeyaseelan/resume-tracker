import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout';
import * as api from '../../services/api';
import type { Job } from '../../types';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      
      try {
        const data = await api.getPublicJob(jobId);
        setJob(data);
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !resume) return;

    setError('');
    setApplying(true);

    try {
      await api.submitApplication(jobId, { name, email, phone, resume });
      setApplied(true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar variant="public" />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar variant="public" />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">This job posting may have been removed or is no longer active.</p>
          <Link to="/" className="btn-primary">
            Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="public" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              </div>
              {job.recruiter?.companyName && (
                <p className="text-lg text-gray-600">{job.recruiter.companyName}</p>
              )}
            </div>
            <button
              onClick={() => setShowApplicationModal(true)}
              className="btn-primary btn-lg whitespace-nowrap"
            >
              Apply Now
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-gray-600">
            {job.location && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
            )}
            {job.department && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {job.department}
              </span>
            )}
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.employmentType}
            </span>
            {job.salaryRange && (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.salaryRange}
              </span>
            )}
          </div>
        </div>

        {/* Job Content */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {job.description && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About this Role</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap text-gray-600">{job.description}</p>
                </div>
              </div>
            )}

            {job.requirements && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap text-gray-600">{job.requirements}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Apply Card */}
            <div className="card p-6 bg-gradient-to-br from-primary-50 to-secondary-50">
              <h3 className="font-semibold text-gray-900 mb-2">Ready to apply?</h3>
              <p className="text-sm text-gray-600 mb-4">Submit your application and let AI match your skills with this role.</p>
              <button
                onClick={() => setShowApplicationModal(true)}
                className="btn-primary w-full"
              >
                Apply for this Job
              </button>
            </div>

            {/* Company Info */}
            {job.recruiter?.companyName && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-3">About the Company</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-400">
                      {job.recruiter.companyName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{job.recruiter.companyName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Share */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Share this job</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="btn-outline btn-sm flex-1"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-900/50 transition-opacity" onClick={() => !applying && setShowApplicationModal(false)} />
            
            <div className="relative bg-white rounded-2xl max-w-lg w-full mx-auto shadow-xl transform transition-all">
              {applied ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for applying. We'll review your application and get back to you soon.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowApplicationModal(false)}
                      className="btn-primary"
                    >
                      Close
                    </button>
                    <Link to="/" className="btn-outline">
                      Browse More Jobs
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Apply for {job.title}</h3>
                    <button
                      onClick={() => setShowApplicationModal(false)}
                      disabled={applying}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label htmlFor="name" className="label">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="label">Email *</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="label">Phone *</label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div>
                      <label htmlFor="resume" className="label">Resume *</label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                        <div className="space-y-1 text-center">
                          {resume ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{resume.name}</span>
                            </div>
                          ) : (
                            <>
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="text-sm text-gray-600">
                                <label htmlFor="resume" className="relative cursor-pointer font-medium text-primary-600 hover:text-primary-500">
                                  Upload a file
                                  <input
                                    id="resume"
                                    name="resume"
                                    type="file"
                                    className="sr-only"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <span className="pl-1">or drag and drop</span>
                              </div>
                              <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={applying || !resume}
                        className="btn-primary w-full btn-lg"
                      >
                        {applying ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          'Submit Application'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetailPage;

