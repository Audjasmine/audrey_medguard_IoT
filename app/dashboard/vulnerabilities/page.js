"use client";

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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, AlertTriangle, Shield } from "lucide-react";

export default function VulnerabilitiesPage() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    severity: "",
    status: "",
    deviceId: ""
  });

  const fetchVulnerabilities = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/api/vulnerabilities';
      const queryParams = [];
      
      if (filters.severity && filters.severity !== 'all') queryParams.push(`severity=${filters.severity}`);
      if (filters.status && filters.status !== 'all') queryParams.push(`status=${filters.status}`);
      if (filters.deviceId && filters.deviceId !== 'all') queryParams.push(`deviceId=${filters.deviceId}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch vulnerabilities');
      const data = await res.json();
      setVulnerabilities(data);
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVulnerabilities();
  }, [fetchVulnerabilities]);

  const filteredVulnerabilities = vulnerabilities && Array.isArray(vulnerabilities) ? vulnerabilities.filter(vuln => {
    const searchString = searchTerm.toLowerCase();
    return (
      (vuln.description && vuln.description.toLowerCase().includes(searchString)) ||
      (vuln.type && vuln.type.toLowerCase().includes(searchString)) ||
      (vuln._id && vuln._id.toLowerCase().includes(searchString)) ||
      (vuln.deviceId && typeof vuln.deviceId === 'object' && vuln.deviceId.name && 
       vuln.deviceId.name.toLowerCase().includes(searchString))
    );
  }) : [];

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="animate-spin mr-2" />
              Loading vulnerabilities...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-green-500"
    };
    return colors[severity] || "bg-gray-500";
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-red-500",
      in_progress: "bg-yellow-500",
      resolved: "bg-green-500",
      wont_fix: "bg-gray-500"
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Vulnerabilities</CardTitle>
            <Button onClick={fetchVulnerabilities} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search vulnerabilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select
                value={filters.severity}
                onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="wont_fix">Won&apos;t Fix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vulnerabilities Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discovered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVulnerabilities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No vulnerabilities found</TableCell>
                  </TableRow>
                ) : (
                  filteredVulnerabilities.map((vuln) => (
                    <TableRow key={vuln._id}>
                      <TableCell className="font-mono">{vuln._id}</TableCell>
                      <TableCell>
                        {vuln.deviceId && typeof vuln.deviceId === 'object' ? 
                          `${vuln.deviceId.name || 'Unknown'} (${vuln.deviceId.type || 'Unknown Type'})` : 
                          'Unknown Device'}
                      </TableCell>
                      <TableCell>{vuln.type}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(vuln.severity)}>
                          {vuln.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vuln.status)}>
                          {vuln.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {vuln.description}
                      </TableCell>
                      <TableCell>
                        {vuln.discoveredAt ? new Date(vuln.discoveredAt).toLocaleString() : 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
