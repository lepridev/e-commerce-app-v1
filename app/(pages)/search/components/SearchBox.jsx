"use client";

import { Button } from "@nextui-org/react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const router = useRouter();

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setIsLoading(true);
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);

    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            type="text"
            className="w-full pl-12 pr-32 py-4 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg shadow-sm"
            required
            disabled={isLoading}
          />
          <Button
            type="submit"
            color="primary"
            isLoading={isLoading}
            disabled={!query.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-3 min-w-20 font-medium rounded-xl"
          >
            {isLoading ? "" : "Go"}
          </Button>
        </div>
      </form>
      <p className="text-center text-gray-500 text-sm mt-3">
        Recherchez par nom, catégorie ou description
      </p>
    </div>
  );
}
