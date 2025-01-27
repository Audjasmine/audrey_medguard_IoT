import { connect } from "@/utils/connect";
import UserDetails from "@/models/userDetails";
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await connect();

        const { user, farm_name, country, city, province, farm_size, farm_type, employess_number, crops, animals } = await req.json();
        await UserDetails.create({ user, farm_name, country, city, province, farm_size, farm_type, employess_number, crops, animals });

        return NextResponse.json({ message: "User Details Registered" }, { status: 201 });

    } catch (error) {
        console.error("Error while registering user details", error);
        return NextResponse.json({ message: "Error while registering the user details" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connect();
        
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }

        const userDetails = await UserDetails.findOne({ user: userId });
        
        if (!userDetails) {
            return NextResponse.json({ message: "User details not found" }, { status: 404 });
        }

        return NextResponse.json(userDetails);

    } catch (error) {
        console.error("Error while fetching user details", error);
        return NextResponse.json({ message: "Error while fetching user details" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { userId, ...updateData } = body;

        await connect();
        
        const updatedDetails = await UserDetails.findOneAndUpdate(
            { user: userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedDetails) {
            return NextResponse.json(
                { error: 'User details not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedDetails);
    } catch (error) {
        console.error('Error updating user details:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
