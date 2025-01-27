import { NextResponse } from 'next/server';
import Device from '@/models/device';
import connect from '@/utils/connect';

export async function GET(request, { params }) {
  try {
    await connect();
    const device = await Device.findById(params.id);
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    return NextResponse.json(device);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connect();
    const data = await request.json();
    const device = await Device.findByIdAndUpdate(params.id, data, { new: true });
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    return NextResponse.json(device);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connect();
    const device = await Device.findByIdAndDelete(params.id);
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Device deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
