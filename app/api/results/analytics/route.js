import { NextResponse } from 'next/server';
import TestResult from '@/models/testResult';
import dbConnect from '@/lib/dbConnect';

// GET /api/results/analytics - Get testing analytics
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d'; // Default to last 7 days
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Get all results within timeframe
    const results = await TestResult.find({
      startTime: { $gte: startDate, $lte: endDate }
    });

    // Calculate analytics
    const analytics = {
      totalTests: results.length,
      passRate: 0,
      failRate: 0,
      avgExecutionTime: 0,
      resultsByType: {
        pass: 0,
        fail: 0,
        error: 0,
        skipped: 0
      },
      severityDistribution: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      timeDistribution: []
    };

    // Process results
    let totalExecutionTime = 0;
    results.forEach(result => {
      // Count by result type
      analytics.resultsByType[result.result]++;
      
      // Calculate execution time
      const executionTime = new Date(result.endTime) - new Date(result.startTime);
      totalExecutionTime += executionTime;
      
      // Count findings by severity
      result.findings.forEach(finding => {
        analytics.severityDistribution[finding.severity]++;
      });
    });

    // Calculate rates and averages
    analytics.passRate = (analytics.resultsByType.pass / analytics.totalTests) * 100;
    analytics.failRate = (analytics.resultsByType.fail / analytics.totalTests) * 100;
    analytics.avgExecutionTime = totalExecutionTime / analytics.totalTests;

    // Generate time distribution data
    const timePoints = timeframe === '24h' ? 24 : 7; // Hours or days
    for (let i = 0; i < timePoints; i++) {
      const point = new Date(startDate);
      timeframe === '24h' ? point.setHours(point.getHours() + i) : point.setDate(point.getDate() + i);
      
      const count = results.filter(r => {
        const resultDate = new Date(r.startTime);
        return timeframe === '24h' 
          ? resultDate.getHours() === point.getHours() 
          : resultDate.getDate() === point.getDate();
      }).length;
      
      analytics.timeDistribution.push({
        time: point,
        count: count
      });
    }

    return NextResponse.json(analytics);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
