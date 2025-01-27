'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DeviceDetailsPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeviceData = async () => {
    try {
      const response = await fetch(`/api/devices/${params.id}/related`);
      if (!response.ok) {
        throw new Error('Failed to fetch device data');
      }
      const newData = await response.json();
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchDeviceData();

    // Set up polling every 5 seconds for real-time updates
    const interval = setInterval(fetchDeviceData, 5000);

    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Device Details */}
      <Card>
        <CardHeader>
          <CardTitle>Device Details</CardTitle>
          <CardDescription>ID: {data.device.deviceId}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <strong>Name:</strong> {data.device.name}
            </div>
            <div>
              <strong>Type:</strong> {data.device.type}
            </div>
            <div>
              <strong>Status:</strong> {data.device.status}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
          <CardDescription>{data.testCases.length} test cases found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.testCases.map((test) => (
              <div key={test.testId} className="border p-4 rounded">
                <div><strong>ID:</strong> {test.testId}</div>
                <div><strong>Title:</strong> {test.title}</div>
                <div><strong>Description:</strong> {test.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vulnerabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Vulnerabilities</CardTitle>
          <CardDescription>{data.vulnerabilities.length} vulnerabilities found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.vulnerabilities.map((vuln) => (
              <div key={vuln.vulnId} className="border p-4 rounded">
                <div><strong>ID:</strong> {vuln.vulnId}</div>
                <div><strong>Type:</strong> {vuln.type}</div>
                <div><strong>Severity:</strong> {vuln.severity}</div>
                <div><strong>Status:</strong> {vuln.status}</div>
                <div><strong>Description:</strong> {vuln.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>{data.testResults.length} test results found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.testResults.map((result) => (
              <div key={result.executionId} className="border p-4 rounded">
                <div><strong>Execution ID:</strong> {result.executionId}</div>
                <div><strong>Status:</strong> {result.status}</div>
                <div><strong>Start Time:</strong> {new Date(result.startTime).toLocaleString()}</div>
                <div><strong>End Time:</strong> {new Date(result.endTime).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
