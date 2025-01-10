// Using native fetch in Node.js
async function triggerMigration() {
  try {
    console.log('Starting migration...')
    
    const response = await fetch('http://localhost:3000/api/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Migration response:', data)

    if (data.success) {
      console.log('✅ Migration completed successfully!')
    } else {
      console.error('❌ Migration failed:', data.error)
    }
  } catch (error) {
    console.error('❌ Error during migration:', error.message)
  }
}

// Execute the migration
await triggerMigration()