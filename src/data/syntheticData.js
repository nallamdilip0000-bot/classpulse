/**
 * Comprehensive Synthetic Demonstration Dataset for ClassPulse
 * Ministry of Education Educational SaaS Platform
 * 
 * Features:
 * - 3 Classes across Grades 10 & 11
 * - 36 Diverse Fictional Students (STU-101 to STU-136)
 * - 12+ Assessments across subjects with varying maximum marks
 * - 600+ Daily Attendance records (over recent 20 school days)
 * - 80+ Assessment Results including missing, excused, and scored items
 * - Realistic variety of profiles (stable, declining, low attendance, multi-factor, incomplete)
 * - Pre-configured Interventions (Pending, In Progress, Overdue, Completed)
 * - System Settings & Audit Logs
 */

export const INITIAL_CLASSES = [
  {
    id: 'CLS-10A',
    className: 'Grade 10 - Section A',
    subjectFocus: 'Mathematics & Sciences',
    section: 'A',
    academicTerm: 'Fall 2026',
    room: 'Room 204',
    assignedTeacherId: 'USR-TEA-01',
    assignedTeacherName: 'Mrs. Sarah Jenkins',
    studentCount: 12
  },
  {
    id: 'CLS-10B',
    className: 'Grade 10 - Section B',
    subjectFocus: 'Humanities & Languages',
    section: 'B',
    academicTerm: 'Fall 2026',
    room: 'Room 112',
    assignedTeacherId: 'USR-TEA-02',
    assignedTeacherName: 'Mr. David Al-Mansoor',
    studentCount: 12
  },
  {
    id: 'CLS-11A',
    className: 'Grade 11 - Section A',
    subjectFocus: 'Advanced STEM & Pre-Calculus',
    section: 'A',
    academicTerm: 'Fall 2026',
    room: 'Lab 3',
    assignedTeacherId: 'USR-TEA-02', // Co-teaches or taught by Mr. David Al-Mansoor & Dr. Elena
    assignedTeacherName: 'Dr. Elena Rostova',
    studentCount: 12
  }
];

export const INITIAL_USERS = [
  {
    id: 'USR-ADM-01',
    displayName: 'Dr. Arthur Vance',
    email: 'principal.vance@classpulse.edu',
    role: 'admin',
    title: 'Academic Dean & Principal',
    avatarInitials: 'AV',
    assignedClassIds: ['CLS-10A', 'CLS-10B', 'CLS-11A']
  },
  {
    id: 'USR-TEA-01',
    displayName: 'Mrs. Sarah Jenkins',
    email: 's.jenkins@classpulse.edu',
    role: 'teacher',
    title: 'Lead Math & Science Instructor',
    avatarInitials: 'SJ',
    assignedClassIds: ['CLS-10A']
  },
  {
    id: 'USR-TEA-02',
    displayName: 'Mr. David Al-Mansoor',
    email: 'd.almansoor@classpulse.edu',
    role: 'teacher',
    title: 'Humanities & Social Studies Teacher',
    avatarInitials: 'DA',
    assignedClassIds: ['CLS-10B', 'CLS-11A']
  },
  {
    id: 'USR-STU-101',
    studentId: 'STU-101',
    displayName: 'Amina Yusuf',
    email: 'amina.y@student.classpulse.edu',
    role: 'student',
    title: 'Grade 10 Student (10-A)',
    avatarInitials: 'AY',
    assignedClassIds: ['CLS-10A']
  },
  {
    id: 'USR-STU-102',
    studentId: 'STU-102',
    displayName: 'Marcus Vance',
    email: 'marcus.v@student.classpulse.edu',
    role: 'student',
    title: 'Grade 10 Student (10-A)',
    avatarInitials: 'MV',
    assignedClassIds: ['CLS-10A']
  }
];

export const INITIAL_STUDENTS = [
  // Class 10-A (12 students)
  {
    id: 'STU-101',
    studentCode: 'STU-101',
    displayName: 'Amina Yusuf',
    classId: 'CLS-10A',
    dateOfBirth: '2010-04-12',
    guardianContact: 'Fatima Yusuf (Parent) - fatima@example.com',
    profileCategory: 'Flourishing / High Performer',
    notes: 'Consistently engaged, assists peers in group lab work.'
  },
  {
    id: 'STU-102',
    studentCode: 'STU-102',
    displayName: 'Marcus Vance',
    classId: 'CLS-10A',
    dateOfBirth: '2010-09-18',
    guardianContact: 'Karen Vance (Mother) - karen.v@example.com',
    profileCategory: 'Recent Performance Decline',
    notes: 'High attendance, but recent algebra exam showed sudden difficulty with quadratic equations.'
  },
  {
    id: 'STU-103',
    studentCode: 'STU-103',
    displayName: 'Chloe Tanaka',
    classId: 'CLS-10A',
    dateOfBirth: '2010-01-25',
    guardianContact: 'Kenji Tanaka (Father) - k.tanaka@example.com',
    profileCategory: 'Low Attendance / Solid Marks',
    notes: 'Commutes from rural district; missed morning transit several times. Retains concepts well.'
  },
  {
    id: 'STU-104',
    studentCode: 'STU-104',
    displayName: 'Jamal Edwards',
    classId: 'CLS-10A',
    dateOfBirth: '2010-11-03',
    guardianContact: 'Derrick Edwards (Father) - derrick.e@example.com',
    profileCategory: 'Multi-Factor Review (Attendance & Decline)',
    notes: 'Needs combined support plan. Attendance dropped to 58% and test scores slipped.'
  },
  {
    id: 'STU-105',
    studentCode: 'STU-105',
    displayName: 'Sofia Rodriguez',
    classId: 'CLS-10A',
    dateOfBirth: '2010-06-14',
    guardianContact: 'Elena Rodriguez (Mother) - elena.r@example.com',
    profileCategory: 'Stable High Achiever',
    notes: 'Strong in scientific method; participating in state science bowl.'
  },
  {
    id: 'STU-106',
    studentCode: 'STU-106',
    displayName: 'Lucas Moreau',
    classId: 'CLS-10A',
    dateOfBirth: '2010-03-30',
    guardianContact: 'Pierre Moreau (Father) - p.moreau@example.com',
    profileCategory: 'Missing Assessment Record',
    notes: 'Missed Unit 2 Quiz due to approved sports tournament. Needs makeup test.'
  },
  {
    id: 'STU-107',
    studentCode: 'STU-107',
    displayName: 'Priya Sharma',
    classId: 'CLS-10A',
    dateOfBirth: '2010-08-22',
    guardianContact: 'Ravi Sharma (Father) - ravi.s@example.com',
    profileCategory: 'Insufficient Data / Recent Transfer',
    notes: 'Transferred two weeks ago. Only 1 assessment recorded so far.'
  },
  {
    id: 'STU-108',
    studentCode: 'STU-108',
    displayName: 'Ethan Brooks',
    classId: 'CLS-10A',
    dateOfBirth: '2010-05-09',
    guardianContact: 'Mary Brooks (Guardian) - m.brooks@example.com',
    profileCategory: 'Completed Follow-up / Improving',
    notes: 'Completed 3-week study hall support. Attendance and grades have stabilized nicely.'
  },
  {
    id: 'STU-109',
    studentCode: 'STU-109',
    displayName: 'Maya Lin',
    classId: 'CLS-10A',
    dateOfBirth: '2010-12-11',
    guardianContact: 'Wei Lin (Mother) - w.lin@example.com',
    profileCategory: 'Solid Steady',
    notes: 'Good conceptual understanding; quiet during class discussion.'
  },
  {
    id: 'STU-110',
    studentCode: 'STU-110',
    displayName: 'Liam O’Connor',
    classId: 'CLS-10A',
    dateOfBirth: '2010-07-04',
    guardianContact: 'Sean OConnor (Father) - soconnor@example.com',
    profileCategory: 'Steady Performer',
    notes: 'Participates regularly, consistently submits lab reports.'
  },
  {
    id: 'STU-111',
    studentCode: 'STU-111',
    displayName: 'Zara Khan',
    classId: 'CLS-10A',
    dateOfBirth: '2010-02-17',
    guardianContact: 'Nadia Khan (Mother) - nadia.k@example.com',
    profileCategory: 'Overdue Follow-up',
    notes: 'Needs follow-up check regarding missed physics lab homework.'
  },
  {
    id: 'STU-112',
    studentCode: 'STU-112',
    displayName: 'Noah Kowalski',
    classId: 'CLS-10A',
    dateOfBirth: '2010-10-28',
    guardianContact: 'Jan Kowalski (Father) - j.kowalski@example.com',
    profileCategory: 'Satisfactory Progress',
    notes: 'Shows good improvement in problem-solving speed.'
  },

  // Class 10-B (12 students)
  {
    id: 'STU-113',
    studentCode: 'STU-113',
    displayName: 'Isabella Rossi',
    classId: 'CLS-10B',
    dateOfBirth: '2010-04-05',
    guardianContact: 'Marco Rossi - m.rossi@example.com',
    profileCategory: 'High Performer',
    notes: 'Exemplary historical essay writing and literary analysis.'
  },
  {
    id: 'STU-114',
    studentCode: 'STU-114',
    displayName: 'Dante Washington',
    classId: 'CLS-10B',
    dateOfBirth: '2010-06-19',
    guardianContact: 'Alicia Washington - a.wash@example.com',
    profileCategory: 'Low Attendance / Excused Medical',
    notes: 'Had orthopedic surgery last month. Several absences are medically excused.'
  },
  {
    id: 'STU-115',
    studentCode: 'STU-115',
    displayName: 'Hana Takahashi',
    classId: 'CLS-10B',
    dateOfBirth: '2010-09-02',
    guardianContact: 'Naoki Takahashi - n.takahashi@example.com',
    profileCategory: 'Recent Performance Decline',
    notes: 'Essay grades dropped from 84% to 58%. Needs structure guidance on citations.'
  },
  {
    id: 'STU-116',
    studentCode: 'STU-116',
    displayName: 'Gabriel Silva',
    classId: 'CLS-10B',
    dateOfBirth: '2010-03-15',
    guardianContact: 'Lucia Silva - lucia.s@example.com',
    profileCategory: 'Needs Average Baseline Support',
    notes: 'English as an Additional Language learner; reading comprehension tests show 38% average.'
  },
  {
    id: 'STU-117',
    studentCode: 'STU-117',
    displayName: 'Emma Watson-Lee',
    classId: 'CLS-10B',
    dateOfBirth: '2010-11-20',
    guardianContact: 'Catherine Lee - c.lee@example.com',
    profileCategory: 'Flourishing',
    notes: 'Active debater, outstanding oratorical skill.'
  },
  {
    id: 'STU-118',
    studentCode: 'STU-118',
    displayName: 'Tariq Al-Fassi',
    classId: 'CLS-10B',
    dateOfBirth: '2010-08-08',
    guardianContact: 'Omar Al-Fassi - omar.af@example.com',
    profileCategory: 'Missing Assessment',
    notes: 'Midterm paper pending submission.'
  },
  {
    id: 'STU-119',
    studentCode: 'STU-119',
    displayName: 'Aaliyah Patel',
    classId: 'CLS-10B',
    dateOfBirth: '2010-05-14',
    guardianContact: 'Sunil Patel - s.patel@example.com',
    profileCategory: 'Steady',
    notes: 'Diligent note-taker, good participation.'
  },
  {
    id: 'STU-120',
    studentCode: 'STU-120',
    displayName: 'Benjamin Clarke',
    classId: 'CLS-10B',
    dateOfBirth: '2010-01-11',
    guardianContact: 'Rachel Clarke - r.clarke@example.com',
    profileCategory: 'Satisfactory',
    notes: 'Completes assignments on time.'
  },
  {
    id: 'STU-121',
    studentCode: 'STU-121',
    displayName: 'Kavita Iyer',
    classId: 'CLS-10B',
    dateOfBirth: '2010-12-03',
    guardianContact: 'Suresh Iyer - s.iyer@example.com',
    profileCategory: 'Needs Attendance Check',
    notes: 'Unexcused absences on Mondays; attendance is 71%.'
  },
  {
    id: 'STU-122',
    studentCode: 'STU-122',
    displayName: 'Mateo Hernandez',
    classId: 'CLS-10B',
    dateOfBirth: '2010-07-29',
    guardianContact: 'Rosa Hernandez - r.hernandez@example.com',
    profileCategory: 'Active Intervention Plan',
    notes: 'Enrolled in after-school writing clinic.'
  },
  {
    id: 'STU-123',
    studentCode: 'STU-123',
    displayName: 'Olivia Dubois',
    classId: 'CLS-10B',
    dateOfBirth: '2010-10-16',
    guardianContact: 'Claire Dubois - c.dubois@example.com',
    profileCategory: 'High Achiever',
    notes: 'Expressive creative writing and research.'
  },
  {
    id: 'STU-124',
    studentCode: 'STU-124',
    displayName: 'Samuel Adebayo',
    classId: 'CLS-10B',
    dateOfBirth: '2010-02-24',
    guardianContact: 'Folake Adebayo - folake.a@example.com',
    profileCategory: 'Steady Progress',
    notes: 'Constructive contributor to literature seminars.'
  },

  // Class 11-A (12 students)
  {
    id: 'STU-125',
    studentCode: 'STU-125',
    displayName: 'Ananya Deshmukh',
    classId: 'CLS-11A',
    dateOfBirth: '2009-03-12',
    guardianContact: 'Anil Deshmukh - anil.d@example.com',
    profileCategory: 'Top Performer',
    notes: 'Pre-calculus honors student with 98% average.'
  },
  {
    id: 'STU-126',
    studentCode: 'STU-126',
    displayName: 'Viktor Chernov',
    classId: 'CLS-11A',
    dateOfBirth: '2009-08-19',
    guardianContact: 'Irina Chernova - i.chernova@example.com',
    profileCategory: 'Severe Decline in Calculus',
    notes: 'Dropped from 78% in Vectors to 44% in Limits & Derivatives. Support session recommended.'
  },
  {
    id: 'STU-127',
    studentCode: 'STU-127',
    displayName: 'Fatima Al-Zahra',
    classId: 'CLS-11A',
    dateOfBirth: '2009-05-31',
    guardianContact: 'Hassan Al-Zahra - hassan.z@example.com',
    profileCategory: 'High Attendance & Excellent Scores',
    notes: 'Strong in mechanics and differential equations.'
  },
  {
    id: 'STU-128',
    studentCode: 'STU-128',
    displayName: 'Owen Campbell',
    classId: 'CLS-11A',
    dateOfBirth: '2009-11-14',
    guardianContact: 'Fiona Campbell - fiona.c@example.com',
    profileCategory: 'Low Attendance (64%)',
    notes: 'Working part-time on family dairy farm; late arrivals impacting first-period lab.'
  },
  {
    id: 'STU-129',
    studentCode: 'STU-129',
    displayName: 'Mei-Ling Zhou',
    classId: 'CLS-11A',
    dateOfBirth: '2009-01-20',
    guardianContact: 'Hao Zhou - hao.zhou@example.com',
    profileCategory: 'Flourishing',
    notes: 'Representing school at regional robotics championship.'
  },
  {
    id: 'STU-130',
    studentCode: 'STU-130',
    displayName: 'Kofi Mensah',
    classId: 'CLS-11A',
    dateOfBirth: '2009-09-07',
    guardianContact: 'Kwame Mensah - kwame.m@example.com',
    profileCategory: 'Low Average Baseline (37%)',
    notes: 'Struggling with organic chemistry nomenclature. Peer tutor assigned.'
  },
  {
    id: 'STU-131',
    studentCode: 'STU-131',
    displayName: 'Sara Lindqvist',
    classId: 'CLS-11A',
    dateOfBirth: '2009-06-25',
    guardianContact: 'Lars Lindqvist - lars.l@example.com',
    profileCategory: 'Steady Honors Student',
    notes: 'Reliable participant, strong physics lab results.'
  },
  {
    id: 'STU-132',
    studentCode: 'STU-132',
    displayName: 'Rajesh Mukherjee',
    classId: 'CLS-11A',
    dateOfBirth: '2009-12-18',
    guardianContact: 'Deepa Mukherjee - deepa.m@example.com',
    profileCategory: 'Multi-Factor Review',
    notes: 'Attendance 60%, recent exam 38%. Guardian conference scheduled.'
  },
  {
    id: 'STU-133',
    studentCode: 'STU-133',
    displayName: 'Zoe Martinez',
    classId: 'CLS-11A',
    dateOfBirth: '2009-04-09',
    guardianContact: 'Carlos Martinez - carlos.m@example.com',
    profileCategory: 'Steady Good',
    notes: 'Consistent performance across calculus and physics.'
  },
  {
    id: 'STU-134',
    studentCode: 'STU-134',
    displayName: 'Arthur Pendelton',
    classId: 'CLS-11A',
    dateOfBirth: '2009-07-30',
    guardianContact: 'Eleanor Pendelton - e.pendelton@example.com',
    profileCategory: 'Insufficient Assessments',
    notes: 'Recent medical absence during midterms. Makeup schedule arranged.'
  },
  {
    id: 'STU-135',
    studentCode: 'STU-135',
    displayName: 'Layla Nasser',
    classId: 'CLS-11A',
    dateOfBirth: '2009-10-05',
    guardianContact: 'Yousef Nasser - y.nasser@example.com',
    profileCategory: 'Improving / Active Follow-up',
    notes: 'Attending bi-weekly math tutorials; score improved from 50% to 68%.'
  },
  {
    id: 'STU-136',
    studentCode: 'STU-136',
    displayName: 'Connor MacLeod',
    classId: 'CLS-11A',
    dateOfBirth: '2009-02-14',
    guardianContact: 'Ian MacLeod - ian.m@example.com',
    profileCategory: 'Satisfactory Progress',
    notes: 'Solid project contributions in thermodynamics.'
  }
];

export const INITIAL_ASSESSMENTS = [
  // Class 10-A
  {
    id: 'ASM-101',
    classId: 'CLS-10A',
    subject: 'Mathematics',
    title: 'Unit 1: Linear Equations & Graphs',
    assessmentDate: '2026-09-15',
    maximumMarks: 50,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-01'
  },
  {
    id: 'ASM-102',
    classId: 'CLS-10A',
    subject: 'Mathematics',
    title: 'Unit 2: Quadratic Functions & Polynomials',
    assessmentDate: '2026-10-05',
    maximumMarks: 50,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-01'
  },
  {
    id: 'ASM-103',
    classId: 'CLS-10A',
    subject: 'Physics',
    title: 'Mechanics & Newton Laws Midterm',
    assessmentDate: '2026-10-18',
    maximumMarks: 75,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-01'
  },
  {
    id: 'ASM-104',
    classId: 'CLS-10A',
    subject: 'Physics',
    title: 'Kinematics & Energy Lab Practicum',
    assessmentDate: '2026-10-21',
    maximumMarks: 40,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-01'
  },

  // Class 10-B
  {
    id: 'ASM-201',
    classId: 'CLS-10B',
    subject: 'English Literature',
    title: 'Rhetoric & Analytical Essay 1',
    assessmentDate: '2026-09-18',
    maximumMarks: 50,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-02'
  },
  {
    id: 'ASM-202',
    classId: 'CLS-10B',
    subject: 'World History',
    title: 'Industrial Revolution Document Analysis',
    assessmentDate: '2026-10-02',
    maximumMarks: 60,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-02'
  },
  {
    id: 'ASM-203',
    classId: 'CLS-10B',
    subject: 'English Literature',
    title: 'Comparative Poetry & Critical Commentary',
    assessmentDate: '2026-10-16',
    maximumMarks: 50,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-02'
  },

  // Class 11-A
  {
    id: 'ASM-301',
    classId: 'CLS-11A',
    subject: 'Pre-Calculus',
    title: 'Vectors, Matrices & Transformations',
    assessmentDate: '2026-09-20',
    maximumMarks: 80,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-02'
  },
  {
    id: 'ASM-302',
    classId: 'CLS-11A',
    subject: 'Pre-Calculus',
    title: 'Limits, Continuity & Derivative Foundations',
    assessmentDate: '2026-10-10',
    maximumMarks: 80,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-02'
  },
  {
    id: 'ASM-303',
    classId: 'CLS-11A',
    subject: 'Chemistry',
    title: 'Stoichiometry & Chemical Equilibrium Quiz',
    assessmentDate: '2026-10-19',
    maximumMarks: 50,
    academicTerm: 'Fall 2026',
    createdBy: 'USR-TEA-02'
  }
];

/**
 * Generate realistic assessment results across students
 */
export function generateInitialAssessmentResults() {
  const results = [];
  let idCounter = 1;

  // Grade 10-A Results
  const data10A = {
    'STU-101': { 'ASM-101': 47, 'ASM-102': 48, 'ASM-103': 71, 'ASM-104': 38 }, // High: ~95%
    'STU-102': { 'ASM-101': 42, 'ASM-102': 22, 'ASM-103': 38, 'ASM-104': 20 }, // Marked decline: 84% -> 44% -> 50%
    'STU-103': { 'ASM-101': 38, 'ASM-102': 37, 'ASM-103': 56, 'ASM-104': 30 }, // Stable ~75%
    'STU-104': { 'ASM-101': 32, 'ASM-102': 18, 'ASM-103': 26, 'ASM-104': 14 }, // Multi-factor: 64% -> 36% -> 34% (decline + low average)
    'STU-105': { 'ASM-101': 46, 'ASM-102': 47, 'ASM-103': 70, 'ASM-104': 39 }, // High: ~94%
    'STU-106': { 'ASM-101': 40, 'ASM-102': null, 'ASM-103': 58, 'ASM-104': 31 }, // Missing ASM-102 (sports)
    'STU-107': { 'ASM-101': null, 'ASM-102': null, 'ASM-103': 52, 'ASM-104': null }, // Only 1 test (transfer): Insufficient data!
    'STU-108': { 'ASM-101': 28, 'ASM-102': 35, 'ASM-103': 57, 'ASM-104': 32 }, // Improving: 56% -> 70% -> 76% (completed support)
    'STU-109': { 'ASM-101': 41, 'ASM-102': 40, 'ASM-103': 61, 'ASM-104': 33 }, // Steady ~81%
    'STU-110': { 'ASM-101': 39, 'ASM-102': 38, 'ASM-103': 59, 'ASM-104': 31 }, // Steady ~78%
    'STU-111': { 'ASM-101': 35, 'ASM-102': 26, 'ASM-103': 41, 'ASM-104': 22 }, // Dropping: 70% -> 52% -> 54%
    'STU-112': { 'ASM-101': 37, 'ASM-102': 39, 'ASM-103': 58, 'ASM-104': 30 }  // Steady ~76%
  };

  for (const [studentId, asmMap] of Object.entries(data10A)) {
    for (const [asmId, marks] of Object.entries(asmMap)) {
      if (marks === null) {
        if (studentId === 'STU-106') {
          results.push({
            id: `RES-${idCounter++}`,
            assessmentId: asmId,
            studentId,
            marksObtained: null,
            resultStatus: 'missing',
            notes: 'Approved sports travel; makeup pending',
            updatedAt: '2026-10-06T10:00:00Z'
          });
        }
        continue;
      }
      results.push({
        id: `RES-${idCounter++}`,
        assessmentId: asmId,
        studentId,
        marksObtained: marks,
        resultStatus: 'scored',
        updatedAt: '2026-10-19T14:30:00Z'
      });
    }
  }

  // Grade 10-B Results
  const data10B = {
    'STU-113': { 'ASM-201': 47, 'ASM-202': 56, 'ASM-203': 48 }, // 94%, 93%, 96%
    'STU-114': { 'ASM-201': 41, 'ASM-202': 49, 'ASM-203': 40 }, // Stable ~81%
    'STU-115': { 'ASM-201': 43, 'ASM-202': 46, 'ASM-203': 28 }, // Drop from 86% -> 76% -> 56% (20 pt decline!)
    'STU-116': { 'ASM-201': 18, 'ASM-202': 21, 'ASM-203': 19 }, // Low average baseline: ~36%
    'STU-117': { 'ASM-201': 48, 'ASM-202': 57, 'ASM-203': 49 }, // ~96%
    'STU-118': { 'ASM-201': 38, 'ASM-202': null, 'ASM-203': 37 }, // Missing ASM-202
    'STU-119': { 'ASM-201': 39, 'ASM-202': 47, 'ASM-203': 39 }, // ~78%
    'STU-120': { 'ASM-201': 37, 'ASM-202': 44, 'ASM-203': 38 }, // ~74%
    'STU-121': { 'ASM-201': 36, 'ASM-202': 45, 'ASM-203': 37 }, // ~73%
    'STU-122': { 'ASM-201': 29, 'ASM-202': 38, 'ASM-203': 36 }, // ~65%
    'STU-123': { 'ASM-201': 46, 'ASM-202': 55, 'ASM-203': 46 }, // ~92%
    'STU-124': { 'ASM-201': 39, 'ASM-202': 48, 'ASM-203': 40 }  // ~80%
  };

  for (const [studentId, asmMap] of Object.entries(data10B)) {
    for (const [asmId, marks] of Object.entries(asmMap)) {
      if (marks === null) {
        results.push({
          id: `RES-${idCounter++}`,
          assessmentId: asmId,
          studentId,
          marksObtained: null,
          resultStatus: 'missing',
          notes: 'Unsubmitted midterm draft',
          updatedAt: '2026-10-03T09:00:00Z'
        });
        continue;
      }
      results.push({
        id: `RES-${idCounter++}`,
        assessmentId: asmId,
        studentId,
        marksObtained: marks,
        resultStatus: 'scored',
        updatedAt: '2026-10-17T11:00:00Z'
      });
    }
  }

  // Grade 11-A Results
  const data11A = {
    'STU-125': { 'ASM-301': 78, 'ASM-302': 79, 'ASM-303': 49 }, // ~98%
    'STU-126': { 'ASM-301': 64, 'ASM-302': 36, 'ASM-303': 23 }, // Sharp decline: 80% -> 45% (35 pt drop!)
    'STU-127': { 'ASM-301': 74, 'ASM-302': 75, 'ASM-303': 47 }, // ~93%
    'STU-128': { 'ASM-301': 60, 'ASM-302': 58, 'ASM-303': 36 }, // Stable ~73% (attendance issue only)
    'STU-129': { 'ASM-301': 76, 'ASM-302': 77, 'ASM-303': 48 }, // ~96%
    'STU-130': { 'ASM-301': 28, 'ASM-302': 30, 'ASM-303': 17 }, // Low average baseline: ~36%
    'STU-131': { 'ASM-301': 70, 'ASM-302': 71, 'ASM-303': 44 }, // ~88%
    'STU-132': { 'ASM-301': 48, 'ASM-302': 31, 'ASM-303': 18 }, // Multi-factor: 60% -> 38% (drop + low avg)
    'STU-133': { 'ASM-301': 66, 'ASM-302': 67, 'ASM-303': 42 }, // ~83%
    'STU-134': { 'ASM-301': 62, 'ASM-302': null, 'ASM-303': null }, // Only 1 test: Insufficient data for trend
    'STU-135': { 'ASM-301': 42, 'ASM-302': 54, 'ASM-303': 34 }, // Improving: 52% -> 67%
    'STU-136': { 'ASM-301': 63, 'ASM-302': 64, 'ASM-303': 40 }  // ~79%
  };

  for (const [studentId, asmMap] of Object.entries(data11A)) {
    for (const [asmId, marks] of Object.entries(asmMap)) {
      if (marks === null) {
        results.push({
          id: `RES-${idCounter++}`,
          assessmentId: asmId,
          studentId,
          marksObtained: null,
          resultStatus: 'missing',
          notes: 'Makeup pending post-recovery',
          updatedAt: '2026-10-12T09:00:00Z'
        });
        continue;
      }
      results.push({
        id: `RES-${idCounter++}`,
        assessmentId: asmId,
        studentId,
        marksObtained: marks,
        resultStatus: 'scored',
        updatedAt: '2026-10-20T16:00:00Z'
      });
    }
  }

  return results;
}

/**
 * Generate synthetic attendance records for 20 recent school days
 */
export function generateInitialAttendanceRecords() {
  const records = [];
  let idCounter = 1;

  // 20 school days ending October 23, 2026
  const schoolDates = [
    '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02',
    '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09',
    '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16',
    '2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'
  ];

  // Specific profiles mapping
  // Low attendance students:
  // STU-103: ~65% (commute)
  // STU-104: ~58% (multi-factor)
  // STU-114: Excused medical (8 excused, 10 present, 2 absent) -> policy check!
  // STU-121: ~70% (Monday absences)
  // STU-128: ~65% (farm morning work)
  // STU-132: ~60% (multi-factor)

  for (const student of INITIAL_STUDENTS) {
    for (let i = 0; i < schoolDates.length; i++) {
      const date = schoolDates[i];
      let status = 'present';

      if (student.id === 'STU-104') {
        // Jamal Edwards: 11 present, 8 absent, 1 excused -> 11/19 = 57.9% (~58%)
        if ([1, 4, 6, 8, 11, 13, 16, 18].includes(i)) status = 'absent';
        else if (i === 15) status = 'excused';
      } else if (student.id === 'STU-103') {
        // Chloe Tanaka: 13 present, 7 absent -> 13/20 = 65%
        if ([0, 5, 8, 10, 14, 15, 19].includes(i)) status = 'absent';
      } else if (student.id === 'STU-114') {
        // Dante Washington: Medical excused (8 excused, 10 present, 2 absent) -> 10/12 = 83.3% eligible!
        if ([3, 4, 5, 6, 7, 8, 9, 10].includes(i)) status = 'excused';
        else if ([15, 18].includes(i)) status = 'absent';
      } else if (student.id === 'STU-121') {
        // Kavita Iyer: Monday unexcused absences (index 0, 5, 10, 15 are Mondays) + 2 others -> 14/20 = 70%
        if ([0, 5, 10, 15, 8, 18].includes(i)) status = 'absent';
      } else if (student.id === 'STU-128') {
        // Owen Campbell: 13 present, 7 absent -> 65%
        if ([1, 3, 6, 9, 12, 16, 17].includes(i)) status = 'absent';
      } else if (student.id === 'STU-132') {
        // Rajesh Mukherjee: 12 present, 8 absent -> 60%
        if ([0, 2, 5, 7, 10, 13, 15, 19].includes(i)) status = 'absent';
      } else if (student.id === 'STU-108') {
        // Ethan Brooks: Was absent early on, now 100% present in recent 10 days
        if ([0, 2, 4].includes(i)) status = 'absent';
      } else if (student.id === 'STU-107') {
        // Priya Sharma: Transferred in week 3 (first 10 days skipped/excused)
        if (i < 10) status = 'excused';
      } else {
        // Normal random high attendance (19/20 or 20/20)
        if (i === 7 && (student.id === 'STU-102' || student.id === 'STU-115')) {
          status = 'absent';
        } else if (i === 12 && student.id === 'STU-106') {
          status = 'excused'; // sports trip
        }
      }

      records.push({
        id: `ATT-${idCounter++}`,
        studentId: student.id,
        classId: student.classId,
        date,
        status,
        recordedBy: student.classId === 'CLS-10A' ? 'USR-TEA-01' : 'USR-TEA-02',
        createdAt: `${date}T08:45:00Z`
      });
    }
  }

  return records;
}

export const INITIAL_INTERVENTIONS = [
  {
    id: 'INT-001',
    studentId: 'STU-104',
    studentName: 'Jamal Edwards',
    classId: 'CLS-10A',
    createdBy: 'USR-TEA-01',
    assignedTeacherId: 'USR-TEA-01',
    assignedTeacherName: 'Mrs. Sarah Jenkins',
    reason: 'Triggered both low attendance (58%) and declining assessment performance in Algebra.',
    triggeredIndicator: 'Multi-factor: Attendance & Performance Decline',
    plannedAction: 'remedial_session',
    plannedActionLabel: 'Remedial Learning Session & Attendance Check-in',
    privateTeacherNotes: 'Met with Jamal during advisement period. Family car broke down leading to transit issues. Offered school bus pass application and math clinic schedule.',
    studentFeedback: 'Jamal agreed to attend Wednesday morning study hall for quadratic equations help.',
    nextFollowUpDate: '2026-10-27',
    status: 'in_progress',
    createdAt: '2026-10-15T11:00:00Z',
    updatedAt: '2026-10-21T09:30:00Z',
    completedAt: null
  },
  {
    id: 'INT-002',
    studentId: 'STU-102',
    studentName: 'Marcus Vance',
    classId: 'CLS-10A',
    createdBy: 'USR-TEA-01',
    assignedTeacherId: 'USR-TEA-01',
    assignedTeacherName: 'Mrs. Sarah Jenkins',
    reason: 'Sudden drop in Unit 2 quadratic test (dropped from 84% to 44%).',
    triggeredIndicator: 'Significant Performance Drop (-40 pts)',
    plannedAction: 'practice_material',
    plannedActionLabel: 'Targeted Practice & 1-on-1 Concept Review',
    privateTeacherNotes: 'Marcus seems to have missed factoring negative polynomials. Assigned scaffolded worksheet.',
    studentFeedback: 'Review Worksheet #4 provided with step-by-step factorization examples.',
    nextFollowUpDate: '2026-10-26',
    status: 'pending',
    createdAt: '2026-10-20T14:15:00Z',
    updatedAt: '2026-10-20T14:15:00Z',
    completedAt: null
  },
  {
    id: 'INT-003',
    studentId: 'STU-108',
    studentName: 'Ethan Brooks',
    classId: 'CLS-10A',
    createdBy: 'USR-TEA-01',
    assignedTeacherId: 'USR-TEA-01',
    assignedTeacherName: 'Mrs. Sarah Jenkins',
    reason: 'Initial attendance inconsistency in September and low Unit 1 score (56%).',
    triggeredIndicator: 'Low Attendance Rate',
    plannedAction: 'progress_review',
    plannedActionLabel: 'Study Hall Progress Review',
    privateTeacherNotes: 'Ethan successfully attended 3 weeks of study hall. Physics lab score improved to 80% and attendance has been 100% since.',
    studentFeedback: 'Great job maintaining steady effort and catching up on all lab activities.',
    nextFollowUpDate: '2026-10-22',
    status: 'completed',
    createdAt: '2026-09-30T10:00:00Z',
    updatedAt: '2026-10-22T15:00:00Z',
    completedAt: '2026-10-22T15:00:00Z',
    completionNotes: 'Goal achieved. Student attendance normalized to 85% and latest test reached 76%.'
  },
  {
    id: 'INT-004',
    studentId: 'STU-111',
    studentName: 'Zara Khan',
    classId: 'CLS-10A',
    createdBy: 'USR-TEA-01',
    assignedTeacherId: 'USR-TEA-01',
    assignedTeacherName: 'Mrs. Sarah Jenkins',
    reason: 'Missed kinematics lab reports and test score dip.',
    triggeredIndicator: 'Performance Decline Indicator',
    plannedAction: 'student_checkin',
    plannedActionLabel: 'Student 1-on-1 Check-in',
    privateTeacherNotes: 'Check-in was scheduled for October 19th; needs rescheduling.',
    studentFeedback: 'Please check your portal for the revised kinematics report rubric.',
    nextFollowUpDate: '2026-10-19', // Overdue!
    status: 'pending',
    createdAt: '2026-10-14T08:30:00Z',
    updatedAt: '2026-10-14T08:30:00Z',
    completedAt: null
  },
  {
    id: 'INT-005',
    studentId: 'STU-116',
    studentName: 'Gabriel Silva',
    classId: 'CLS-10B',
    createdBy: 'USR-TEA-02',
    assignedTeacherId: 'USR-TEA-02',
    assignedTeacherName: 'Mr. David Al-Mansoor',
    reason: 'Assessment average (36%) is below the configured 40% support baseline.',
    triggeredIndicator: 'Assessment Average Below Baseline',
    plannedAction: 'remedial_session',
    plannedActionLabel: 'EAL Reading & Vocabulary Scaffold',
    privateTeacherNotes: 'Coordinating with language support coordinator to provide bilingual glossaries for history texts.',
    studentFeedback: 'Bilingual historical vocabulary guide provided for Industrial Revolution readings.',
    nextFollowUpDate: '2026-10-29',
    status: 'in_progress',
    createdAt: '2026-10-16T13:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
    completedAt: null
  },
  {
    id: 'INT-006',
    studentId: 'STU-126',
    studentName: 'Viktor Chernov',
    classId: 'CLS-11A',
    createdBy: 'USR-TEA-02',
    assignedTeacherId: 'USR-TEA-02',
    assignedTeacherName: 'Mr. David Al-Mansoor',
    reason: 'Drop of 35 percentage points in Calculus limits module.',
    triggeredIndicator: 'Significant Performance Drop (-35 pts)',
    plannedAction: 'guardian_meeting',
    plannedActionLabel: 'Parent / Teacher Academic Check-in',
    privateTeacherNotes: 'Scheduled conference with mother Irina to discuss calculus tutoring options.',
    studentFeedback: 'Pre-calculus review worksheets sent via student email.',
    nextFollowUpDate: '2026-10-28',
    status: 'pending',
    createdAt: '2026-10-21T16:00:00Z',
    updatedAt: '2026-10-21T16:00:00Z',
    completedAt: null
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'Review Indicator Triggered',
    message: 'Marcus Vance (STU-102) triggered Performance Decline rule (-40 pts drop).',
    timestamp: '2026-10-21T14:30:00Z',
    type: 'warning',
    read: false,
    link: '/students/STU-102'
  },
  {
    id: 'NOTIF-02',
    title: 'Overdue Follow-up Alert',
    message: 'Follow-up for Zara Khan (STU-111) was due on Oct 19, 2026.',
    timestamp: '2026-10-20T08:00:00Z',
    type: 'urgent',
    read: false,
    link: '/interventions'
  },
  {
    id: 'NOTIF-03',
    title: 'Multi-Factor Review Needed',
    message: 'Jamal Edwards (STU-104) flagged for attendance (58%) and score decline.',
    timestamp: '2026-10-18T16:00:00Z',
    type: 'warning',
    read: true,
    link: '/students/STU-104'
  },
  {
    id: 'NOTIF-04',
    title: 'Threshold Configuration Updated',
    message: 'Admin updated attendance review threshold to 75% for Fall 2026.',
    timestamp: '2026-10-15T09:00:00Z',
    type: 'info',
    read: true,
    link: '/settings'
  }
];

export const INITIAL_ACTIVITY_LOG = [
  {
    id: 'ACT-01',
    action: 'Intervention Updated',
    details: 'Mrs. Sarah Jenkins updated intervention status to "In Progress" for Jamal Edwards (STU-104).',
    timestamp: '2026-10-21T09:30:00Z',
    user: 'Mrs. Sarah Jenkins'
  },
  {
    id: 'ACT-02',
    action: 'Assessment Published',
    details: 'New marks published for "Kinematics & Energy Lab Practicum" in Grade 10-A.',
    timestamp: '2026-10-21T14:30:00Z',
    user: 'Mrs. Sarah Jenkins'
  },
  {
    id: 'ACT-03',
    action: 'Intervention Completed',
    details: 'Follow-up for Ethan Brooks (STU-108) marked as Completed with positive outcome.',
    timestamp: '2026-10-22T15:00:00Z',
    user: 'Mrs. Sarah Jenkins'
  },
  {
    id: 'ACT-04',
    action: 'Attendance Batch Logged',
    details: 'Daily attendance recorded for Grade 10 - Section A (Oct 23, 2026).',
    timestamp: '2026-10-23T08:45:00Z',
    user: 'Mrs. Sarah Jenkins'
  }
];
