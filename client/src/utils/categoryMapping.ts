// Category mapping for filtering
export const categoryMapping: Record<string, string[]> = {
  'Power & Charging': [
    'Power Banks',
    'Wall Chargers', 
    'Wireless Chargers',
    'Car Chargers',
    'Charging Cables'
  ],
  'Audio & Sound': [
    'Earphones & AirPods',
    'Headphones & Headsets',
    'Bluetooth Speakers'
  ],
  'Phone Protection': [
    'Screen Protectors',
    'Phone Covers & Cases'
  ],
  'Storage & Connectivity': [
    'Flash Drives',
    'Memory Cards',
    'OTG & Adapters'
  ]
};

// Helper function to get subcategories for a main category
export const getSubcategories = (mainCategory: string): string[] => {
  return categoryMapping[mainCategory] || [];
};

// Helper function to get main category from subcategory
export const getMainCategory = (subcategory: string): string | null => {
  for (const [mainCat, subCats] of Object.entries(categoryMapping)) {
    if (subCats.includes(subcategory)) {
      return mainCat;
    }
  }
  return null;
};
