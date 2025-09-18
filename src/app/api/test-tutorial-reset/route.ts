import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    message: 'To reset tutorial: Open browser console and run: localStorage.removeItem("stackbill_tutorial_dismissed")',
    instructions: 'Then refresh the page to see the tutorial again.'
  })
}

export async function GET() {
  return NextResponse.json({
    message: 'To reset tutorial: Open browser console and run: localStorage.removeItem("stackbill_tutorial_dismissed")',
    instructions: 'Then refresh the page to see the tutorial again.'
  })
}