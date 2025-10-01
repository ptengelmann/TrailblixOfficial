// Development script to check user subscription status
// Usage: node scripts/dev-check-subscription.js <email>

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSubscription(email) {
  try {
    console.log(`\n🔍 Checking subscription for: ${email}...`)

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

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .single()

    if (subError) {
      console.log('\n⚠️  No subscription found - user will get Free plan by default')
      return
    }

    console.log('\n📊 Subscription Status:')
    console.log(`   Plan: ${subscription.plan_id.toUpperCase()}`)
    console.log(`   Status: ${subscription.status}`)
    console.log(`   Billing: ${subscription.billing_period || 'N/A'}`)

    if (subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end)
      const now = new Date()
      const isTrialing = trialEnd > now
      console.log(`   Trial: ${isTrialing ? 'Active' : 'Ended'} (ends ${trialEnd.toLocaleDateString()})`)
    }

    if (subscription.current_period_end) {
      console.log(`   Period End: ${new Date(subscription.current_period_end).toLocaleDateString()}`)
    }

    // Get usage stats
    const periodStart = new Date()
    periodStart.setDate(1)
    periodStart.setHours(0, 0, 0, 0)

    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .gte('period_start', periodStart.toISOString())

    console.log('\n📈 Current Usage (this month):')
    if (!usage || usage.length === 0) {
      console.log('   No usage recorded yet')
    } else {
      usage.forEach(u => {
        console.log(`   ${u.resource_type}: ${u.usage_count}`)
      })
    }

    // Show limits
    if (subscription.subscription_plans) {
      console.log('\n🚦 Limits:')
      const limits = subscription.subscription_plans.limits
      console.log(`   AI Insights: ${limits.ai_insights_per_month === -1 ? 'Unlimited' : limits.ai_insights_per_month + '/month'}`)
      console.log(`   Career Predictions: ${limits.career_predictions ? 'Yes' : 'No'}`)
      console.log(`   Skills Analysis: ${limits.skills_gap_analysis ? 'Yes' : 'No'}`)
      console.log(`   Daily Tasks: ${limits.daily_tasks ? 'Yes' : 'No'}`)
      console.log(`   Networking Tracker: ${limits.networking_tracker}`)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

const email = process.argv[2]

if (!email) {
  console.log('\n📖 Usage: node scripts/dev-check-subscription.js <email>')
  console.log('\n📝 Example: node scripts/dev-check-subscription.js cara.robinson0903@gmail.com')
  process.exit(1)
}

checkSubscription(email)
