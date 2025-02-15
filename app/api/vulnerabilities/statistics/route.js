import { NextResponse } from 'next/server';
import Vulnerability from '@/models/vulnerability';
import dbConnect from '@/lib/dbConnect';

// GET /api/vulnerabilities/statistics - Get vulnerability statistics
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // Default to last 30 days
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get vulnerabilities within timeframe
    const vulnerabilities = await Vulnerability.find({
      discoveredAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate statistics
    const statistics = {
      total: vulnerabilities.length,
      openCount: 0,
      resolvedCount: 0,
      avgResolutionTime: 0,
      severityDistribution: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      typeDistribution: {},
      statusDistribution: {
        open: 0,
        in_progress: 0,
        resolved: 0,
        wont_fix: 0
      },
      trendData: [],
      topAffectedDevices: [],
      riskScore: 0
    };

    // Process vulnerabilities
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    vulnerabilities.forEach(vuln => {
      // Count by severity
      statistics.severityDistribution[vuln.severity]++;
      
      // Count by status
      statistics.statusDistribution[vuln.status]++;
      
      // Count by type
      statistics.typeDistribution[vuln.type] = (statistics.typeDistribution[vuln.type] || 0) + 1;
      
      // Calculate resolution time for resolved vulnerabilities
      if (vuln.status === 'resolved' && vuln.resolvedAt) {
        const resolutionTime = new Date(vuln.resolvedAt) - new Date(vuln.discoveredAt);
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
      
      // Count open vs resolved
      if (vuln.status === 'resolved') {
        statistics.resolvedCount++;
      } else if (vuln.status === 'open' || vuln.status === 'in_progress') {
        statistics.openCount++;
      }
    });

    // Calculate average resolution time
    statistics.avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    // Generate trend data
    const timePoints = timeframe === '7d' ? 7 : 30; // Days
    for (let i = 0; i < timePoints; i++) {
      const point = new Date(startDate);
      point.setDate(point.getDate() + i);
      
      const dayVulnerabilities = vulnerabilities.filter(v => {
        const vulnDate = new Date(v.discoveredAt);
        return vulnDate.getDate() === point.getDate() &&
               vulnDate.getMonth() === point.getMonth() &&
               vulnDate.getFullYear() === point.getFullYear();
      });
      
      statistics.trendData.push({
        date: point,
        count: dayVulnerabilities.length,
        critical: dayVulnerabilities.filter(v => v.severity === 'critical').length,
        high: dayVulnerabilities.filter(v => v.severity === 'high').length
      });
    }

    // Calculate risk score (0-100)
    const severityWeights = { critical: 1, high: 0.7, medium: 0.4, low: 0.1 };
    let weightedSum = 0;
    let totalWeight = 0;
    
    Object.entries(statistics.severityDistribution).forEach(([severity, count]) => {
      weightedSum += count * severityWeights[severity];
      totalWeight += count;
    });
    
    statistics.riskScore = totalWeight > 0 
      ? Math.min(100, Math.round((weightedSum / totalWeight) * 100))
      : 0;

    // Get top affected devices
    const deviceCounts = await Vulnerability.aggregate([
      { $match: { discoveredAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$deviceId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    statistics.topAffectedDevices = await Promise.all(
      deviceCounts.map(async ({ _id, count }) => {
        const device = await Device.findById(_id).select('name type');
        return {
          deviceId: _id,
          name: device?.name || 'Unknown Device',
          type: device?.type || 'Unknown',
          vulnerabilityCount: count
        };
      })
    );

    return NextResponse.json(statistics);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
