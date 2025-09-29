// Database Verification API - Check if advanced intelligence tables are set up correctly
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TableInfo {
  table_name: string
  exists: boolean
  row_count: number
  sample_data?: any[]
}

interface DatabaseStatus {
  total_tables_expected: number
  total_tables_found: number
  all_tables_present: boolean
  tables: TableInfo[]
  sample_data_present: boolean
  database_ready: boolean
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DatabaseStatus | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // List of expected tables for the advanced intelligence system
    const expectedTables = [
      'market_intelligence_cache',
      'career_predictions',
      'career_progression_patterns',
      'market_trends',
      'skills_intelligence',
      'job_market_analytics',
      'salary_benchmarks',
      'career_intelligence_reports',
      'market_intelligence_subscriptions',
      'prediction_accuracy_tracking'
    ]

    const tableResults: TableInfo[] = []
    let totalTablesFound = 0
    let sampleDataPresent = false

    // Check each table
    for (const tableName of expectedTables) {
      try {
        // Check if table exists and get row count
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (error) {
          // Table doesn't exist or has permission issues
          tableResults.push({
            table_name: tableName,
            exists: false,
            row_count: 0
          })
        } else {
          // Table exists
          totalTablesFound++
          const rowCount = count || 0

          // Get sample data for verification (limit to 3 rows)
          let sampleData = undefined
          if (rowCount > 0) {
            const { data: samples } = await supabase
              .from(tableName)
              .select('*')
              .limit(3)

            sampleData = samples || undefined
            if (samples && samples.length > 0) {
              sampleDataPresent = true
            }
          }

          tableResults.push({
            table_name: tableName,
            exists: true,
            row_count: rowCount,
            sample_data: sampleData
          })
        }
      } catch (tableError) {
        tableResults.push({
          table_name: tableName,
          exists: false,
          row_count: 0
        })
      }
    }

    // Check if specific sample data exists (skills_intelligence should have our test data)
    const skillsTable = tableResults.find(t => t.table_name === 'skills_intelligence')
    const hasExpectedSkills = skillsTable?.sample_data?.some(
      skill => skill.skill_name === 'Python' || skill.skill_name === 'Machine Learning'
    ) || false

    const databaseStatus: DatabaseStatus = {
      total_tables_expected: expectedTables.length,
      total_tables_found: totalTablesFound,
      all_tables_present: totalTablesFound === expectedTables.length,
      tables: tableResults,
      sample_data_present: sampleDataPresent && hasExpectedSkills,
      database_ready: totalTablesFound === expectedTables.length && sampleDataPresent && hasExpectedSkills
    }

    return res.status(200).json(databaseStatus)

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Database verification failed:', errorMessage)

    return res.status(500).json({
      error: 'Failed to verify database setup',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    } as any)
  }
}