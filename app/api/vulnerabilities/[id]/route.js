import { NextResponse } from 'next/server';
import Vulnerability from '@/models/vulnerability';
import dbConnect from '@/lib/dbConnect';

// GET /api/vulnerabilities/[id] - Get vulnerability details
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const vulnerability = await Vulnerability.findById(params.id)
      .populate('deviceId', 'name type status location')
      .populate('testId', 'title category securityLevel');
      
    if (!vulnerability) {
      return NextResponse.json({ error: 'Vulnerability not found' }, { status: 404 });
    }
    return NextResponse.json(vulnerability);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/vulnerabilities/[id] - Update vulnerability
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // If marking as resolved, set resolvedAt
    if (data.status === 'resolved' && !data.resolvedAt) {
      data.resolvedAt = new Date();
    }
    
    const vulnerability = await Vulnerability.findByIdAndUpdate(params.id, data, { new: true });
    if (!vulnerability) {
      return NextResponse.json({ error: 'Vulnerability not found' }, { status: 404 });
    }
    return NextResponse.json(vulnerability);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
