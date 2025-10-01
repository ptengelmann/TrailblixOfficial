// Development script to reset usage limits for testing
// Usage: node scripts/dev-reset-usage.js <email>

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function resetUsage(email) {
  try {
    console.log(`\n🔍 Looking up user: ${email}...`)

    // Get user
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching users:', authError.message)
      return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
      console.error(`❌ User not found: ${email}`)
      return
    }

    console.log(`✅ Found user: ${user.email} (${user.id})`)

    // Get current usage
    const periodStart = new Date()
    periodStart.setDate(1)
    periodStart.setHours(0, 0, 0, 0)

    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .gte('period_start', periodStart.toISOString())

    if (!usage || usage.length === 0) {
      console.log('ℹ️  No usage to reset')
      return
    }

    console.log('\n📊 Current usage:')
    usage.forEach(u => {
      console.log(`   ${u.resource_type}: ${u.usage_count}`)
    })

    // Delete usage records
    const { error: deleteError } = await supabase
      .from('user_usage')
      .delete()
      .eq('user_id', user.id)
      .gte('period_start', periodStart.toISOString())

    if (deleteError) {
      console.error('❌ Error resetting usage:', deleteError.message)
      return
    }

    console.log('\n✅ Usage reset successfully!')
    console.log('   All usage counters set to 0')
    console.log('   You can now test limits from scratch')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

const email = process.argv[2]

if (!email) {
  console.log('\n📖 Usage: node scripts/dev-reset-usage.js <email>')
  console.log('\n📝 Example: node scripts/dev-reset-usage.js cara.robinson0903@gmail.com')
  console.log('\n💡 This resets all usage counters for the current month')
  process.exit(1)
}

resetUsage(email)
