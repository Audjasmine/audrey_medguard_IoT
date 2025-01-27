"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  Shield,
  XCircle
} from "lucide-react";
import { BarChart } from '@/components/ui/charts.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState({
    devices: { total: 0, active: 0 },
    tests: { total: 0, passing: 0, failing: 0 },
    vulnerabilities: { total: 0, critical: 0, high: 0 },
    testTrend: [],
    vulnerabilityTrend: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const devicesRes = await fetch('/api/devices');
        const devices = await devicesRes.json();

        const vulnRes = await fetch('/api/vulnerabilities');
        const vulnerabilities = await vulnRes.json();

        const testRes = await fetch('/api/testcases');
        const testCases = await testRes.json();

        const activeDevices = devices.filter(d => d.status === 'active');
        const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
        const highVulns = vulnerabilities.filter(v => v.severity === 'high');
        const passedTests = testCases.filter(t => t.status === 'passed');

        setStats({
          devices: {
            total: devices.length,
            active: activeDevices.length
          },
          tests: {
            total: testCases.length,
            passing: Math.round((passedTests.length / testCases.length) * 100) || 0,
            failing: Math.round(((testCases.length - passedTests.length) / testCases.length) * 100) || 0
          },
          vulnerabilities: {
            total: vulnerabilities.length,
            critical: criticalVulns.length,
            high: highVulns.length
          },
          testTrend: generateTestTrend(testCases),
          vulnerabilityTrend: generateVulnerabilityTrend(vulnerabilities)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to generate test trend data
  const generateTestTrend = (testCases) => {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      time: date,
      count: testCases.filter(t => 
        t.createdAt?.split('T')[0] === date
      ).length
    }));
  };

  // Helper function to generate vulnerability trend data
  const generateVulnerabilityTrend = (vulnerabilities) => {
    const last7Days = Array.from({length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: date,
      Total: vulnerabilities.filter(v => 
        v.discoveredAt?.split('T')[0] === date
      ).length,
      Critical: vulnerabilities.filter(v => 
        v.discoveredAt?.split('T')[0] === date && v.severity === 'critical'
      ).length
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Devices</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.devices.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.devices.active} active devices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Test Pass Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tests.passing}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.tests.total} tests run
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vulnerabilities.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.vulnerabilities.critical} critical issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Test Failures</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tests.failing}%</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Execution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={stats.testTrend}
              xField="time"
              yField="count"
              categories={['count']} // Change this to match the data property
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerability Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={stats.vulnerabilityTrend}
              xField="date" 
              categories={['Total', 'Critical']} // Move categories here
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
