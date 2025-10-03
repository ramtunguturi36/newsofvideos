const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const connectDb = require('../src/utils/db')
const User = require('../src/models/User')

dotenv.config()

async function run() {
  try {
    await connectDb()
    const email = 'admin@vedit.com'
    const existing = await User.findOne({ email })
    if (existing) {
      console.log('Admin already exists')
      process.exit(0)
    }
    const passwordHash = await bcrypt.hash('admin123', 10)
    await User.create({ name: 'Admin', email, passwordHash, role: 'admin' })
    console.log('Admin user created: admin@vedit.com / admin123')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()


