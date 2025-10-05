# 🏆 CampusGrid Badge System

## Two Types of Badges

### 1. Core Badges (Subject + Level with 0-10 stars)
- Each subject has 4 levels: Beginner, Intermediate, Advanced, Master
- Each level badge shows 0-10 stars
- **Independent progression** - Java Beginner ≠ Java Advanced
- Example: Java Beginner ⭐⭐⭐⭐⭐⭐⭐ (7 stars)

### 2. Soft Badges (29 achievement badges)
- 4 tiers: Bronze, Silver, Gold, Platinum
- One-time awards (no stars)
- Examples: Perfectionist 💯, Streak Holder 🔥, Grand Master 👑

---

## How Stars Are Earned (Beginner Level)

| Stars | Exams | Avg Score |
|-------|-------|-----------|
| ⭐ 1 | 2 | 60% |
| ⭐⭐ 2 | 4 | 65% |
| ⭐⭐⭐ 3 | 6 | 70% |
| ⭐⭐⭐⭐ 4 | 8 | 73% |
| ⭐⭐⭐⭐⭐ 5 | 10 | 76% |
| ⭐⭐⭐⭐⭐⭐ 6 | 12 | 80% |
| ⭐⭐⭐⭐⭐⭐⭐ 7 | 15 | 83% |
| ⭐⭐⭐⭐⭐⭐⭐⭐ 8 | 18 | 86% |
| ⭐⭐⭐⭐⭐⭐⭐⭐⭐ 9 | 22 | 90% |
| ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ 10 | 25 | 93% |

**IMPORTANT - Stars are REPLACED, not added!**

Example (Gaining Stars):
- John has 2 stars (4 exams, 65% avg)
- Takes 4 more exams @ 75% (total: 8 exams, 70% avg)
- Qualifies for 4 stars
- **Result: 4 stars total** (not 2+4=6!)

**STARS CAN BE LOST!**

Example (Losing Stars):
- Sarah has 7 stars (15 exams, 85% avg)
- Takes 5 more bad exams @ 50% (total: 20 exams, 76% avg)
- Now qualifies for only 5 stars
- **Result: 5 stars** (lost 2 stars due to poor performance!)

**Soft badges CANNOT be lost** (permanent achievements)

**Higher levels need fewer exams but higher scores**

---

## Soft Badges List

### Milestone (5)
1. First Steps 🎯 (Bronze) - 1 exam
2. Exam Rookie 📝 (Bronze) - 10 exams
3. Exam Veteran 🎖️ (Silver) - 50 exams
4. Exam Master 👑 (Gold) - 100 exams
5. Exam Legend 🏆 (Platinum) - 200 exams

### Performance (4)
6. Perfectionist 💯 (Gold) - 100% score
7. Consistent Performer 📊 (Silver) - 85% avg over 20 exams
8. High Achiever 🌟 (Gold) - 90% avg over 30 exams
9. Excellence Seeker 💎 (Platinum) - 95% avg over 50 exams

### Discipline (3)
10. Focus Keeper 🎯 (Gold) - 10 strict exams, 0 violations
11. Clean Record ✨ (Silver) - 25 exams, 0 violations
12. Integrity Champion 🛡️ (Platinum) - 50 exams, 0 violations

### Speed (2)
13. Speed Demon ⚡ (Gold) - Exam <10 min with 80%+
14. Quick Thinker 🧠 (Silver) - 5 exams <15 min with 85%+

### Streak (4)
15. Dedicated Learner 📅 (Bronze) - 3-day streak
16. Streak Holder 🔥 (Silver) - 7-day streak
17. Unstoppable 💪 (Gold) - 14-day streak
18. Marathon Runner 🏃 (Platinum) - 30-day streak

### Subject Mastery (4)
19. Polyglot 🌐 (Silver) - Stars in 3 subjects
20. Renaissance Scholar 📚 (Gold) - Stars in 5 subjects
21. Subject Master ⭐ (Platinum) - 10 stars in any level
22. Grand Master 👑 (Platinum) - 10 stars in Master level

### Prestige (4)
23. Rising Star 🌠 (Bronze) - 100 prestige
24. Prestige Hunter 💫 (Silver) - 500 prestige
25. Prestige Legend ✨ (Gold) - 1000 prestige
26. Prestige Titan 🌟 (Platinum) - 2500 prestige

### Special (3)
27. Early Bird 🌅 (Bronze) - Exam before 8 AM
28. Night Owl 🦉 (Bronze) - Exam after 11 PM
29. Weekend Warrior 🎮 (Silver) - 10 weekend exams

**Total: 29 soft badges**

---

## Key Rules

### Core Badges (Stars)
- ✅ Stars can be GAINED (better performance)
- ✅ Stars can be LOST (worse performance)
- ✅ Recalculated after every exam
- ✅ Based on ALL exams in that subject+level

### Soft Badges
- ✅ Earned once, kept FOREVER
- ✅ CANNOT be lost
- ✅ Permanent achievements

---

## Design Brief

**See `BADGE_DESIGN_BRIEF.txt` for complete design specifications**

**Summary**:
- 44 Core Badge images (4 levels × 11 states: 0-10 stars)
- 29 Soft Badge images (Bronze, Silver, Gold, Platinum tiers)
- Total: 73 badge designs needed
