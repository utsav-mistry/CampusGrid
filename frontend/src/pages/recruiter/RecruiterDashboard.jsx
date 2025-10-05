import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Briefcase, Users, FileText, TrendingUp, Plus, AlertCircle } from 'lucide-react';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState({
    totalDrives: 0,
    activeDrives: 0,
    totalApplicants: 0,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In production, create /api/recruiter/stats endpoint
      // For now, using placeholder data
      setStats({
        totalDrives: 8,
        activeDrives: 3,
        totalApplicants: 245,
        avgScore: 76.8
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Drives', 
      value: stats.totalDrives, 
      icon: Briefcase, 
      color: 'bg-blue-500',
      change: `${stats.activeDrives} active`
    },
    { 
      title: 'Total Applicants', 
      value: stats.totalApplicants, 
      icon: Users, 
      color: 'bg-green-500',
      change: '+32 this week'
    },
    { 
      title: 'Average Score', 
      value: `${stats.avgScore}%`, 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      change: '+3.2% from last drive'
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Create drives, manage applicants, and view recruitment analytics
            </p>
          </div>
          <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Drive
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Active Drives */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Active Recruitment Drives</h2>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Software Engineer - Backend</h3>
                  <p className="text-sm text-gray-600 mt-1">TechCorp Solutions</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-600">
                      <span className="font-medium">78</span> applicants
                    </span>
                    <span className="text-gray-600">
                      Avg Score: <span className="font-medium">82%</span>
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View Details →
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Frontend Developer</h3>
                  <p className="text-sm text-gray-600 mt-1">WebDev Inc</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-600">
                      <span className="font-medium">52</span> applicants
                    </span>
                    <span className="text-gray-600">
                      Avg Score: <span className="font-medium">75%</span>
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View Details →
                </button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Data Analyst</h3>
                  <p className="text-sm text-gray-600 mt-1">DataCo Analytics</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="text-gray-600">
                      <span className="font-medium">34</span> applicants
                    </span>
                    <span className="text-gray-600">
                      Avg Score: <span className="font-medium">79%</span>
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">Create New Drive</p>
              <p className="text-sm text-gray-500">Set up recruitment drive</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">View Applicants</p>
              <p className="text-sm text-gray-500">Review all applications</p>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center">
              <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">Export Reports</p>
              <p className="text-sm text-gray-500">Download applicant data</p>
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Recruiter Portal - Phase 1</p>
            <p className="text-sm text-yellow-700 mt-1">
              Full drive creation, applicant management, and analytics features will be implemented in Phase 2.
              Current dashboard shows overview and active drives.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
