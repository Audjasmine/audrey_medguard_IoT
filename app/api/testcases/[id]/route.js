import { NextResponse } from "next/server";
import TestCase from "@/models/testCase";
import TestResult from "@/models/testResult";
import Vulnerability from "@/models/vulnerability";
import { connect } from "@/utils/connect";
import { v4 as uuidv4 } from "uuid";

// GET /api/testcases/[id] - Get test case details
export async function GET(request, context) {
  try {
    await connect();
    const testCase = await TestCase.findById(context.params.id);

    if (!testCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(testCase);
  } catch (error) {
    console.error("Error fetching test case:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/testcases/[id] - Update test case
export async function PUT(request, { params }) {
  try {
    await connect();
    const data = await request.json();
    
    // Ensure params.id is available before using it
    if (!params?.id) {
      return NextResponse.json({ error: "Test case ID is required" }, { status: 400 });
    }
    
    const testCaseId = params.id;

    // Find the test case
    const testCase = await TestCase.findById(testCaseId);

    if (!testCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }

    if (data.action === "run") {
      // Update test case status
      testCase.status = "running";
      testCase.lastRun = new Date();
      await testCase.save();

      // Create a new test result
      const testResult = await TestResult.create({
        executionId: `EXEC-${testCase._id}-${Date.now()}`,
        testId: testCase._id,
        deviceId: testCase.deviceId,
        status: "running",
        startTime: new Date(),
        metadata: {
          environment: "production",
          executor: "system",
          version: "1.0",
        },
      });

      // Generate a unique vulnId first
      const vulnId = `VULN-${testCase._id}-${uuidv4()}`;

      // Create single vulnerability with the pre-generated vulnId
      const vulnerability = await Vulnerability.create({
        testId: testCase._id,
        deviceId: testCase.deviceId,
        type: "security_configuration",
        severity: "high",
        status: "open",
        description: "Weak authentication mechanism detected",
        discoveredAt: new Date(),
        cvssScore: 8.5,
        affectedComponents: [testCase.deviceType],
        remediationSteps: [
          "Review security configuration",
          "Apply security patches",
          "Implement security best practices",
        ],
        vulnId: vulnId, // Use the pre-generated vulnId
      });

      // Update test result with findings
      testResult.status = "completed";
      testResult.endTime = new Date();
      testResult.results = {
        passed: false, // Always failed since we're creating a vulnerability
        findings: [
          {
            type: vulnerability.type,
            severity: vulnerability.severity,
            description: vulnerability.description,
          },
        ],
        metrics: {
          responseTime: Math.floor(Math.random() * 1000),
          resourceUsage: Math.floor(Math.random() * 100),
          securityScore: Math.floor(Math.random() * 100),
        },
      };
      await testResult.save();

      // Update test case status
      testCase.status = "failed"; // Always failed since we're creating a vulnerability
      await testCase.save();

      return NextResponse.json({
        testCase,
        testResult,
        vulnerability,
        message: "Test execution completed",
      });
    }

    // Handle regular updates
    Object.assign(testCase, data);
    testCase.updatedAt = new Date();
    await testCase.save();

    return NextResponse.json({
      testCase,
      message: "Test case updated successfully",
    });
  } catch (error) {
    console.error("Error updating test case:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/testcases/[id] - Delete test case
export async function DELETE(request, { params }) {
  try {
    await connect();
    const testCase = await TestCase.findByIdAndDelete(params.id);
    if (!testCase) {
      return NextResponse.json(
        { error: "Test case not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Test case deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
