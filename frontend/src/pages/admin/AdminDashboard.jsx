import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Users, BookOpen, FileQuestion, TrendingUp, Award, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalQuestions: 0,
    totalExams: 0,
    activeExams: 0,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In production, create /api/admin/stats endpoint
      // For now, using placeholder data
      setStats({
        totalStudents: 156,
        totalSubjects: 5,
        totalQuestions: 250,
        totalExams: 1240,
        activeExams: 12,
        avgScore: 78.5
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Students', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+12 this week'
    },
    { 
      title: 'Subjects', 
      value: stats.totalSubjects, 
      icon: BookOpen, 
      color: 'bg-green-500',
      change: 'Active'
    },
    { 
      title: 'Question Bank', 
      value: stats.totalQuestions, 
      icon: FileQuestion, 
      color: 'bg-purple-500',
      change: '+15 this month'
    },
    { 
      title: 'Total Exams', 
      value: stats.totalExams, 
      icon: TrendingUp, 
      color: 'bg-orange-500',
      change: `${stats.activeExams} active`
    },
    { 
      title: 'Average Score', 
      value: `${stats.avgScore}%`, 
      icon: Award, 
      color: 'bg-pink-500',
      change: '+2.3% from last month'
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage students, subjects, questions, and monitor platform activity
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">Manage Students</p>
              <p className="text-sm text-gray-500">View and edit student data</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <BookOpen className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">Manage Subjects</p>
              <p className="text-sm text-gray-500">Add or edit subjects</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <FileQuestion className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">Question Bank</p>
              <p className="text-sm text-gray-500">Add or edit questions</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">Analytics</p>
              <p className="text-sm text-gray-500">View detailed reports</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">12 new students registered</p>
                <p className="text-sm text-gray-500">In the last 7 days</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-green-100 p-2 rounded-lg">
                <FileQuestion className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">15 questions added to bank</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-orange-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">1,240 exams completed</p>
                <p className="text-sm text-gray-500">Total platform activity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Admin Portal - Phase 1</p>
            <p className="text-sm text-yellow-700 mt-1">
              Full CRUD operations for students, subjects, and questions will be implemented in Phase 2.
              Current dashboard shows overview statistics and quick access to key features.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
