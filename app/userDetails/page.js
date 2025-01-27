"use client";

import { useState } from 'react';
import {
    Card,
    CardTitle,
    CardHeader,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, X } from "lucide-react";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function UserDetails() {
    const initialState = {
        farm_name: '',
        country: '',
        city: '',
        province: '',
        farm_size: '',
        farm_type: '',
        employess_number: '',
        crops: [],
        animals: []
    };

    const {data: session} = useSession();
    const [data, setData] = useState(initialState);
    const [newCrop, setNewCrop] = useState({ type: '', count: '' });
    const [newAnimal, setNewAnimal] = useState({ type: '', count: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingCrop, setIsAddingCrop] = useState(false);
    const [isAddingAnimal, setIsAddingAnimal] = useState(false);
    const router = useRouter();
    const user = session?.user.id;


    const handleInput = (e) => {
        e.preventDefault();
        setData((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSelectChange = (name, value) => {
        setData((prev) => ({...prev, [name]: value}));
    };

    const handleAddCrop = async (e) => {
        e.preventDefault();
        if (!newCrop.type || !newCrop.count) {
            toast.error('Please fill in both crop type and count');
            return;
        }

        setIsAddingCrop(true);
        try {
            const newCropItem = {
                type: newCrop.type,
                count: newCrop.count.toString()
            };

            setData(prev => ({
                ...prev,
                crops: [...prev.crops, newCropItem]
            }));
            console.log('Added crop:', newCropItem);
            setNewCrop({ type: '', count: '' });
        } finally {
            setIsAddingCrop(false);
        }
    };

    const handleAddAnimal = async (e) => {
        e.preventDefault();
        if (!newAnimal.type || !newAnimal.count) {
            toast.error('Please fill in both animal type and count');
            return;
        }

        setIsAddingAnimal(true);
        try {
            const newAnimalItem = {
                type: newAnimal.type,
                count: newAnimal.count.toString()
            };

            setData(prev => ({
                ...prev,
                animals: [...prev.animals, newAnimalItem]
            }));
            console.log('Added animal:', newAnimalItem);
            setNewAnimal({ type: '', count: '' });
        } finally {
            setIsAddingAnimal(false);
        }
    };

    const handleRemoveCrop = (index) => {
        setData(prev => {
            const newCrops = [...prev.crops];
            newCrops.splice(index, 1);
            return { ...prev, crops: newCrops };
        });
    };

    const handleRemoveAnimal = (index) => {
        setData(prev => {
            const newAnimals = [...prev.animals];
            newAnimals.splice(index, 1);
            return { ...prev, animals: newAnimals };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if all required fields are filled
        const requiredFields = ['farm_name', 'country', 'city', 'province', 'farm_size', 'farm_type', 'employess_number'];
        for (const field of requiredFields) {
            if (!data[field]) {
                toast.error(`${field.replace('_', ' ')} is required`);
                return;
            }
        }

        setIsLoading(true);
        try {
            // Prepare the submission data
            const submissionData = {
                ...data,
                user: user,
                farm_size: data.farm_size.toString(),
                employess_number: data.employess_number.toString(),
                crops: data.crops.map(crop => ({
                    type: crop.type,
                    count: crop.count
                })),
                animals: data.animals.map(animal => ({
                    type: animal.type,
                    count: animal.count
                }))
            };

            console.log('Submitting data:', submissionData);

            const response = await fetch('/api/userDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });

            if (response.ok) {
                toast.success('Farm details saved successfully');
                setData(initialState);
                router.push('/dashboard');
            } else {
                const error = await response.json();
                console.error('Server response:', error);
                toast.error(error.message || 'An error occurred while saving farm details');
            }
        } catch (error) {
            console.error("Error while saving farm details:", error);
            toast.error('Failed to save farm details');
        } finally {
            setIsLoading(false);
        }
    };

    const farmTypes = ["Crop Farm", "Livestock Farm", "Mixed Farm", "Dairy Farm", "Poultry Farm", "Other"];

    return (
        <div className="container mx-auto px-4">
            <Card className="w-full max-w-7xl mx-auto mt-8 mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Farm Details</CardTitle>
                    <CardDescription>
                        Tell us more about your farm to help us personalize your experience
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="farm_name">Farm Name</Label>
                            <Input
                                id="farm_name"
                                name="farm_name"
                                placeholder="Green Acres Farm"
                                onChange={handleInput}
                                value={data.farm_name}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    placeholder="Your Country"
                                    onChange={handleInput}
                                    value={data.country}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="province">Province/State</Label>
                                <Input
                                    id="province"
                                    name="province"
                                    placeholder="Your Province"
                                    onChange={handleInput}
                                    value={data.province}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    placeholder="Your City"
                                    onChange={handleInput}
                                    value={data.city}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="farm_size">Farm Size (acres)</Label>
                                <Input
                                    id="farm_size"
                                    name="farm_size"
                                    type="number"
                                    placeholder="Farm size in acres"
                                    onChange={handleInput}
                                    value={data.farm_size}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="farm_type">Farm Type</Label>
                                <Select 
                                    name="farm_type" 
                                    onValueChange={(value) => handleSelectChange("farm_type", value)}
                                    value={data.farm_type}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select farm type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {farmTypes.map((type) => (
                                            <SelectItem key={type} value={type.toLowerCase()}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="employess_number">Number of Employees</Label>
                                <Input
                                    id="employess_number"
                                    name="employess_number"
                                    type="number"
                                    placeholder="Number of employees"
                                    onChange={handleInput}
                                    value={data.employess_number}
                                />
                            </div>
                        </div>

                        {/* Crops Section */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-4">Crops ({data.crops.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input
                                    placeholder="Crop type"
                                    value={newCrop.type}
                                    onChange={(e) => setNewCrop(prev => ({ ...prev, type: e.target.value }))}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Count"
                                        value={newCrop.count}
                                        onChange={(e) => setNewCrop(prev => ({ ...prev, count: e.target.value }))}
                                        min="1"
                                    />
                                    <LoadingButton 
                                        type="button" 
                                        onClick={handleAddCrop}
                                        className="flex-shrink-0"
                                        loading={isAddingCrop}
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                    </LoadingButton>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {data.crops.map((crop, index) => (
                                    <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded">
                                        <span>{crop.type} - {crop.count}</span>
                                        <LoadingButton 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleRemoveCrop(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </LoadingButton>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Animals Section */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-4">Animals ({data.animals.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input
                                    placeholder="Animal type"
                                    value={newAnimal.type}
                                    onChange={(e) => setNewAnimal(prev => ({ ...prev, type: e.target.value }))}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        placeholder="Count"
                                        value={newAnimal.count}
                                        onChange={(e) => setNewAnimal(prev => ({ ...prev, count: e.target.value }))}
                                        min="1"
                                    />
                                    <LoadingButton 
                                        type="button" 
                                        onClick={handleAddAnimal}
                                        className="flex-shrink-0"
                                        loading={isAddingAnimal}
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                    </LoadingButton>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {data.animals.map((animal, index) => (
                                    <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded">
                                        <span>{animal.type} - {animal.count}</span>
                                        <LoadingButton 
                                            type="button" 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => handleRemoveAnimal(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </LoadingButton>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <LoadingButton type="submit" className="w-full mt-4" loading={isLoading}>
                            Save Farm Details
                        </LoadingButton>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
