/**
 * Calculate stars (0-10) based on exams completed and average score
 * FULL 1-10 STAR SYSTEM with granular progression
 * @param {string} level - Difficulty level
 * @param {number} examsCompleted - Number of exams completed with ≥60% score
 * @param {number} averageScore - Average score percentage
 * @returns {number} - Stars (0-10)
 */
export const calculateStars = (level, examsCompleted, averageScore) => {
  if (examsCompleted === 0 || averageScore < 60) {
    return 0;
  }

  // Full 1-10 star thresholds (for Beginner level)
  const baseThresholds = [
    { exams: 2, score: 60, stars: 1 },   // 1 star: 2 exams, 60%
    { exams: 4, score: 65, stars: 2 },   // 2 stars: 4 exams, 65%
    { exams: 6, score: 70, stars: 3 },   // 3 stars: 6 exams, 70%
    { exams: 8, score: 73, stars: 4 },   // 4 stars: 8 exams, 73%
    { exams: 10, score: 76, stars: 5 },  // 5 stars: 10 exams, 76%
    { exams: 12, score: 80, stars: 6 },  // 6 stars: 12 exams, 80%
    { exams: 15, score: 83, stars: 7 },  // 7 stars: 15 exams, 83%
    { exams: 18, score: 86, stars: 8 },  // 8 stars: 18 exams, 86%
    { exams: 22, score: 90, stars: 9 },  // 9 stars: 22 exams, 90%
    { exams: 25, score: 93, stars: 10 }  // 10 stars: 25 exams, 93%
  ];

  // Level multipliers (harder levels need fewer exams but higher scores)
  const levelMultipliers = {
    'Beginner': { examMultiplier: 1.0, scoreMultiplier: 1.0 },
    'Intermediate': { examMultiplier: 0.8, scoreMultiplier: 1.05 },
    'Advanced': { examMultiplier: 0.65, scoreMultiplier: 1.1 },
    'Master': { examMultiplier: 0.5, scoreMultiplier: 1.15 }
  };

  const multiplier = levelMultipliers[level] || levelMultipliers['Beginner'];

  // Find appropriate star level (REPLACEMENT-BASED, NOT ADDITIVE)
  // If student has 2 stars and qualifies for 4 stars, they get 4 stars total (not 6)
  let stars = 0;
  for (const threshold of baseThresholds) {
    const requiredExams = Math.ceil(threshold.exams * multiplier.examMultiplier);
    const requiredScore = Math.min(100, threshold.score * multiplier.scoreMultiplier);

    if (examsCompleted >= requiredExams && averageScore >= requiredScore) {
      stars = threshold.stars; // REPLACE, not add
    }
  }

  return stars; // Returns highest qualified star level
};

/**
 * Calculate prestige points from student progress
 * @param {Object} studentProgress - Student progress document
 * @returns {number} - Total prestige points
 */
export const calculatePrestige = (studentProgress) => {
  const weights = {
    'Beginner': 1,
    'Intermediate': 2,
    'Advanced': 3,
    'Master': 5
  };
  
  let totalPrestige = 0;
  
  if (!studentProgress.subjects) return 0;
  
  for (const subject of studentProgress.subjects) {
    if (!subject.levels) continue;
    
    for (const levelData of subject.levels) {
      const weight = weights[levelData.level] || 1;
      const prestigeForLevel = levelData.stars * weight;
      totalPrestige += prestigeForLevel;
      
      // Update level prestige
      levelData.prestigePoints = prestigeForLevel;
    }
  }
  
  return totalPrestige;
};

/**
 * Check and award generic badges
 * @param {Object} studentProgress - Student progress document
 * @param {Array} examAttempts - All exam attempts
 * @returns {Array} - Array of newly earned badges
 */
export const checkGenericBadges = (studentProgress, examAttempts) => {
  const newBadges = [];
  const existingBadgeIds = studentProgress.genericBadges.map(b => b.badgeId);
  const completedExams = examAttempts.filter(a => a.status === 'completed');
  
  // MILESTONE BADGES
  const milestones = [
    { id: 'first_steps', name: 'First Steps', count: 1, tier: 'bronze' },
    { id: 'exam_rookie', name: 'Exam Rookie', count: 10, tier: 'bronze' },
    { id: 'exam_veteran', name: 'Exam Veteran', count: 50, tier: 'silver' },
    { id: 'exam_master', name: 'Exam Master', count: 100, tier: 'gold' },
    { id: 'exam_legend', name: 'Exam Legend', count: 200, tier: 'platinum' }
  ];

  for (const milestone of milestones) {
    if (studentProgress.stats.totalExams >= milestone.count && !existingBadgeIds.includes(milestone.id)) {
      newBadges.push({
        badgeId: milestone.id,
        name: milestone.name,
        tier: milestone.tier,
        earnedAt: new Date()
      });
    }
  }
  
  // PERFORMANCE BADGES
  if (completedExams.some(e => e.scorePercentage === 100) && !existingBadgeIds.includes('perfectionist')) {
    newBadges.push({ badgeId: 'perfectionist', name: 'Perfectionist', tier: 'gold', earnedAt: new Date() });
  }

  if (completedExams.length >= 20 && !existingBadgeIds.includes('consistent_performer')) {
    const recentExams = completedExams.slice(-20);
    const avg = recentExams.reduce((sum, a) => sum + a.scorePercentage, 0) / 20;
    if (avg >= 85) {
      newBadges.push({ badgeId: 'consistent_performer', name: 'Consistent Performer', tier: 'silver', earnedAt: new Date() });
    }
  }

  if (completedExams.length >= 30 && !existingBadgeIds.includes('high_achiever')) {
    const recentExams = completedExams.slice(-30);
    const avg = recentExams.reduce((sum, a) => sum + a.scorePercentage, 0) / 30;
    if (avg >= 90) {
      newBadges.push({ badgeId: 'high_achiever', name: 'High Achiever', tier: 'gold', earnedAt: new Date() });
    }
  }

  if (completedExams.length >= 50 && !existingBadgeIds.includes('excellence_seeker')) {
    const recentExams = completedExams.slice(-50);
    const avg = recentExams.reduce((sum, a) => sum + a.scorePercentage, 0) / 50;
    if (avg >= 95) {
      newBadges.push({ badgeId: 'excellence_seeker', name: 'Excellence Seeker', tier: 'platinum', earnedAt: new Date() });
    }
  }
  
  // DISCIPLINE BADGES
  if (!existingBadgeIds.includes('focus_keeper')) {
    const strictExams = examAttempts.filter(a => a.mode === 'strict' && a.status === 'completed' && a.violations.length === 0);
    if (strictExams.length >= 10) {
      newBadges.push({ badgeId: 'focus_keeper', name: 'Focus Keeper', tier: 'gold', earnedAt: new Date() });
    }
  }

  const noViolationExams = completedExams.filter(e => e.violations.length === 0);
  if (noViolationExams.length >= 25 && !existingBadgeIds.includes('clean_record')) {
    newBadges.push({ badgeId: 'clean_record', name: 'Clean Record', tier: 'silver', earnedAt: new Date() });
  }
  if (noViolationExams.length >= 50 && !existingBadgeIds.includes('integrity_champion')) {
    newBadges.push({ badgeId: 'integrity_champion', name: 'Integrity Champion', tier: 'platinum', earnedAt: new Date() });
  }
  
  // SPEED BADGES
  const fastExams = completedExams.filter(e => e.timeTaken && e.timeTaken < 600 && e.scorePercentage >= 80);
  if (fastExams.length >= 1 && !existingBadgeIds.includes('speed_demon')) {
    newBadges.push({ badgeId: 'speed_demon', name: 'Speed Demon', tier: 'gold', earnedAt: new Date() });
  }

  const quickExams = completedExams.filter(e => e.timeTaken && e.timeTaken < 900 && e.scorePercentage >= 85);
  if (quickExams.length >= 5 && !existingBadgeIds.includes('quick_thinker')) {
    newBadges.push({ badgeId: 'quick_thinker', name: 'Quick Thinker', tier: 'silver', earnedAt: new Date() });
  }
  
  // STREAK BADGES
  const streak = calculateStreak(completedExams);
  const streakBadges = [
    { id: 'dedicated_learner', name: 'Dedicated Learner', days: 3, tier: 'bronze' },
    { id: 'streak_holder', name: 'Streak Holder', days: 7, tier: 'silver' },
    { id: 'unstoppable', name: 'Unstoppable', days: 14, tier: 'gold' },
    { id: 'marathon_runner', name: 'Marathon Runner', days: 30, tier: 'platinum' }
  ];

  for (const badge of streakBadges) {
    if (streak >= badge.days && !existingBadgeIds.includes(badge.id)) {
      newBadges.push({ badgeId: badge.id, name: badge.name, tier: badge.tier, earnedAt: new Date() });
    }
  }

  // SUBJECT MASTERY BADGES
  const subjectsWithStars = studentProgress.subjects.filter(s => s.levels.some(l => l.stars > 0)).length;
  if (subjectsWithStars >= 3 && !existingBadgeIds.includes('polyglot')) {
    newBadges.push({ badgeId: 'polyglot', name: 'Polyglot', tier: 'silver', earnedAt: new Date() });
  }
  if (subjectsWithStars >= 5 && !existingBadgeIds.includes('renaissance_scholar')) {
    newBadges.push({ badgeId: 'renaissance_scholar', name: 'Renaissance Scholar', tier: 'gold', earnedAt: new Date() });
  }

  const hasTenStars = studentProgress.subjects.some(s => s.levels.some(l => l.stars === 10));
  if (hasTenStars && !existingBadgeIds.includes('subject_master')) {
    newBadges.push({ badgeId: 'subject_master', name: 'Subject Master', tier: 'platinum', earnedAt: new Date() });
  }

  const hasMasterTenStars = studentProgress.subjects.some(s => s.levels.find(l => l.level === 'Master')?.stars === 10);
  if (hasMasterTenStars && !existingBadgeIds.includes('grand_master')) {
    newBadges.push({ badgeId: 'grand_master', name: 'Grand Master', tier: 'platinum', earnedAt: new Date() });
  }

  // PRESTIGE BADGES
  const prestigeBadges = [
    { id: 'rising_star', name: 'Rising Star', points: 100, tier: 'bronze' },
    { id: 'prestige_hunter', name: 'Prestige Hunter', points: 500, tier: 'silver' },
    { id: 'prestige_legend', name: 'Prestige Legend', points: 1000, tier: 'gold' },
    { id: 'prestige_titan', name: 'Prestige Titan', points: 2500, tier: 'platinum' }
  ];

  for (const badge of prestigeBadges) {
    if (studentProgress.totalPrestige >= badge.points && !existingBadgeIds.includes(badge.id)) {
      newBadges.push({ badgeId: badge.id, name: badge.name, tier: badge.tier, earnedAt: new Date() });
    }
  }

  // SPECIAL BADGES
  const earlyBird = completedExams.some(e => new Date(e.completedAt).getHours() < 8);
  if (earlyBird && !existingBadgeIds.includes('early_bird')) {
    newBadges.push({ badgeId: 'early_bird', name: 'Early Bird', tier: 'bronze', earnedAt: new Date() });
  }

  const nightOwl = completedExams.some(e => new Date(e.completedAt).getHours() >= 23);
  if (nightOwl && !existingBadgeIds.includes('night_owl')) {
    newBadges.push({ badgeId: 'night_owl', name: 'Night Owl', tier: 'bronze', earnedAt: new Date() });
  }

  const weekendExams = completedExams.filter(e => {
    const day = new Date(e.completedAt).getDay();
    return day === 0 || day === 6;
  });
  if (weekendExams.length >= 10 && !existingBadgeIds.includes('weekend_warrior')) {
    newBadges.push({ badgeId: 'weekend_warrior', name: 'Weekend Warrior', tier: 'silver', earnedAt: new Date() });
  }
  
  return newBadges;
};

/**
 * Calculate current exam streak
 * @param {Array} completedExams - Completed exam attempts
 * @returns {number} - Current streak in days
 */
const calculateStreak = (completedExams) => {
  if (!completedExams || completedExams.length === 0) return 0;

  const sortedExams = completedExams
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  let streak = 1;
  let currentDate = new Date(sortedExams[0].completedAt);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sortedExams.length; i++) {
    const examDate = new Date(sortedExams[i].completedAt);
    examDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((currentDate - examDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      streak++;
      currentDate = examDate;
    } else if (dayDiff > 1) {
      break;
    }
  }

  return streak;
};

/**
 * Update student progress after exam completion
 * @param {string} studentId - Student ID
 * @param {Object} examAttempt - Completed exam attempt
 * @returns {Object} - Updated progress
 */
export const updateStudentProgress = async (studentId, examAttempt) => {
  const StudentProgress = (await import('../models/StudentProgress.js')).default;
  const ExamAttempt = (await import('../models/ExamAttempt.js')).default;
  
  // Get or create progress document
  let progress = await StudentProgress.findOne({ studentId });
  if (!progress) {
    progress = new StudentProgress({ studentId });
  }
  
  // Find or create subject entry
  let subjectEntry = progress.subjects.find(s => 
    s.subjectId.toString() === examAttempt.subjectId.toString()
  );
  
  if (!subjectEntry) {
    subjectEntry = {
      subjectId: examAttempt.subjectId,
      levels: []
    };
    progress.subjects.push(subjectEntry);
  }
  
  // Find or create level entry
  let levelEntry = subjectEntry.levels.find(l => l.level === examAttempt.level);
  if (!levelEntry) {
    levelEntry = {
      level: examAttempt.level,
      badge: { earned: false },
      stars: 0,
      examsCompleted: 0,
      averageScore: 0,
      prestigePoints: 0
    };
    subjectEntry.levels.push(levelEntry);
  }
  
  // Only count if score >= 60%
  if (examAttempt.scorePercentage >= 60) {
    levelEntry.examsCompleted += 1;
    
    // Recalculate average score
    const levelAttempts = await ExamAttempt.find({
      studentId,
      subjectId: examAttempt.subjectId,
      level: examAttempt.level,
      status: 'completed',
      scorePercentage: { $gte: 60 }
    });
    
    const totalScore = levelAttempts.reduce((sum, a) => sum + a.scorePercentage, 0);
    levelEntry.averageScore = totalScore / levelAttempts.length;
    
    // Calculate stars (FAIL-SAFE: replaces old value, not additive)
    // If student had 2 stars and now qualifies for 4, they get 4 total (not 6)
    // STARS CAN BE LOST: If average drops, stars decrease accordingly
    const newStars = calculateStars(
      levelEntry.level,
      levelEntry.examsCompleted,
      levelEntry.averageScore
    );
    
    const oldStars = levelEntry.stars || 0;
    levelEntry.stars = newStars;
    
    // Log star changes for transparency
    if (newStars > oldStars) {
      console.log(`[PROGRESS] Student gained stars: ${oldStars} → ${newStars} in ${levelEntry.level}`);
    } else if (newStars < oldStars) {
      console.log(`[PROGRESS] Student lost stars: ${oldStars} → ${newStars} in ${levelEntry.level} (performance dropped)`);
    }
    
    // Award badge if stars >= 1
    if (levelEntry.stars >= 1 && !levelEntry.badge.earned) {
      levelEntry.badge.earned = true;
      levelEntry.badge.earnedAt = new Date();
    }
  }
  
  levelEntry.lastUpdated = new Date();
  
  // Update stats
  progress.stats.totalExams += 1;
  progress.stats.totalViolations += examAttempt.violations.length;
  progress.stats.lastExamDate = new Date();
  
  // Calculate total prestige
  progress.totalPrestige = calculatePrestige(progress);
  
  // Check for generic badges
  const allAttempts = await ExamAttempt.find({ studentId });
  const newBadges = checkGenericBadges(progress, allAttempts);
  progress.genericBadges.push(...newBadges);
  
  await progress.save();
  return progress;
};
