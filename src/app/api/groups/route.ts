import { NextResponse } from 'next/server';
import { client } from '@/lib/observation-client';

export async function GET() {
  try {
    const groups = await client.groups();
    const groupsData = await groups.list();
    return NextResponse.json(groupsData);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}
