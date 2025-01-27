import { NextResponse } from 'next/server';
import TestResult from '@/models/testResult';
import Device from '@/models/device';
import TestCase from '@/models/testCase';
import dbConnect from '@/lib/dbConnect';

// GET /api/testresults - List all test results
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const result = searchParams.get('result');
    const deviceId = searchParams.get('deviceId');
    
    let query = {};
    if (status) query.status = status;
    if (result) query.result = result;
    if (deviceId) query.deviceId = deviceId;
    
    // First get the test results
    const testResults = await TestResult.find(query)
      .sort({ startTime: -1 })
      .lean()
      .exec();
      
    // Get unique device and test IDs
    const deviceIds = [...new Set(testResults.map(tr => tr.deviceId))];
    const testIds = [...new Set(testResults.map(tr => tr.testId))];
    
    // Fetch devices and test cases in bulk
    const devices = await Device.find({ deviceId: { $in: deviceIds } }).lean();
    const testCases = await TestCase.find({ testId: { $in: testIds } }).lean();
    
    // Create lookup maps
    const deviceMap = new Map(devices.map(d => [d.deviceId, d]));
    const testMap = new Map(testCases.map(t => [t.testId, t]));
    
    // Transform the results to include device and test case info
    const transformedResults = testResults.map(result => ({
      ...result,
      deviceInfo: deviceMap.get(result.deviceId) || { 
        name: 'Unknown Device',
        type: 'unknown',
        status: 'unknown'
      },
      testInfo: testMap.get(result.testId) || {
        title: 'Unknown Test',
        category: 'unknown'
      }
    }));
      
    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('Error in GET /api/testresults:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// POST /api/testresults - Create new test result
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate required fields
    if (!data.deviceId || !data.testId) {
      return NextResponse.json({ 
        error: 'deviceId and testId are required' 
      }, { status: 400 });
    }
    
    const testResult = await TestResult.create(data);
    
    // Get device and test case info
    const device = await Device.findOne({ deviceId: data.deviceId }).lean();
    const testCase = await TestCase.findOne({ testId: data.testId }).lean();
    
    const response = {
      ...testResult.toObject(),
      deviceInfo: device || { 
        name: 'Unknown Device',
        type: 'unknown',
        status: 'unknown'
      },
      testInfo: testCase || {
        title: 'Unknown Test',
        category: 'unknown'
      }
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/testresults:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
