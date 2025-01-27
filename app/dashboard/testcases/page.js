"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, RefreshCw, Play } from "lucide-react";

export default function TestCasesPage() {
  const [testCases, setTestCases] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newTestCase, setNewTestCase] = useState({
    title: "",
    description: "",
    deviceId: "",
    deviceType: "",
    category: "",
    priority: "medium",
    securityLevel: "medium",
    estimatedDuration: 30,
    automationLevel: "semi-automated",
    vulnerabilityType: "security_configuration",
    severity: "medium",
    remediationSteps: [],
    affectedComponents: []
  });

  useEffect(() => {
    fetchTestCases();
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/testcases');
      const data = await response.json();
      setTestCases(data);
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSelect = (deviceId) => {
    const device = devices.find(d => d._id === deviceId);
    setSelectedDevice(device);
    setNewTestCase(prev => ({
      ...prev,
      deviceId: device._id,
      deviceType: device.type,
      affectedComponents: [device.type]
    }));
  };

  const handleCreateTestCase = async () => {
    try {
      const response = await fetch('/api/testcases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTestCase)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test case');
      }

      setTestCases(prev => [...prev, data.testCase]);
      setShowAddDialog(false);
      setNewTestCase({
        title: "",
        description: "",
        deviceId: "",
        deviceType: "",
        category: "",
        priority: "medium",
        securityLevel: "medium",
        estimatedDuration: 30,
        automationLevel: "semi-automated",
        vulnerabilityType: "security_configuration",
        severity: "medium",
        remediationSteps: [],
        affectedComponents: []
      });
    } catch (error) {
      console.error('Error creating test case:', error);
      // Here you would typically show an error notification to the user
    }
  };

  const handleRunTest = async (testCase) => {
    try {
      const response = await fetch(`/api/testcases/${testCase._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run' })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to run test case');
      }

      // Update the test case in the list with the new status
      setTestCases(prev => 
        prev.map(tc => 
          tc._id === testCase._id 
            ? { 
                ...tc, 
                status: data.testCase.status, 
                lastRun: data.testCase.lastRun 
              }
            : tc
        )
      );

      // Show success message and redirect to results
      alert('Test execution completed! Check the Test Results and Vulnerabilities pages for details.');

      // Optional: Navigate to results page
      // window.location.href = '/dashboard/testresults';
    } catch (error) {
      console.error('Error running test case:', error);
      alert('Error running test case: ' + error.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Search test cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[300px]"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={fetchTestCases}
              className={loading ? 'animate-spin' : ''}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Test Case
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Test Case</DialogTitle>
                <DialogDescription>
                  Create a new test case and assign it to a device
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="device-select" className="text-sm font-medium">
                    Device
                  </label>
                  <Select
                    onValueChange={handleDeviceSelect}
                    value={newTestCase.deviceId}
                  >
                    <SelectTrigger id="device-select">
                      <SelectValue placeholder="Select a device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device._id} value={device._id}>
                          {device.name} ({device.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="test-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="test-title"
                    placeholder="Enter test case title"
                    value={newTestCase.title}
                    onChange={(e) => setNewTestCase(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="test-description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="test-description"
                    placeholder="Enter test case description"
                    value={newTestCase.description}
                    onChange={(e) => setNewTestCase(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="test-priority" className="text-sm font-medium">
                    Priority Level
                  </label>
                  <Select
                    value={newTestCase.priority}
                    onValueChange={(value) => setNewTestCase(prev => ({
                      ...prev,
                      priority: value
                    }))}
                  >
                    <SelectTrigger id="test-priority">
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="security-level" className="text-sm font-medium">
                    Security Level
                  </label>
                  <Select
                    value={newTestCase.securityLevel}
                    onValueChange={(value) => setNewTestCase(prev => ({
                      ...prev,
                      securityLevel: value
                    }))}
                  >
                    <SelectTrigger id="security-level">
                      <SelectValue placeholder="Select security level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTestCase}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Security Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases
                  .filter(testCase => 
                    testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    testCase.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((testCase) => (
                    <TableRow key={testCase._id}>
                      <TableCell>{testCase.title}</TableCell>
                      <TableCell>
                        {devices.find(d => d._id === testCase.deviceId)?.name || 'Unknown Device'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          testCase.priority === 'high' ? 'destructive' :
                          testCase.priority === 'medium' ? 'warning' :
                          'secondary'
                        }>
                          {testCase.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          testCase.securityLevel === 'high' ? 'destructive' :
                          testCase.securityLevel === 'medium' ? 'warning' :
                          'secondary'
                        }>
                          {testCase.securityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          testCase.status === 'failed' ? 'destructive' :
                          testCase.status === 'passed' ? 'success' :
                          testCase.status === 'running' ? 'warning' :
                          'secondary'
                        }>
                          {testCase.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {testCase.lastRun ? new Date(testCase.lastRun).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunTest(testCase)}
                          disabled={testCase.status === 'running'}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Run Test
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
