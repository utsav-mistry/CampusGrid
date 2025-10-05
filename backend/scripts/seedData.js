import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await mongoose.connection.collection('users').insertOne({
      email: 'admin@campusgrid.com',
      password: hashedPassword,
      isEmailVerified: true,
      role: 'admin',
      profile: { name: 'Admin User' },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Admin user created');

    // Create subjects
    const subjects = await mongoose.connection.collection('subjects').insertMany([
      {
        name: 'Java Programming',
        code: 'JAVA101',
        description: 'Core Java concepts and Object-Oriented Programming',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Python Programming',
        code: 'PY101',
        description: 'Python basics, data structures, and advanced concepts',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Database Management',
        code: 'DBMS101',
        description: 'SQL, database design, and normalization',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Data Structures & Algorithms',
        code: 'DSA101',
        description: 'Arrays, linked lists, trees, graphs, and algorithms',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Web Development',
        code: 'WEB101',
        description: 'HTML, CSS, JavaScript, and modern frameworks',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log('Subjects created');

    const subjectIds = Object.values(subjects.insertedIds);
    const javaId = subjectIds[0];
    const pythonId = subjectIds[1];
    const dsaId = subjectIds[3];

    // Create sample questions
    const questions = [];

    // Java MCQ Questions
    questions.push(
      {
        subjectId: javaId,
        level: 'Beginner',
        type: 'mcq',
        question: 'What is the size of int data type in Java?',
        options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on JVM'],
        correctAnswer: '4 bytes',
        points: 1,
        tags: ['basics', 'data-types'],
        createdBy: adminResult.insertedId,
        isPublic: true,
        createdAt: new Date()
      },
      {
        subjectId: javaId,
        level: 'Beginner',
        type: 'mcq',
        question: 'Which keyword is used to inherit a class in Java?',
        options: ['implements', 'extends', 'inherits', 'super'],
        correctAnswer: 'extends',
        points: 1,
        tags: ['oop', 'inheritance'],
        createdBy: adminResult.insertedId,
        isPublic: true,
        createdAt: new Date()
      },
      {
        subjectId: javaId,
        level: 'Intermediate',
        type: 'mcq',
        question: 'What is the output of: System.out.println(10 + 20 + "Hello");',
        options: ['1020Hello', '30Hello', 'Hello1020', 'Hello30'],
        correctAnswer: '30Hello',
        points: 2,
        tags: ['operators', 'strings'],
        createdBy: adminResult.insertedId,
        isPublic: true,
        createdAt: new Date()
      }
    );

    // Python MCQ Questions
    questions.push(
      {
        subjectId: pythonId,
        level: 'Beginner',
        type: 'mcq',
        question: 'Which of the following is used to define a function in Python?',
        options: ['function', 'def', 'func', 'define'],
        correctAnswer: 'def',
        points: 1,
        tags: ['basics', 'functions'],
        createdBy: adminResult.insertedId,
        isPublic: true,
        createdAt: new Date()
      },
      {
        subjectId: pythonId,
        level: 'Beginner',
        type: 'mcq',
        question: 'What is the correct way to create a list in Python?',
        options: ['list = (1, 2, 3)', 'list = [1, 2, 3]', 'list = {1, 2, 3}', 'list = <1, 2, 3>'],
        correctAnswer: 'list = [1, 2, 3]',
        points: 1,
        tags: ['data-structures', 'lists'],
        createdBy: adminResult.insertedId,
        isPublic: true,
        createdAt: new Date()
      }
    );

    // Code Questions
    questions.push(
      {
        subjectId: javaSubject._id,
        level: 'Beginner',
        type: 'code',
        question: 'Write a function that prints the sum of two numbers. Use console.log() to print the result.',
        codeTemplate: '// Read input: const {a, b} = input;\n// Your code here\n// Use console.log() to print the answer',
        language: 'javascript',
        testCases: [
          { input: '{"a": 2, "b": 3}', expectedOutput: '5', isHidden: false },
          { input: '{"a": 10, "b": 20}', expectedOutput: '30', isHidden: false },
          { input: '{"a": -5, "b": 5}', expectedOutput: '0', isHidden: true }
        ],
        points: 2,
        tags: ['functions', 'basics'],
        createdBy: adminResult.insertedId,
        isPublic: true,
        createdAt: new Date()
      },
      {
        subjectId: dsaId,
        level: 'Beginner',
        type: 'code',
        question: 'Write code that prints "true" if a number is even, "false" if odd. Use console.log() to print.',
        codeTemplate: '// Read input: const {num} = input;\n// Your code here\n// Use console.log() to print true or false',
        language: 'javascript',
        testCases: [
          { input: '{"num": 4}', expectedOutput: 'true', isHidden: false },
          { input: '{"num": 7}', expectedOutput: 'false', isHidden: false },
          { input: '{"num": 0}', expectedOutput: 'true', isHidden: true },
          { input: '{"num": -2}', expectedOutput: 'true', isHidden: true }
        ],
        points: 2,
        tags: ['functions', 'conditionals'],
        createdBy: adminResult.insertedId,
        isPublic: true,
        createdAt: new Date()
      },
      {
        subjectId: dsaId,
        level: 'Intermediate',
        type: 'code',
        question: 'Write code that prints the reversed string. Use console.log() to print.',
        codeTemplate: '// Read input: const {str} = input;\n// Your code here\n// Use console.log() to print the reversed string',
        language: 'javascript',
        testCases: [
          { input: '{"str": "hello"}', expectedOutput: 'olleh', isHidden: false },
          { input: '{"str": "world"}', expectedOutput: 'dlrow', isHidden: false },
          { input: '{"str": ""}', expectedOutput: '', isHidden: true },
          { input: '{"str": "a"}', expectedOutput: 'a', isHidden: true }
        ],
        points: 3,
        tags: ['strings', 'algorithms'],
        createdBy: adminResult.insertedId,
        isPublic: true,
        createdAt: new Date()
      }
    );

    await mongoose.connection.collection('questions').insertMany(questions);
    console.log('Questions created');

    console.log('\nDatabase seeded successfully!\n');
    console.log('Summary:');
    console.log(`   - 1 Admin user`);
    console.log(`   - ${subjectIds.length} Subjects`);
    console.log(`   - ${questions.length} Questions`);
    console.log('\nAdmin Credentials:');
    console.log('   Email: admin@campusgrid.com');
    console.log('   Password: admin123');
    console.log('\nYou can now start the server and test the system!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
