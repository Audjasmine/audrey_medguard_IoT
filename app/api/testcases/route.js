import { NextResponse } from 'next/server';
import TestCase from '@/models/testCase';
import { connect } from '@/utils/connect';

// GET /api/testcases - List all test cases
export async function GET(request) {
  try {
    await connect();
    const testCases = await TestCase.find({})
      .sort({ createdAt: -1 })
      .populate('deviceId', 'name type');
    return NextResponse.json(testCases);
  } catch (error) {
    console.error('Error fetching test cases:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch test cases' },
      { status: 500 }
    );
  }
}

// POST /api/testcases - Create new test case
export async function POST(request) {
  try {
    await connect();
    const data = await request.json();
    
    // Validate required fields
    if (!data.deviceId || !data.title || !data.description) {
      return NextResponse.json(
        { error: 'Missing required fields: deviceId, title, and description' },
        { status: 400 }
      );
    }

    // Create the test case with only the fields from our schema
    const testCaseData = {
      title: data.title,
      description: data.description,
      deviceId: data.deviceId,
      deviceType: data.deviceType,
      priority: data.priority || 'medium',
      securityLevel: data.securityLevel || 'medium',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const testCase = await TestCase.create(testCaseData);

    return NextResponse.json({
      testCase,
      message: 'Test case created successfully'
    });

  } catch (error) {
    console.error('Error creating test case:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test case' },
      { status: 500 }
    );
  }
}

// PUT /api/testcases/:id - Update test case
export async function PUT(request) {
  try {
    await connect();
    const data = await request.json();
    const testCaseId = request.url.split('/').pop();

    if (data.rerun) {
      // Handle test case rerun
      const testCase = await TestCase.findByIdAndUpdate(
        testCaseId,
        {
          status: 'running',
          lastRun: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!testCase) {
        return NextResponse.json(
          { error: 'Test case not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        testCase,
        message: 'Test case execution started'
      });
    }

    // Handle regular update
    const testCase = await TestCase.findByIdAndUpdate(
      testCaseId,
      {
        ...data,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!testCase) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      testCase,
      message: 'Test case updated successfully'
    });

  } catch (error) {
    console.error('Error updating test case:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update test case' },
      { status: 500 }
    );
  }
}
