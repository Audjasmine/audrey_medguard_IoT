import { NextResponse } from 'next/server';
import Vulnerability from '@/models/vulnerabilities';
import dbConnect from '@/lib/dbConnect';

// GET /api/vulnerabilities - List all vulnerabilities
export async function GET(request) {
  try {
    await dbConnect();
    
    let query = {};
    
    // Only add filters if the URL has search params
    if (request.url.includes('?')) {
      const { searchParams } = new URL(request.url);
      const severity = searchParams.get('severity');
      const status = searchParams.get('status');
      const deviceId = searchParams.get('deviceId');
      
      if (severity) query.severity = severity;
      if (status) query.status = status;
      if (deviceId) query.deviceId = deviceId;
    }
    
    const vulnerabilities = await Vulnerability.find(query)
      .sort({ severity: -1, discoveredAt: -1 })
      .populate('deviceId', 'name type status')
      .populate('testId', 'title category')
      .exec();
      
    return NextResponse.json(vulnerabilities);
  } catch (error) {
    console.error('Error fetching vulnerabilities:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}

// POST /api/vulnerabilities - Create new vulnerability
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    data.discoveredAt = data.discoveredAt || new Date();
    const vulnerability = await Vulnerability.create(data);
    return NextResponse.json(vulnerability, { status: 201 });
  } catch (error) {
    console.error('Error creating vulnerability:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
