// Basic edge function entrypoint for Vietnamese Laptop Repair Shop
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { method, url } = req
  const pathname = new URL(url).pathname

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  }

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Basic health check endpoint
    if (pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'Vietnamese Laptop Repair Shop Edge Functions',
          timestamp: new Date().toISOString()
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200,
        }
      )
    }

    // Default response
    return new Response(
      JSON.stringify({
        message: 'Vietnamese Laptop Repair Shop Edge Functions',
        available_endpoints: ['/health'],
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500,
      }
    )
  }
})