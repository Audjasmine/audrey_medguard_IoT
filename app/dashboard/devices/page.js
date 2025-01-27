"use client";

import { useEffect, useState } from 'react';
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
import { Plus, Search, RefreshCw } from "lucide-react";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDevice, setNewDevice] = useState({
    deviceId: "",
    name: "",
    type: "",
    description: "",
    status: "inactive",
    firmware: {
      version: "",
      lastUpdate: new Date()
    },
    location: { 
      ward: "", 
      room: "" 
    },
    lastMaintenance: new Date(),
    metadata: {}
  });

  const fetchDevices = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/devices', {
        cache: 'no-store'
      });
      if (!res.ok) {
        throw new Error('Failed to fetch devices');
      }
      const data = await res.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = async () => {
    try {
      // Generate a unique deviceId if not provided
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const deviceData = {
        ...newDevice,
        deviceId: newDevice.deviceId || `DEV-${timestamp}-${randomStr}`
      };

      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });

      if (res.ok) {
        setShowAddDialog(false);
        setNewDevice({
          deviceId: "",
          name: "",
          type: "",
          description: "",
          status: "inactive",
          firmware: {
            version: "",
            lastUpdate: new Date()
          },
          location: { 
            ward: "", 
            room: "" 
          },
          lastMaintenance: new Date(),
          metadata: {}
        });
        fetchDevices();
      } else {
        const error = await res.json();
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      active: "text-green-500",
      inactive: "text-gray-500",
      maintenance: "text-yellow-500",
      error: "text-red-500"
    };
    return colors[status] || "text-gray-500";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Devices</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => fetchDevices()} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>
                  Enter the details for the new IoT healthcare device.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label>Name</label>
                  <Input
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    placeholder="Device name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label>Type</label>
                  <Select
                    value={newDevice.type}
                    onValueChange={(value) => setNewDevice({...newDevice, type: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monitor">Monitor</SelectItem>
                      <SelectItem value="sensor">Sensor</SelectItem>
                      <SelectItem value="wearable">Wearable</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic</SelectItem>
                      <SelectItem value="therapeutic">Therapeutic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Description</label>
                  <Input
                    value={newDevice.description}
                    onChange={(e) => setNewDevice({...newDevice, description: e.target.value})}
                    placeholder="Device description"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label>Status</label>
                  <Select
                    value={newDevice.status}
                    onValueChange={(value) => setNewDevice({...newDevice, status: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Firmware Version</label>
                  <Input
                    value={newDevice.firmware.version}
                    onChange={(e) => setNewDevice({
                      ...newDevice,
                      firmware: {...newDevice.firmware, version: e.target.value}
                    })}
                    placeholder="e.g., 1.0.0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDevice}>Add Device</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>Firmware</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No devices found</TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device) => (
                  <TableRow key={device._id}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell>{`${device.location.ward} - ${device.location.room}`}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(device.status)}>
                        {device.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(device.lastMaintenance).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {device.firmware?.version || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
