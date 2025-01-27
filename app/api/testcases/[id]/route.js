import { NextResponse } from 'next/server';
import TestCase from '@/models/testCase';
import TestResult from '@/models/testResult';
import Vulnerability from '@/models/vulnerability';
import { connect } from '@/utils/connect';

// GET /api/testcases/[id] - Get test case details
export async function GET(request, { params }) {
  try {
    await connect();
    const testCase = await TestCase.findById(params.id);
    
    if (!testCase) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(testCase);
  } catch (error) {
    console.error('Error fetching test case:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/testcases/[id] - Update test case
export async function PUT(request, { params }) {
  try {
    await connect();
    const data = await request.json();
    const testCaseId = await params.id;

    // Find the test case
    const testCase = await TestCase.findById(testCaseId);
    
    if (!testCase) {
      return NextResponse.json(
        { error: 'Test case not found' },
        { status: 404 }
      );
    }

    if (data.action === 'run') {
      // Update test case status
      testCase.status = 'running';
      testCase.lastRun = new Date();
      await testCase.save();

      // Create a new test result
      const testResult = await TestResult.create({
        executionId: `EXEC-${testCase._id}-${Date.now()}`,
        testId: testCase._id,
        deviceId: testCase.deviceId,
        status: 'running',
        startTime: new Date(),
        metadata: {
          environment: 'production',
          executor: 'system',
          version: '1.0'
        }
      });

      // Simulate some security checks and create vulnerabilities
      const vulnerabilityTypes = [
        { type: 'security_configuration', severity: 'high', description: 'Weak authentication mechanism detected' },
        { type: 'encryption', severity: 'medium', description: 'Data encryption at rest not properly implemented' },
        { type: 'configuration', severity: 'low', description: 'Potential access control misconfiguration' }
      ];

      // Randomly select 1-2 vulnerability types
      const selectedVulns = vulnerabilityTypes
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 2) + 1);

      // Create vulnerabilities
      const vulnerabilities = await Promise.all(
        selectedVulns.map(vuln => 
          Vulnerability.create({
            testId: testCase._id,
            deviceId: testCase.deviceId,
            type: vuln.type,
            severity: vuln.severity,
            status: 'open',
            description: vuln.description,
            discoveredAt: new Date(),
            cvssScore: vuln.severity === 'high' ? 8.5 : vuln.severity === 'medium' ? 5.5 : 3.5,
            affectedComponents: [testCase.deviceType],
            remediationSteps: [
              'Review security configuration',
              'Apply security patches',
              'Implement security best practices'
            ]
          })
        )
      );

      // Update test result with findings
      testResult.status = 'completed';
      testResult.endTime = new Date();
      testResult.results = {
        passed: vulnerabilities.length === 0,
        findings: vulnerabilities.map(v => ({
          type: v.type,
          severity: v.severity,
          description: v.description
        })),
        metrics: {
          responseTime: Math.floor(Math.random() * 1000),
          resourceUsage: Math.floor(Math.random() * 100),
          securityScore: Math.floor(Math.random() * 100)
        }
      };
      await testResult.save();

      // Update test case status
      testCase.status = vulnerabilities.length === 0 ? 'passed' : 'failed';
      await testCase.save();

      return NextResponse.json({
        testCase,
        testResult,
        vulnerabilities,
        message: 'Test execution completed'
      });
    }

    // Handle regular updates
    Object.assign(testCase, data);
    testCase.updatedAt = new Date();
    await testCase.save();

    return NextResponse.json({
      testCase,
      message: 'Test case updated successfully'
    });

  } catch (error) {
    console.error('Error updating test case:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/testcases/[id] - Delete test case
export async function DELETE(request, { params }) {
  try {
    await connect();
    const testCase = await TestCase.findByIdAndDelete(params.id);
    if (!testCase) {
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
