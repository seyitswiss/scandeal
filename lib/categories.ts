export const categories = [
  {
    name: 'Beauty & Health',
    subCategories: ['Hair Salon', 'Cosmetic', 'Fitness', 'Spa', 'Nail Salon'],
  },
  {
    name: 'Food',
    subCategories: ['Restaurant', 'Cafe', 'Takeaway', 'Bakery', 'Fast Food'],
  },
  {
    name: 'Services',
    subCategories: ['Cleaning', 'Repair', 'Transport', 'Photography', 'Consulting'],
  },
  {
    name: 'Shopping',
    subCategories: ['Clothing', 'Electronics', 'Furniture', 'Jewelry', 'Books'],
  },
  {
    name: 'Entertainment',
    subCategories: ['Cinema', 'Theater', 'Concert', 'Museum', 'Bowling'],
  },
  {
    name: 'Education',
    subCategories: ['Language School', 'Music School', 'Driving School', 'Tutoring'],
  },
] as const

export type Category = (typeof categories)[number]['name']
export type SubCategory = (typeof categories)[number]['subCategories'][number]