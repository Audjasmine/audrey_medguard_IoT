import { NextResponse } from 'next/server';
import TestResult from '@/models/testResult';
import dbConnect from '@/lib/dbConnect';

// GET /api/results - List all test results
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const status = searchParams.get('status');
    const result = searchParams.get('result');
    
    let query = {};
    if (deviceId) query.deviceId = deviceId;
    if (status) query.status = status;
    if (result) query.result = result;
    
    const results = await TestResult.find(query)
      .sort({ startTime: -1 })
      .populate('testId', 'title category securityLevel')
      .populate('deviceId', 'name type');
      
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/results - Create new test result
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    data.startTime = data.startTime || new Date();
    const result = await TestResult.create(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
