import { NextResponse } from 'next/server';
import { connect } from '@/utils/connect';
import Device from '@/models/device';
import TestCase from '@/models/testCase';
import Vulnerability from '@/models/vulnerability';
import TestResult from '@/models/testResult';

// GET /api/devices/[id]/related - Get all related data for a device
export async function GET(request, { params }) {
  try {
    await connect();
    const deviceId = params.id;

    // Get the device
    const device = await Device.findOne({ deviceId });
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // Get all test cases for this device
    const testCases = await TestCase.find({ deviceId });

    // Get all vulnerabilities for this device
    const vulnerabilities = await Vulnerability.find({ deviceId });

    // Get all test results for this device
    const testResults = await TestResult.find({ deviceId });

    return NextResponse.json({
      device,
      testCases,
      vulnerabilities,
      testResults
    });
  } catch (error) {
    console.error('Error fetching device related data:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.errors || error.stack
    }, { status: 500 });
  }
}
