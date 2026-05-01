import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete all existing data
  await prisma.deal.deleteMany()
  await prisma.business.deleteMany()

  // Food category businesses
  const business1 = await prisma.business.create({
    data: {
      name: 'Restaurant Uno',
      slug: 'restaurant-uno',
      description: 'Italian restaurant',
      category: 'Food',
      subCategory: 'Restaurant',
    },
  })

  const business2 = await prisma.business.create({
    data: {
      name: 'Cafe Mio',
      slug: 'cafe-mio',
      description: 'Coffee shop',
      category: 'Food',
      subCategory: 'Cafe',
    },
  })

  const business3 = await prisma.business.create({
    data: {
      name: 'Bakery Gold',
      slug: 'bakery-gold',
      description: 'Fresh bakery',
      category: 'Food',
      subCategory: 'Bakery',
    },
  })

  const business4 = await prisma.business.create({
    data: {
      name: 'Restaurant Premium',
      slug: 'restaurant-premium',
      description: 'Premium dining',
      category: 'Food',
      subCategory: 'Restaurant',
    },
  })

  // Beauty & Health businesses
  const business5 = await prisma.business.create({
    data: {
      name: 'Hair Salon Lara',
      slug: 'hair-salon-lara',
      description: 'Hair salon',
      category: 'Beauty & Health',
      subCategory: 'Hair Salon',
    },
  })

  const business6 = await prisma.business.create({
    data: {
      name: 'Cosmetic Beauty',
      slug: 'cosmetic-beauty',
      description: 'Cosmetic services',
      category: 'Beauty & Health',
      subCategory: 'Cosmetic',
    },
  })

  const business7 = await prisma.business.create({
    data: {
      name: 'Hair Salon Style',
      slug: 'hair-salon-style',
      description: 'Styling services',
      category: 'Beauty & Health',
      subCategory: 'Hair Salon',
    },
  })

  const business8 = await prisma.business.create({
    data: {
      name: 'Fitness Power',
      slug: 'fitness-power',
      description: 'Gym',
      category: 'Beauty & Health',
      subCategory: 'Fitness',
    },
  })

  const business9 = await prisma.business.create({
    data: {
      name: 'Beauty Premium',
      slug: 'beauty-premium',
      description: 'Premium beauty',
      category: 'Beauty & Health',
      subCategory: 'Cosmetic',
    },
  })

  // Services businesses
  const business10 = await prisma.business.create({
    data: {
      name: 'Cinar Cleaning',
      slug: 'cinar-cleaning',
      description: 'Cleaning services',
      category: 'Services',
      subCategory: 'Cleaning',
    },
  })

  const business11 = await prisma.business.create({
    data: {
      name: 'Transport Express',
      slug: 'transport-express',
      description: 'Transport services',
      category: 'Services',
      subCategory: 'Transport',
    },
  })

  const business12 = await prisma.business.create({
    data: {
      name: 'Consulting Pro',
      slug: 'consulting-pro',
      description: 'Consulting services',
      category: 'Services',
      subCategory: 'Consulting',
    },
  })

  // Create deals for each business
  // Food deals
  await prisma.deal.create({
    data: {
      title: 'Lunch Special',
      description: 'Get 20% off lunch menu',
      discountText: '20% OFF',
      category: 'Food',
      subCategory: 'Restaurant',
      isPremium: false,
      businessId: business1.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'Coffee Combo',
      description: 'Coffee + pastry deal',
      discountText: '€5 combo',
      category: 'Food',
      subCategory: 'Cafe',
      isPremium: false,
      businessId: business2.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'Bread Pack',
      description: 'Buy 2 get 1 free',
      discountText: 'B2G1',
      category: 'Food',
      subCategory: 'Bakery',
      isPremium: false,
      businessId: business3.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'VIP Dinner',
      description: 'Premium dinner experience',
      discountText: 'Free dessert',
      category: 'Food',
      subCategory: 'Restaurant',
      isPremium: true,
      businessId: business4.id,
    },
  })

  // Beauty & Health deals
  await prisma.deal.create({
    data: {
      title: 'Haircut Deal',
      description: '50% off on haircuts',
      discountText: '50% OFF',
      category: 'Beauty & Health',
      subCategory: 'Hair Salon',
      isPremium: false,
      businessId: business5.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'Facial Special',
      description: 'Full facial treatment',
      discountText: '€30',
      category: 'Beauty & Health',
      subCategory: 'Cosmetic',
      isPremium: false,
      businessId: business6.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'Styling Package',
      description: 'Full styling service',
      discountText: '15% OFF',
      category: 'Beauty & Health',
      subCategory: 'Hair Salon',
      isPremium: false,
      businessId: business7.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'Gym Day Pass',
      description: 'Full day access',
      discountText: '€15',
      category: 'Beauty & Health',
      subCategory: 'Fitness',
      isPremium: false,
      businessId: business8.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'Premium Beauty',
      description: 'Luxury beauty package',
      discountText: 'VIP treatment',
      category: 'Beauty & Health',
      subCategory: 'Cosmetic',
      isPremium: true,
      businessId: business9.id,
    },
  })

  // Services deals
  await prisma.deal.create({
    data: {
      title: 'Home Cleaning',
      description: 'Full home cleaning',
      discountText: '€50 off',
      category: 'Services',
      subCategory: 'Cleaning',
      isPremium: false,
      businessId: business10.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'Delivery Special',
      description: 'Free delivery',
      discountText: 'FREE',
      category: 'Services',
      subCategory: 'Transport',
      isPremium: false,
      businessId: business11.id,
    },
  })

  await prisma.deal.create({
    data: {
      title: 'Consultation VIP',
      description: 'Premium consulting',
      discountText: 'First hour free',
      category: 'Services',
      subCategory: 'Consulting',
      isPremium: true,
      businessId: business12.id,
    },
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })