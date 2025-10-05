import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { BookOpen, Award, TrendingUp, Zap, Star, Trophy, Target, ArrowRight, Sparkles } from 'lucide-react';

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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
              <Sparkles className="w-8 h-8 text-primary-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    {
      label: 'Total Exams',
      value: progress?.stats?.totalExams || 0,
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Prestige Points',
      value: progress?.totalPrestige || 0,
      icon: Trophy,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Badges Earned',
      value: (progress?.subjects?.length || 0) + (progress?.genericBadges?.length || 0),
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Current Streak',
      value: `${progress?.stats?.currentStreak || 0} days`,
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 opacity-10 rounded-3xl"></div>
          <div className="relative card p-8 md:p-12">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-semibold text-primary-700">Welcome Back!</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-3">
                  Hey, {user?.name || 'Student'}!
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Ready to level up your skills? Let's make today count with some awesome challenges.
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <Link to="/student/exam-center">
                    <button className="btn-primary flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Start New Exam
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                  <Link to="/student/progress">
                    <button className="btn-secondary flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      View Progress
                    </button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full opacity-20 animate-pulse"></div>
                  <div className="absolute inset-4 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full opacity-30 animate-bounce-subtle"></div>
                  <div className="absolute inset-8 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-20 h-20 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="card-hover p-6 group animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>
                  <div className={`px-3 py-1 bg-gradient-to-r ${stat.color} rounded-full`}>
                    <Star className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-gray-900">{stat.value}</p>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full animate-pulse`} style={{ width: '70%' }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900">Recent Activity</h2>
              <Link to="/student/progress" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentExams.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No exams taken yet</p>
                <Link to="/student/exam-center">
                  <button className="btn-primary text-sm">Take Your First Exam</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExams.map((exam, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        exam.scorePercentage >= 80 ? 'bg-green-100' :
                        exam.scorePercentage >= 60 ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        <span className={`text-lg font-bold ${
                          exam.scorePercentage >= 80 ? 'text-green-600' :
                          exam.scorePercentage >= 60 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {exam.scorePercentage}%
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{exam.examId?.title || 'Exam'}</p>
                        <p className="text-sm text-gray-500">{new Date(exam.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {exam.scorePercentage >= 80 && (
                      <Trophy className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Subjects */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-900">Top Subjects</h2>
              <Link to="/student/progress" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {!progress?.subjects || progress.subjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">Start earning stars in subjects</p>
                <Link to="/student/exam-center">
                  <button className="btn-primary text-sm">Begin Learning</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {progress.subjects.slice(0, 3).map((subject, index) => {
                  const totalStars = subject.levels.reduce((sum, l) => sum + l.stars, 0);
                  return (
                    <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{subject.subjectId?.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                          <span className="font-bold text-gray-900">{totalStars}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {subject.levels.map((level, idx) => (
                          <div key={idx} className="flex-1">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                style={{ width: `${(level.stars / 10) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{level.level}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 animate-pulse"></div>
          <div className="relative p-8 md:p-12 text-center">
            <Sparkles className="w-12 h-12 text-white mx-auto mb-4 animate-bounce-subtle" />
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">
              Keep Up The Great Work!
            </h3>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              You're on fire! Every exam brings you closer to mastery. Let's keep that momentum going.
            </p>
            <Link to="/student/exam-center">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg">
                Take Another Challenge
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
