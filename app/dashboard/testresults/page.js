'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

export default function TestResultsPage() {
  const [testResults, setTestResults] = useState([]);
  const [devices, setDevices] = useState(new Map()); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDevices = async (deviceIds) => {
    try {
      const res = await fetch('/api/devices');
      if (!res.ok) throw new Error('Failed to fetch devices');
      const deviceList = await res.json();
      
      const deviceMap = new Map(
        deviceList.map(device => [device._id, device])
      );
      setDevices(deviceMap);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchTestResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/testresults');
      if (!res.ok) throw new Error('Failed to fetch test results');
      const data = await res.json();
      setTestResults(data);
      
      // Get unique device IDs and fetch device details
      const deviceIds = [...new Set(data.map(result => result.deviceId))];
      await fetchDevices(deviceIds);
    } catch (error) {
      console.error('Error fetching test results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestResults();
  }, [fetchTestResults]);

  const filteredResults = testResults && Array.isArray(testResults) ? testResults.filter(result => {
    const searchString = searchTerm.toLowerCase();
    return (
      (result.executionId?.toLowerCase() ?? '').includes(searchString) ||
      (result.deviceId?.name?.toLowerCase() ?? '').includes(searchString) ||
      (result.testId?.title?.toLowerCase() ?? '').includes(searchString) ||
      (result.metadata?.environment?.toLowerCase() ?? '').includes(searchString) ||
      (result.metadata?.executor?.toLowerCase() ?? '').includes(searchString)
    );
  }) : [];

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin mr-2" />
              Loading test results...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500",
      running: "bg-blue-500",
      completed: "bg-green-500",
      failed: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getSeverityBadge = (severity, count) => {
    if (count === 0) return null;
    
    const variants = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500"
    };
    
    return (
      <Badge className={variants[severity]}>
        {count} {severity}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Test Results</CardTitle>
            <Button onClick={fetchTestResults} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search test results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Execution ID</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Environment</TableHead> 
                  <TableHead>Executor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No test results found</TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => {
                    const findings = result.results?.findings || [];
                    const highCount = findings.filter(f => f.severity === 'high').length;
                    const mediumCount = findings.filter(f => f.severity === 'medium').length;
                    const lowCount = findings.filter(f => f.severity === 'low').length;
                    
                    const duration = result.startTime && result.endTime
                      ? Math.round((new Date(result.endTime) - new Date(result.startTime)) / 1000)
                      : null;

                    return (
                      <TableRow key={result._id}>
                        <TableCell className="font-mono">
                          {result.executionId}
                        </TableCell>
                        <TableCell>
                          {devices.get(result.deviceId?._id || result.deviceId)?.name || 'Unknown Device'}
                          {devices.get(result.deviceId?._id || result.deviceId)?.type && 
                            ` (${devices.get(result.deviceId?._id || result.deviceId).type})`
                          }
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {result.metadata?.environment || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {result.metadata?.executor || 'N/A'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}