import { spawn } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import os from 'os';

/**
 * SIMPLIFIED LEETCODE-STYLE CODE EXECUTOR
 * - Execute code and capture console output
 * - Match output as strings (simple comparison)
 * - Minimal server load
 * - Fast and efficient
 */

// Language configurations
const LANGUAGE_CONFIG = {
  javascript: {
    command: 'node',
    timeout: 5000,
    extension: '.js'
  },
  python: {
    command: 'python',
    timeout: 5000,
    extension: '.py'
  },
  java: {
    command: 'java',
    timeout: 10000,
    extension: '.java',
    needsCompile: true,
    compileCommand: 'javac'
  },
  cpp: {
    command: 'g++',
    timeout: 10000,
    extension: '.cpp',
    needsCompile: true,
    outputFile: 'a.out'
  }
};

/**
 * LEETCODE-STYLE: Execute code and capture console output
 * Simple string matching - minimal overhead
 */
const executeCodeSimple = async (code, testCases, language, config) => {
  const results = [];
  const tempDir = join(os.tmpdir(), 'campusgrid-exec');
  
  // Ensure temp directory exists
  await mkdir(tempDir, { recursive: true });

  for (const testCase of testCases) {
    const sessionId = randomBytes(8).toString('hex');
    const fileName = `code_${sessionId}${config.extension}`;
    const filePath = join(tempDir, fileName);
    const startTime = Date.now();

    try {
      // Prepare code with input
      let finalCode = code;
      
      // Add input handling based on language
      if (language === 'javascript') {
        finalCode = `
const input = ${JSON.stringify(testCase.input)};
${code}
`;
      } else if (language === 'python') {
        finalCode = `
input_data = ${JSON.stringify(testCase.input)}
${code}
`;
      } else if (language === 'java') {
        // Java: wrap in Main class
        finalCode = `
public class Main {
    public static void main(String[] args) {
        ${code}
    }
}
`;
      } else if (language === 'cpp') {
        // C++: add includes
        finalCode = `
#include <iostream>
#include <string>
#include <vector>
using namespace std;

${code}
`;
      }

      // Write code to file
      await writeFile(filePath, finalCode, 'utf8');

      let output;
      
      // Compile if needed
      if (config.needsCompile) {
        if (language === 'java') {
          await executeCommand(config.compileCommand, [filePath], null, config.timeout);
          const className = 'Main';
          output = await executeCommand('java', ['-cp', tempDir, className], JSON.stringify(testCase.input), config.timeout);
        } else if (language === 'cpp') {
          const outputPath = join(tempDir, `out_${sessionId}`);
          await executeCommand(config.command, [filePath, '-o', outputPath], null, config.timeout);
          output = await executeCommand(outputPath, [], JSON.stringify(testCase.input), config.timeout);
          await unlink(outputPath).catch(() => {});
        }
      } else {
        // Direct execution (JavaScript, Python)
        output = await executeCommand(config.command, [filePath], JSON.stringify(testCase.input), config.timeout);
      }

      const executionTime = Date.now() - startTime;

      // Simple string comparison (LeetCode style)
      const actualOutput = output.trim();
      const expectedOutput = String(testCase.expectedOutput).trim();
      const passed = actualOutput === expectedOutput;

      results.push({
        input: testCase.isHidden ? 'Hidden' : testCase.input,
        expectedOutput: testCase.isHidden ? 'Hidden' : expectedOutput,
        actualOutput: testCase.isHidden ? 'Hidden' : actualOutput,
        passed,
        error: null,
        executionTime
      });

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      results.push({
        input: testCase.isHidden ? 'Hidden' : testCase.input,
        expectedOutput: testCase.isHidden ? 'Hidden' : testCase.expectedOutput,
        actualOutput: null,
        passed: false,
        error: sanitizeError(error.message),
        executionTime
      });
    } finally {
      // Clean up
      try {
        await unlink(filePath);
        if (language === 'java') {
          await unlink(join(tempDir, 'Main.class')).catch(() => {});
        }
      } catch (err) {
        // Ignore cleanup errors
      }
    }
  }

  return results;
};

/**
 * Execute command with timeout (simple, no Docker)
 */
const executeCommand = (command, args, input, timeout) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill('SIGKILL');
      reject(new Error('Execution timeout exceeded'));
    }, timeout);

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
      // Prevent memory overflow
      if (stdout.length > 1024 * 100) { // 100KB limit
        proc.kill('SIGKILL');
        reject(new Error('Output size limit exceeded'));
      }
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      
      if (timedOut) return;
      
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Process exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    // Send input to stdin if provided
    if (input) {
      proc.stdin.write(input);
      proc.stdin.end();
    }
  });
};


/**
 * Sanitize error messages to prevent information leakage
 */
const sanitizeError = (error) => {
  // Remove file paths
  error = error.replace(/\/[^\s]+/g, '[path]');
  // Remove line numbers that might reveal system info
  error = error.replace(/at line \d+/g, 'at line [redacted]');
  // Limit error length
  if (error.length > 500) {
    error = error.substring(0, 500) + '...';
  }
  return error;
};

/**
 * SIMPLIFIED LEETCODE-STYLE CODE EXECUTOR
 * - Execute code and capture console.log output
 * - Match output as strings
 * - Minimal server load
 * - No Docker needed
 * 
 * @param {string} code - User's code
 * @param {Array} testCases - Array of test cases with input and expectedOutput
 * @param {string} language - Programming language
 * @returns {Object} - Execution results
 */
export const executeCode = async (code, testCases, language = 'javascript') => {
  const startTime = Date.now();
  
  try {
    // Validate language support
    const config = LANGUAGE_CONFIG[language.toLowerCase()];
    if (!config) {
      throw new Error(`Language '${language}' is not supported. Supported: ${Object.keys(LANGUAGE_CONFIG).join(', ')}`);
    }

    // Validate test cases
    if (!Array.isArray(testCases) || testCases.length === 0) {
      throw new Error('At least one test case is required');
    }

    if (testCases.length > 20) {
      throw new Error('Maximum 20 test cases allowed');
    }

    // Execute using simple file-based execution
    const results = await executeCodeSimple(code, testCases, language, config);

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;
    const percentage = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;
    const totalExecutionTime = Date.now() - startTime;

    // Audit log
    console.log(`[AUDIT] Code execution: language=${language}, tests=${totalCount}, passed=${passedCount}, time=${totalExecutionTime}ms`);

    return {
      success: true,
      results,
      passedCount,
      totalCount,
      percentage,
      language,
      totalExecutionTime,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`[ERROR] Code execution failed: ${error.message}`);
    
    return {
      success: false,
      error: sanitizeError(error.message),
      results: [],
      passedCount: 0,
      totalCount: testCases.length,
      percentage: 0,
      language,
      totalExecutionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * ENHANCED CODE VALIDATION - 5-STAR SECURITY
 * Validates code before execution with comprehensive security checks
 * @param {string} code - User's code
 * @param {string} language - Programming language
 * @returns {Object} - Validation result with detailed feedback
 */
export const validateCode = (code, language = 'javascript') => {
  const maxLength = parseInt(process.env.MAX_CODE_LENGTH) || 10000;
  
  // 1. Basic validation
  if (!code || typeof code !== 'string') {
    return { valid: false, error: 'Code must be a non-empty string' };
  }
  
  if (code.trim().length === 0) {
    return { valid: false, error: 'Code cannot be empty' };
  }
  
  if (code.length > maxLength) {
    return { 
      valid: false, 
      error: `Code exceeds maximum length of ${maxLength} characters (current: ${code.length})` 
    };
  }

  // 2. Language-specific validation
  const languageValidation = validateLanguageSpecific(code, language);
  if (!languageValidation.valid) {
    return languageValidation;
  }

  // 3. Check for dangerous patterns (cross-language)
  const dangerousPatterns = {
    javascript: [
      { pattern: /require\s*\(/gi, message: 'require() is not allowed' },
      { pattern: /import\s+/gi, message: 'import statements are not allowed' },
      { pattern: /eval\s*\(/gi, message: 'eval() is forbidden' },
      { pattern: /Function\s*\(/gi, message: 'Function constructor is forbidden' },
      { pattern: /process\./gi, message: 'process object access is forbidden' },
      { pattern: /child_process/gi, message: 'child_process is forbidden' },
      { pattern: /fs\./gi, message: 'File system access is forbidden' },
      { pattern: /\.exec\(/gi, message: 'exec() is forbidden' },
      { pattern: /__dirname/gi, message: '__dirname is not available' },
      { pattern: /__filename/gi, message: '__filename is not available' },
      { pattern: /global\./gi, message: 'global object access is forbidden' },
      { pattern: /this\.constructor/gi, message: 'Constructor access is forbidden' }
    ],
    python: [
      { pattern: /import\s+os/gi, message: 'os module is forbidden' },
      { pattern: /import\s+sys/gi, message: 'sys module is forbidden' },
      { pattern: /import\s+subprocess/gi, message: 'subprocess module is forbidden' },
      { pattern: /__import__/gi, message: '__import__ is forbidden' },
      { pattern: /eval\s*\(/gi, message: 'eval() is forbidden' },
      { pattern: /exec\s*\(/gi, message: 'exec() is forbidden' },
      { pattern: /compile\s*\(/gi, message: 'compile() is forbidden' },
      { pattern: /open\s*\(/gi, message: 'File operations are forbidden' }
    ],
    java: [
      { pattern: /Runtime\.getRuntime/gi, message: 'Runtime access is forbidden' },
      { pattern: /ProcessBuilder/gi, message: 'ProcessBuilder is forbidden' },
      { pattern: /System\.exit/gi, message: 'System.exit is forbidden' },
      { pattern: /java\.io\.File/gi, message: 'File operations are forbidden' },
      { pattern: /java\.net/gi, message: 'Network operations are forbidden' },
      { pattern: /java\.lang\.reflect/gi, message: 'Reflection is forbidden' }
    ],
    cpp: [
      { pattern: /system\s*\(/gi, message: 'system() is forbidden' },
      { pattern: /exec[lv][pe]?\s*\(/gi, message: 'exec family functions are forbidden' },
      { pattern: /popen\s*\(/gi, message: 'popen() is forbidden' },
      { pattern: /#include\s*<fstream>/gi, message: 'File operations are forbidden' },
      { pattern: /#include\s*<filesystem>/gi, message: 'Filesystem access is forbidden' }
    ]
  };

  const patterns = dangerousPatterns[language.toLowerCase()] || dangerousPatterns.javascript;
  
  for (const { pattern, message } of patterns) {
    if (pattern.test(code)) {
      return { 
        valid: false, 
        error: `Security violation: ${message}`,
        securityViolation: true 
      };
    }
  }

  // 4. Check for excessive loops (potential DoS)
  const loopCount = (code.match(/\b(for|while|do)\b/g) || []).length;
  if (loopCount > 10) {
    return { 
      valid: false, 
      error: 'Code contains too many loops (max 10). This may cause performance issues.' 
    };
  }

  // 5. Check for excessive recursion indicators
  const functionCount = (code.match(/function\s+\w+/g) || []).length;
  if (functionCount > 20) {
    return { 
      valid: false, 
      error: 'Code contains too many functions (max 20)' 
    };
  }

  return { valid: true };
};

/**
 * Language-specific validation
 */
const validateLanguageSpecific = (code, language) => {
  switch (language.toLowerCase()) {
    case 'javascript':
      // Check for valid JavaScript syntax patterns
      if (code.includes('<?') || code.includes('?>')) {
        return { valid: false, error: 'Invalid JavaScript syntax detected' };
      }
      break;
      
    case 'python':
      // Check for valid Python patterns
      if (code.includes('{') && code.includes('}') && !code.includes('def')) {
        return { valid: false, error: 'Invalid Python syntax detected' };
      }
      break;
      
    case 'java':
      // Java must have a class definition
      if (!code.includes('class') && !code.includes('public static')) {
        return { valid: false, error: 'Java code must contain a class or main method' };
      }
      break;
      
    case 'cpp':
      // C++ should have main function
      if (!code.includes('int main') && !code.includes('void main')) {
        return { valid: false, error: 'C++ code should contain a main function' };
      }
      break;
  }
  
  return { valid: true };
};
