// Development script to upgrade a user to Pro
// Usage: node scripts/dev-upgrade-to-pro.js <email>

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function upgradeToPro(email) {
  try {
    console.log(`\n🔍 Looking up user: ${email}...`)

    // Get user by email
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (userError || !users) {
      // Try alternative query
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        console.error('❌ Error fetching users:', authError.message)
        return
      }

      const user = authUsers.find(u => u.email === email)

      if (!user) {
        console.error(`❌ User not found: ${email}`)
        console.log('\n💡 Available users:')
        authUsers.forEach(u => console.log(`   - ${u.email} (${u.id})`))
        return
      }

      console.log(`✅ Found user: ${user.email} (${user.id})`)

      // Upgrade to Pro
      const { error: upsertError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: 'pro',
          status: 'active',
          billing_period: 'monthly',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          trial_start: null,
          trial_end: null,
          metadata: { dev_upgrade: true }
        })

      if (upsertError) {
        console.error('❌ Error upgrading user:', upsertError.message)
        return
      }

      console.log('✅ User upgraded to Pro!')
      console.log('📊 Subscription details:')
      console.log('   Plan: Pro')
      console.log('   Status: Active')
      console.log('   Billing: Monthly (Dev - no charges)')
      console.log('   Expires: 1 year from now')
      console.log('   Limits: Unlimited AI insights, all Pro features')

      // Log the upgrade event
      await supabase.from('subscription_events').insert({
        user_id: user.id,
        event_type: 'upgraded',
        old_plan_id: 'free',
        new_plan_id: 'pro',
        metadata: { source: 'dev_script' }
      })

      console.log('\n✨ You can now test all Pro features!')
      return
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.log('\n📖 Usage: node scripts/dev-upgrade-to-pro.js <email>')
  console.log('\n📝 Example: node scripts/dev-upgrade-to-pro.js cara.robinson0903@gmail.com')
  console.log('\n⚠️  Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

upgradeToPro(email)
