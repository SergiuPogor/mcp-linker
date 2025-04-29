import { Category } from "@/types";

export default function OtherPage({
  selectedCategory,
}: {
  selectedCategory: Category;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          {selectedCategory.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {selectedCategory.content}
        </p>
      </div>
    </div>
  );
}
