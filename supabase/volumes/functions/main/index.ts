// Supabase Edge Functions Main Entry Point
// This is a basic entry point for the edge functions runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { method, url } = req
  const { pathname } = new URL(url)

  // Basic health check endpoint
  if (pathname === "/health" || pathname === "/") {
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Edge Functions runtime is healthy",
        timestamp: new Date().toISOString()
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    )
  }

  // Default response for unknown endpoints
  return new Response(
    JSON.stringify({
      error: "Function not found",
      path: pathname,
      method: method
    }),
    {
      headers: { "Content-Type": "application/json" },
      status: 404,
    }
  )
})