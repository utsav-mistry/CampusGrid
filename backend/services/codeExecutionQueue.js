import Queue from 'bull';
import { executeCode } from './codeExecutor.js';

// Create a queue for code execution
const codeQueue = new Queue('code-execution', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Process jobs with concurrency
codeQueue.process(10, async (job) => {
  const { code, language, testCases, timeLimit, memoryLimit } = job.data;
  
  try {
    const result = await executeCode(code, language, testCases, timeLimit, memoryLimit);
    return result;
  } catch (error) {
    throw new Error(`Code execution failed: ${error.message}`);
  }
});

// Event listeners
codeQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed successfully`);
});

codeQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

codeQueue.on('stalled', (job) => {
  console.warn(`Job ${job.id} stalled`);
});

// Add code execution to queue
export const queueCodeExecution = async (executionData) => {
  const job = await codeQueue.add(executionData, {
    priority: executionData.priority || 1,
    timeout: 60000 // 60 second timeout
  });

  return job;
};

// Get job status
export const getJobStatus = async (jobId) => {
  const job = await codeQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress();
  const result = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    id: job.id,
    state,
    progress,
    result,
    failedReason
  };
};

// Get queue stats
export const getQueueStats = async () => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    codeQueue.getWaitingCount(),
    codeQueue.getActiveCount(),
    codeQueue.getCompletedCount(),
    codeQueue.getFailedCount(),
    codeQueue.getDelayedCount()
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed
  };
};

// Clean old jobs
export const cleanQueue = async () => {
  await codeQueue.clean(24 * 60 * 60 * 1000); // Clean jobs older than 24 hours
};

export default codeQueue;
