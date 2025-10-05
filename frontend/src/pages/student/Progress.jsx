import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { CoreBadge, SoftBadge, BadgeGrid } from '../../components/BadgeDisplay';
import api from '../../lib/api';
import { getLevelColor, getStarEmoji } from '../../lib/utils';
import { Award, Star, TrendingUp, Trophy } from 'lucide-react';

// Badge icon mapping
const getBadgeIcon = (badgeId) => {
  const iconMap = {
    first_steps: '🎯',
    exam_rookie: '📝',
    exam_veteran: '🎖️',
    exam_master: '👑',
    exam_legend: '🏆',
    perfectionist: '💯',
    consistent_performer: '📊',
    high_achiever: '🌟',
    excellence_seeker: '💎',
    focus_keeper: '🎯',
    clean_record: '✨',
    integrity_champion: '🛡️',
    speed_demon: '⚡',
    quick_thinker: '🧠',
    dedicated_learner: '📅',
    streak_holder: '🔥',
    unstoppable: '💪',
    marathon_runner: '🏃',
    polyglot: '🌐',
    renaissance_scholar: '📚',
    subject_master: '⭐',
    grand_master: '👑',
    code_warrior: '💻',
    code_master: '🖥️',
    algorithm_expert: '🧮',
    quiz_master: '❓',
    knowledge_bank: '🧠',
    rising_star: '🌠',
    prestige_hunter: '💫',
    prestige_legend: '✨',
    prestige_titan: '🌟',
    early_bird: '🌅',
    night_owl: '🦉',
    weekend_warrior: '🎮'
  };
  return iconMap[badgeId] || '🏅';
};

export default function Progress() {
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const [progressRes, badgesRes] = await Promise.all([
          api.get('/progress'),
          api.get('/progress/badges'),
        ]);
        setProgress(progressRes.data.data);
        setBadges(badgesRes.data.data);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
          <p className="text-gray-600 mt-2">Track your badges, stars, and prestige</p>
        </div>

        {/* Total Prestige */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Prestige</p>
              <p className="text-5xl font-bold mt-2">{progress?.totalPrestige || 0}</p>
            </div>
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Subject Progress</h2>
          </div>
          <div className="p-6">
            {!progress?.subjects || progress.subjects.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No progress yet. Start taking exams to earn badges and stars!
              </p>
            ) : (
              <div className="space-y-6">
                {progress.subjects.map((subject) => (
                  <div key={subject.subjectId._id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {subject.subjectId.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {subject.levels.map((level) => (
                        <div
                          key={level.level}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(level.level)}`}>
                              {level.level}
                            </span>
                            {level.badge.earned && (
                              <Award className="w-5 h-5 text-yellow-500" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-2xl font-bold text-gray-900">
                                {level.stars}/10
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {level.examsCompleted} exams • {level.averageScore?.toFixed(0)}% avg
                            </p>
                            <p className="text-sm font-medium text-purple-600">
                              {level.prestigePoints} prestige points
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Generic Badges */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Achievement Badges</h2>
          </div>
          <div className="p-6">
            {!badges?.genericBadges || badges.genericBadges.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No achievement badges yet. Keep taking exams to unlock them!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.genericBadges.map((badge) => (
                  <div
                    key={badge.badgeId}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{badge.name}</h3>
                        <p className="text-sm text-gray-600">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual Badge Display - Core Badges */}
        {progress?.subjects && progress.subjects.length > 0 && (
          <BadgeGrid title="Core Badges (Subject + Level)">
            {progress.subjects.map((subject) =>
              subject.levels.map((level) => (
                <CoreBadge
                  key={`${subject.subjectId._id}-${level.level}`}
                  subject={subject.subjectId.name}
                  level={level.level}
                  stars={level.stars}
                />
              ))
            )}
          </BadgeGrid>
        )}

        {/* Visual Badge Display - Soft Badges */}
        {badges?.genericBadges && badges.genericBadges.length > 0 && (
          <BadgeGrid title="Soft Badges (Achievements)">
            {badges.genericBadges.map((badge) => (
              <SoftBadge
                key={badge.badgeId}
                name={badge.name}
                tier={badge.tier || 'bronze'}
                icon={getBadgeIcon(badge.badgeId)}
                earned={true}
              />
            ))}
          </BadgeGrid>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress?.stats?.totalExams || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Badges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(badges?.subjectBadges?.length || 0) + (badges?.genericBadges?.length || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress?.stats?.currentStreak || 0} days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
