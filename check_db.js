
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Try to read .env file
try {
    const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env')))
    for (const k in envConfig) {
        process.env[k] = envConfig[k]
    }
} catch (e) {
    console.log('No .env file found or error reading it')
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkColumns() {
    console.log('Checking columns for test_attempts...')

    // We can't easily query information_schema with supabase-js client usually, 
    // but we can try to select * from test_attempts limit 1 and see what we get, 
    // or try to insert a dummy row and see errors.

    // Better yet, let's try to select specific columns and see if it errors.

    const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error selecting *:', error)
    } else {
        console.log('Select * successful. Data:', data)
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]))
        } else {
            console.log('Table is empty, cannot infer columns from data.')
        }
    }

    // Check specifically for skill_id
    const { error: skillError } = await supabase
        .from('test_attempts')
        .select('skill_id')
        .limit(1)

    if (skillError) {
        console.log('skill_id column check failed:', skillError.message)
    } else {
        console.log('skill_id column exists.')
    }

    // Check specifically for attempt_date
    const { error: dateError } = await supabase
        .from('test_attempts')
        .select('attempt_date')
        .limit(1)

    if (dateError) {
        console.log('attempt_date column check failed:', dateError.message)
    } else {
        console.log('attempt_date column exists.')
    }

    // Check specifically for created_at
    const { error: createdError } = await supabase
        .from('test_attempts')
        .select('created_at')
        .limit(1)

    if (createdError) {
        console.log('created_at column check failed:', createdError.message)
    } else {
        console.log('created_at column exists.')
    }
}

checkColumns()
