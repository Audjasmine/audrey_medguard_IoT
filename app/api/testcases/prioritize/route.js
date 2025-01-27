import { NextResponse } from 'next/server';
import TestCase from '@/models/testCase';
import { connect } from '@/utils/connect';

// Hill Climbing algorithm for test case prioritization
function hillClimbingPrioritization(testCases) {
  // Sort test cases based on multiple factors
  return testCases.sort((a, b) => {
    // Calculate priority score based on multiple factors
    const getScore = (test) => {
      let score = test.priority; // Base priority
      
      // Add weight for security level
      const securityWeight = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1
      };
      score += securityWeight[test.securityLevel] || 0;
      
      // Consider estimated duration (prefer shorter tests)
      score += 1 / (test.estimatedDuration || 1);
      
      // Consider dependencies (fewer dependencies preferred)
      score -= (test.dependencies?.length || 0) * 0.1;
      
      return score;
    };
    
    return getScore(b) - getScore(a);
  });
}

// POST /api/testcases/prioritize - Run Hill Climbing algorithm
export async function POST() {
  try {
    await connect();
    const testCases = await TestCase.find({});
    
    // Apply Hill Climbing algorithm
    const prioritizedTests = hillClimbingPrioritization(testCases);
    
    // Update priorities in database
    for (let i = 0; i < prioritizedTests.length; i++) {
      await TestCase.findByIdAndUpdate(prioritizedTests[i]._id, {
        priority: i + 1
      });
    }
    
    return NextResponse.json(prioritizedTests);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/testcases/prioritize - Get current priority queue
export async function GET() {
  try {
    await connect();
    const priorityQueue = await TestCase.find({})
      .sort({ priority: 1 })
      .select('testId title priority securityLevel estimatedDuration');
    return NextResponse.json(priorityQueue);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
