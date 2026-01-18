import Header from "./Header";
import { fetchCategories } from "@/lib/wordpress";

export default async function HeaderWrapper() {
  const categories = await fetchCategories();

  // Transform to match Header interface
  const categoriesData = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    count: cat.count,
  }));

  return <Header categories={categoriesData} />;
}
