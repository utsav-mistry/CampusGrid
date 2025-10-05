import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Download, Filter, Star, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function ApplicantManagement() {
  const { driveId } = useParams();
  const [drive, setDrive] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, passed, failed
  const [sortBy, setSortBy] = useState('score'); // score, name, date
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    fetchData();
  }, [driveId]);

  const fetchData = async () => {
    try {
      const [driveRes, applicantsRes] = await Promise.all([
        api.get(`/recruiter/drives/${driveId}`),
        api.get(`/recruiter/drives/${driveId}/applicants`)
      ]);
      setDrive(driveRes.data.data);
      setApplicants(applicantsRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Score', 'Status', 'Completed At'];
    const rows = filteredApplicants.map(a => [
      a.studentId?.name || 'N/A',
      a.studentId?.email || 'N/A',
      a.scorePercentage + '%',
      a.status,
      new Date(a.completedAt).toLocaleString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${drive?.title || 'drive'}_applicants.csv`;
    a.click();
  };

  const filteredApplicants = applicants
    .filter(a => {
      if (filter === 'passed') return a.scorePercentage >= 60;
      if (filter === 'failed') return a.scorePercentage < 60;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.scorePercentage - a.scorePercentage;
      if (sortBy === 'name') return (a.studentId?.name || '').localeCompare(b.studentId?.name || '');
      if (sortBy === 'date') return new Date(b.completedAt) - new Date(a.completedAt);
      return 0;
    });

  const stats = {
    total: applicants.length,
    passed: applicants.filter(a => a.scorePercentage >= 60).length,
    failed: applicants.filter(a => a.scorePercentage < 60).length,
    avgScore: applicants.length > 0 
      ? Number((applicants.reduce((sum, a) => sum + a.scorePercentage, 0) / applicants.length).toFixed(1))
      : 0
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{drive?.title}</h1>
            <p className="text-gray-600 mt-2">{drive?.driveDetails?.companyName}</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Applicants</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Passed (≥60%)</p>
            <p className="text-3xl font-bold text-green-600">{stats.passed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Failed (&lt;60%)</p>
            <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Average Score</p>
            <p className="text-3xl font-bold text-blue-600">{stats.avgScore}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('passed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'passed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Passed ({stats.passed})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'failed' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Failed ({stats.failed})
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="score">Score (High to Low)</option>
                <option value="name">Name (A-Z)</option>
                <option value="date">Date (Recent First)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Violations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No applicants found
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant, index) => (
                    <tr key={applicant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index < 3 && <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />}
                          <span className="font-medium text-gray-900">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {applicant.studentId?.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <p className="font-medium text-gray-900">{applicant.studentId?.name || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {applicant.studentId?.universityEmail || applicant.studentId?.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                applicant.scorePercentage >= 80 ? 'bg-green-500' :
                                applicant.scorePercentage >= 60 ? 'bg-blue-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${applicant.scorePercentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-900">{applicant.scorePercentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {applicant.scorePercentage >= 60 ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Passed</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          applicant.violations?.length === 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {applicant.violations?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(applicant.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedApplicant(applicant)}
                          className="text-primary-600 hover:text-primary-800 flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Details</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Applicant Detail Modal */}
        {selectedApplicant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Applicant Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedApplicant.studentId?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{selectedApplicant.studentId?.name || 'N/A'}</p>
                    <p className="text-gray-600">{selectedApplicant.studentId?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-3xl font-bold text-gray-900">{selectedApplicant.scorePercentage}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`text-xl font-bold ${selectedApplicant.scorePercentage >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedApplicant.scorePercentage >= 60 ? 'Passed' : 'Failed'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Violations</p>
                  {selectedApplicant.violations?.length === 0 ? (
                    <p className="text-green-600">No violations - Clean exam</p>
                  ) : (
                    <div className="space-y-1">
                      {selectedApplicant.violations?.map((v, i) => (
                        <p key={i} className="text-sm text-red-600">• {v.type} at {new Date(v.timestamp).toLocaleTimeString()}</p>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Exam Summary</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Completed:</span> {new Date(selectedApplicant.completedAt).toLocaleString()}</p>
                    <p className="text-sm"><span className="font-medium">Duration:</span> {selectedApplicant.timeTaken ? `${Math.floor(selectedApplicant.timeTaken / 60)} minutes` : 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Questions:</span> {selectedApplicant.answers?.length || 0} answered</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedApplicant(null)}
                className="mt-6 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
