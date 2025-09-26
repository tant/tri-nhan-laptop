import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  password: string
  full_name: string
  role: 'shop_owner' | 'staff'
  phone?: string
}

interface UpdateUserRequest {
  user_id: string
  updates: {
    email?: string
    password?: string
    full_name?: string
    phone?: string
    role?: 'shop_owner' | 'staff'
    is_active?: boolean
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has admin permissions
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !profile.is_active || profile.role !== 'shop_owner') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only shop owners can manage users.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const url = new URL(req.url)
    const method = req.method

    // Handle different endpoints
    if (method === 'POST' && url.pathname.endsWith('/admin-user-management')) {
      // Create new user
      const requestData: CreateUserRequest = await req.json()
      
      // Validate required fields
      if (!requestData.email || !requestData.password || !requestData.full_name) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: email, password, full_name' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create auth user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: requestData.email,
        password: requestData.password,
        email_confirm: true,
        user_metadata: {
          full_name: requestData.full_name,
          role: requestData.role || 'staff'
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        return new Response(
          JSON.stringify({ error: authError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Update user profile with additional info
      if (authData.user && requestData.phone) {
        const { error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({
            phone: requestData.phone,
            full_name: requestData.full_name,
            role: requestData.role || 'staff'
          })
          .eq('id', authData.user.id)

        if (updateError) {
          console.warn('Profile update warning:', updateError)
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: {
            id: authData.user?.id,
            email: authData.user?.email,
            created_at: authData.user?.created_at
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (method === 'PUT' && url.pathname.includes('/admin-user-management/')) {
      // Update existing user
      const requestData: UpdateUserRequest = await req.json()
      
      if (!requestData.user_id) {
        return new Response(
          JSON.stringify({ error: 'Missing user_id' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Update auth user if password or email is being changed
      if (requestData.updates.password || requestData.updates.email) {
        const authUpdates: any = {}
        if (requestData.updates.password) authUpdates.password = requestData.updates.password
        if (requestData.updates.email) authUpdates.email = requestData.updates.email

        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
          requestData.user_id,
          authUpdates
        )

        if (authUpdateError) {
          return new Response(
            JSON.stringify({ error: authUpdateError.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
      }

      // Update user profile
      const profileUpdates: any = {}
      if (requestData.updates.full_name) profileUpdates.full_name = requestData.updates.full_name
      if (requestData.updates.phone !== undefined) profileUpdates.phone = requestData.updates.phone
      if (requestData.updates.role) profileUpdates.role = requestData.updates.role
      if (requestData.updates.is_active !== undefined) profileUpdates.is_active = requestData.updates.is_active

      if (Object.keys(profileUpdates).length > 0) {
        const { data, error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', requestData.user_id)
          .select()
          .single()

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, profile: data }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'No updates to apply' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (method === 'POST' && url.pathname.includes('/reset-password')) {
      // Reset user password
      const { user_id, new_password } = await req.json()
      
      if (!user_id || !new_password) {
        return new Response(
          JSON.stringify({ error: 'Missing user_id or new_password' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { password: new_password }
      )

      if (resetError) {
        return new Response(
          JSON.stringify({ error: resetError.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Password reset successfully' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Method not allowed
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})