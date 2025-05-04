import useAppCategories from "@/components/categories";
import { useParams } from "react-router-dom";

export default function OtherPage() {
  const { categoryId } = useParams();
  const categories = useAppCategories();
  const category = categories.find((c) => c.id === categoryId) || categories[0];

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          {category.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{category.content}</p>
      </div>
    </div>
  );
}
