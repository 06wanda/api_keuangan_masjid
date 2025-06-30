const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

async function main() {
  const masjid = await prisma.masjid.create({
    data: {
      nama_masjid: 'Masjid Hidayatul Muslimin',
      alamat_masjid: 'Jl. Contoh No. 123'
    }
  })

  const hashPassword = await bcrypt.hash('wanda13', 10)

  await prisma.users.create({
    data: {
      username: 'wanda13',
      password: hashPassword,
      must_change_password: false,
      role: 'admin',
      id_masjid: masjid.id_masjid
    }
  })
}
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
