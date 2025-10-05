import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Search, Mail, Award, TrendingUp, Eye } from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.universityEmail?.toLowerCase().includes(search.toLowerCase())
  );

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-2">View and manage student accounts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">With University Email</p>
            <p className="text-2xl font-bold text-gray-900">
              {students.filter(s => s.universityEmail).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Active This Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {students.filter(s => s.lastActive && new Date(s.lastActive) > new Date(Date.now() - 7*24*60*60*1000)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Avg Prestige</p>
            <p className="text-2xl font-bold text-gray-900">
              {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.totalPrestige || 0), 0) / students.length) : 0}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">University Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prestige</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exams</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {student.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">ID: {student._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{student.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.universityEmail ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-900">{student.universityEmail}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not linked</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {student.totalPrestige || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-900">{student.totalExams || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-primary-600 hover:text-primary-800 flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Detail Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4">Student Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-medium text-gray-900">{selectedStudent.name || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg text-gray-900">{selectedStudent.email}</p>
                </div>
                
                {selectedStudent.universityEmail && (
                  <div>
                    <p className="text-sm text-gray-600">University Email</p>
                    <p className="text-lg text-gray-900">{selectedStudent.universityEmail}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Prestige</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedStudent.totalPrestige || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Exams</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedStudent.totalExams || 0}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Progress Summary</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      Full progress details including badges, stars, and exam history would be displayed here.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
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
