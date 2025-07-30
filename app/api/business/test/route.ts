import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = createClient();

    // Test database connection
    const { data, error } = await supabase
      .from('business_profiles')
      .select('id, business_name')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Business API test successful",
      data 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}