import { NextResponse } from 'next/server';
import Device from '@/models/device';
import { connect } from '@/utils/connect';

export async function GET(request, { params }) {
  try {
    await connect();
    const device = await Device.findById(params.id).select('status firmware lastMaintenance');
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }
    return NextResponse.json(device);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
