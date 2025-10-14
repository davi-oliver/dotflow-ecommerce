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
    <div className="mb-6 lg:mb-12">
      <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 scrollbar-hide lg:justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-red-600 text-white shadow-lg lg:shadow-xl transform lg:scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 lg:hover:bg-gray-300'
            }`}
          >
            <span className="text-sm lg:text-lg">{category.icon}</span>
            <span className="text-sm lg:text-base">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

