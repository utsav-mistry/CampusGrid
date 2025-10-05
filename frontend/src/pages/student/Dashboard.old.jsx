import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, historyRes] = await Promise.all([
          api.get('/progress'),
          api.get('/progress/history?limit=5'),
        ]);
        setProgress(progressRes.data.data);
        setRecentExams(historyRes.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.profile?.branch && `${user.profile.branch} • `}
            {user?.profile?.year && `Year ${user.profile.year}`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {progress?.stats?.totalExams || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Prestige</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {progress?.totalPrestige || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {progress?.genericBadges?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {progress?.stats?.currentStreak || 0} days
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/student/exam-center"
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-2xl font-bold mb-2">Start General Exam</h3>
            <p className="text-primary-100">
              Select subject and level to begin practicing
            </p>
          </Link>

          <Link
            to="/student/progress"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-2xl font-bold mb-2">View Progress</h3>
            <p className="text-purple-100">
              Check your badges, stars, and prestige
            </p>
          </Link>
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Exams</h2>
          </div>
          <div className="p-6">
            {recentExams.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No exams taken yet. Start your first exam!
              </p>
            ) : (
              <div className="space-y-4">
                {recentExams.map((exam) => (
                  <div
                    key={exam._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {exam.subjectId?.name} - {exam.level}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(exam.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        {exam.scorePercentage?.toFixed(0)}%
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{exam.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
