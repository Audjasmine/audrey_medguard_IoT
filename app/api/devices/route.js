import { NextResponse } from 'next/server';
import Device from '@/models/device';
import TestCase from '@/models/testCase';
import Vulnerability from '@/models/vulnerabilities';
import TestResult from '@/models/testResult';
import { connect } from '@/utils/connect';

export async function GET() {
  try {
    await connect();
    const devices = await Device.find({}).sort({ createdAt: -1 });
    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connect();
    const data = await request.json();
    
    // Create the device
    const device = await Device.create(data);

    // Find all test cases that match this device type
    const testCases = await TestCase.find({ deviceType: device.type });

    if (!testCases.length) {
      console.warn('No test cases found for device type:', device.type);
      return NextResponse.json({ 
        device,
        warning: 'No test cases found for this device type'
      }, { status: 201 });
    }

    // Arrays to store created records
    const vulnerabilities = [];
    const testResults = [];

    // Common vulnerability types for IoT health devices
    const vulnerabilityTypes = [
      {
        type: 'authentication',
        severity: 'high',
        description: 'Potential authentication bypass in device access control'
      },
      {
        type: 'encryption',
        severity: 'critical',
        description: 'Weak encryption in data transmission'
      },
      {
        type: 'data_exposure',
        severity: 'high',
        description: 'Sensitive health data exposure risk'
      }
    ];

    // Create vulnerabilities (2-3 random ones)
    const numVulnerabilities = Math.floor(Math.random() * 2) + 2; // 2-3 vulnerabilities
    for (let i = 0; i < numVulnerabilities; i++) {
      const vulnType = vulnerabilityTypes[i % vulnerabilityTypes.length];
      const vulnerability = await Vulnerability.create({
        vulnId: `VULN-${device.deviceId}-${i + 1}`,
        testId: testCases[i % testCases.length]._id, // Use modulo to cycle through test cases
        deviceId: device._id,
        type: vulnType.type,
        severity: vulnType.severity,
        cvssScore: vulnType.severity === 'critical' ? 9.0 : 7.0,
        description: `${vulnType.description} for ${device.name}`,
        status: 'open',
        discoveredAt: new Date(),
        affectedComponents: [device.type]
      });
      vulnerabilities.push(vulnerability);
    }

    // Create test results for each test case
    for (const testCase of testCases) {
      const isFailure = Math.random() > 0.7; // 30% chance of failure
      const testResult = await TestResult.create({
        executionId: `EXEC-${device.deviceId}-${testCase.testId}`,
        testId: testCase._id,
        deviceId: device._id,
        startTime: new Date(),
        endTime: new Date(Date.now() + testCase.estimatedDuration * 60000),
        status: 'completed',
        result: isFailure ? 'fail' : 'pass',
        findings: isFailure ? [{
          type: 'security',
          severity: 'high',
          description: `Security test failed: potential vulnerability detected in ${device.name}`,
          timestamp: new Date()
        }] : [],
        metrics: {
          responseTime: Math.random() * 1000,
          memoryUsage: Math.random() * 100,
          cpuUsage: Math.random() * 100,
          networkLatency: Math.random() * 200
        },
        environment: {
          firmwareVersion: device.firmware?.version || '1.0.0',
          osVersion: 'IoT-OS 2.0',
          networkType: 'Secure-IoT-Network'
        },
        executor: 'automated-security-suite',
        logs: [
          {
            timestamp: new Date(),
            level: 'info',
            message: `Executed security test: ${testCase.title}`
          },
          {
            timestamp: new Date(),
            level: isFailure ? 'error' : 'info',
            message: isFailure ? 'Test failed: security checks did not pass' : 'Test passed successfully'
          }
        ]
      });
      testResults.push(testResult);
    }

    return NextResponse.json({
      device,
      vulnerabilities,
      testResults,
      message: `Created device with ${vulnerabilities.length} vulnerabilities and ${testResults.length} test results`
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating device and related records:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
