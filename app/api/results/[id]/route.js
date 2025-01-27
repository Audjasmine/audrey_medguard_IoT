import { NextResponse } from 'next/server';
import TestResult from '@/models/testResult';
import dbConnect from '@/lib/dbConnect';

// GET /api/results/[id] - Get test result details
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const result = await TestResult.findById(params.id)
      .populate('testId', 'title category securityLevel steps')
      .populate('deviceId', 'name type status');
      
    if (!result) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/results/[id] - Update test result
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    const result = await TestResult.findByIdAndUpdate(params.id, data, { new: true });
    if (!result) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
