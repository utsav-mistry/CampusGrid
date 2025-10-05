import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../lib/api';
import { Save, Plus, Trash2, Search } from 'lucide-react';

export default function CreateDrive() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    level: 'Beginner',
    duration: 60,
    mode: 'lenient',
    requiresUniversityEmail: true,
    driveDetails: {
      companyName: '',
      description: '',
      eligibilityCriteria: ''
    },
    selectedQuestions: []
  });

  const [questionSearch, setQuestionSearch] = useState({
    subject: '',
    level: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, questionsRes] = await Promise.all([
        api.get('/exams/general/subjects'),
        api.get('/admin/questions')
      ]);
      setSubjects(subjectsRes.data.data?.subjects || []);
      setAllQuestions(questionsRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    try {
      await api.post('/recruiter/drives', {
        ...formData,
        questions: formData.selectedQuestions.map(q => q._id)
      });
      alert('Drive created successfully!');
      navigate('/recruiter/dashboard');
    } catch (error) {
      alert('Failed to create drive: ' + (error.response?.data?.message || error.message));
    }
  };

  const addQuestion = (question) => {
    if (!formData.selectedQuestions.find(q => q._id === question._id)) {
      setFormData({
        ...formData,
        selectedQuestions: [...formData.selectedQuestions, question]
      });
    }
  };

  const removeQuestion = (questionId) => {
    setFormData({
      ...formData,
      selectedQuestions: formData.selectedQuestions.filter(q => q._id !== questionId)
    });
  };

  const filteredQuestions = allQuestions.filter(q => {
    if (questionSearch.subject && q.subjectId?._id !== questionSearch.subject) return false;
    if (questionSearch.level && q.level !== questionSearch.level) return false;
    if (questionSearch.type && q.type !== questionSearch.type) return false;
    if (questionSearch.search && !q.question.toLowerCase().includes(questionSearch.search.toLowerCase())) return false;
    return true;
  });

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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Recruitment Drive</h1>
            <p className="text-gray-600 mt-2">Set up a new recruitment exam</p>
          </div>
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Create Drive
          </button>
        </div>

        {/* Basic Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Drive Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Software Engineer - Backend"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input
                type="text"
                required
                value={formData.driveDetails.companyName}
                onChange={(e) => setFormData({
                  ...formData,
                  driveDetails: {...formData.driveDetails, companyName: e.target.value}
                })}
                placeholder="e.g., TechCorp Solutions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level *</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Master">Master</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                required
                min="15"
                max="180"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Mode *</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="lenient">Lenient (1 warning)</option>
                <option value="strict">Strict (No warnings)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireUniversity"
                checked={formData.requiresUniversityEmail}
                onChange={(e) => setFormData({...formData, requiresUniversityEmail: e.target.checked})}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="requireUniversity" className="ml-2 text-sm text-gray-700">
                Require university email (@mail.ljku.edu.in)
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.driveDetails.description}
              onChange={(e) => setFormData({
                ...formData,
                driveDetails: {...formData.driveDetails, description: e.target.value}
              })}
              rows="3"
              placeholder="Brief description of the role and requirements..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria</label>
            <textarea
              value={formData.driveDetails.eligibilityCriteria}
              onChange={(e) => setFormData({
                ...formData,
                driveDetails: {...formData.driveDetails, eligibilityCriteria: e.target.value}
              })}
              rows="2"
              placeholder="e.g., CGPA > 7.0, No backlogs..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Selected Questions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Selected Questions ({formData.selectedQuestions.length})
          </h2>
          {formData.selectedQuestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions selected yet. Add questions from below.</p>
          ) : (
            <div className="space-y-2">
              {formData.selectedQuestions.map((q, index) => (
                <div key={q._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Q{index + 1}. </span>
                    <span className="text-gray-700">{q.question}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">{q.level}</span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">{q.type}</span>
                      <span className="text-xs text-gray-600">{q.points} points</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q._id)}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Question Bank */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Questions from Bank</h2>
          
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <input
                type="text"
                placeholder="Search questions..."
                value={questionSearch.search}
                onChange={(e) => setQuestionSearch({...questionSearch, search: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={questionSearch.subject}
              onChange={(e) => setQuestionSearch({...questionSearch, subject: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <select
              value={questionSearch.level}
              onChange={(e) => setQuestionSearch({...questionSearch, level: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Master">Master</option>
            </select>
            <select
              value={questionSearch.type}
              onChange={(e) => setQuestionSearch({...questionSearch, type: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="code">Code</option>
            </select>
          </div>

          {/* Questions List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredQuestions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No questions found</p>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = formData.selectedQuestions.find(sq => sq._id === q._id);
                return (
                  <div
                    key={q._id}
                    className={`p-4 border-2 rounded-lg ${
                      isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900">{q.question}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {q.subjectId?.name}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">{q.level}</span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">{q.type}</span>
                          <span className="text-xs text-gray-600">{q.points} points</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => isSelected ? removeQuestion(q._id) : addQuestion(q)}
                        className={`ml-4 px-4 py-2 rounded-lg flex items-center gap-2 ${
                          isSelected
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </form>
    </Layout>
  );
}
