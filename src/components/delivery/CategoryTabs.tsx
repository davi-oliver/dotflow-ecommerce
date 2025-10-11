'use client';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryTabs({ categories, selectedCategory, onCategorySelect }: CategoryTabsProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? 'bg-red-600 text-white shadow-lg transform scale-105'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

