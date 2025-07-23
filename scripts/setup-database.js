
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

async function setupDatabase() {
  // Read environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('scripts/supabase-schema-fix.sql', 'utf8')
    
    // Split by statements and execute each one
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...')
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      })

      if (error) {
        console.warn('Warning:', error.message)
      } else {
        console.log('✅ Success')
      }
    }

    console.log('\n🎉 Database setup completed!')
    
  } catch (error) {
    console.error('Error setting up database:', error.message)
    process.exit(1)
  }
}

setupDatabase()
