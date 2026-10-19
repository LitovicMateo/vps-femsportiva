import Header from "./Header";
import { fetchCategories } from "@/lib/wordpress";

const EXCLUDED_SLUGS = new Set(["uncategorized", "nekategorizirano"]);

export default async function HeaderWrapper() {
  const categories = await fetchCategories();

  const categoriesData = categories
    .filter((cat) => !EXCLUDED_SLUGS.has(cat.slug))
    .map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
    }));

  return <Header categories={categoriesData} />;
}
