"use client";

import { useCategories } from "@/lib/firestore/categories/read";
import { deleteCategory } from "@/lib/firestore/categories/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ListView() {
  const { data: categories, error, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <CircularProgress />
        <span className="ml-2">Chargement des catégories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        Erreur de chargement: {error}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-3 p-5">
        <h1 className="text-xl font-semibold">Catégories</h1>
        <div className="text-center py-8 text-gray-500">
          Aucune catégorie trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl">
      <h1 className="text-xl font-semibold">Catégories</h1>
      <table className="border-separate border-spacing-y-3 w-full">
        <thead>
          <tr>
            <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">
              N°
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2">Image</th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Nom
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Slug
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((item, index) => (
            <Row key={item.id} item={item} index={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ item, index }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?"))
      return;

    setIsDeleting(true);
    try {
      console.log("🗑️ Suppression de la catégorie:", item.id);

      const result = await deleteCategory({ id: item.id });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("✅ Catégorie supprimée avec succès");
      router.refresh();
    } catch (error) {
      console.error("❌ Erreur de suppression:", error);
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = () => {
    router.push(`/admin/categories?id=${item.id}`);
  };

  return (
    <tr>
      <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
        {index + 1}
      </td>
      <td className="border-y bg-white px-3 py-2 text-center">
        <div className="flex justify-center">
          <div className="relative w-12 h-12">
            <Image
              src={item?.imageUrl || "/placeholder.png"}
              alt={item?.name || "Image de catégorie"}
              fill
              className="object-cover rounded"
              sizes="48px"
            />
          </div>
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 font-medium">{item?.name}</td>
      <td className="border-y bg-white px-3 py-2 text-gray-600 text-sm">
        {item?.slug}
      </td>
      <td className="border-y bg-white px-3 py-2 border-r rounded-r-lg">
        <div className="flex gap-2 items-center justify-center">
          <Button
            onClick={handleUpdate}
            isDisabled={isDeleting}
            isIconOnly
            size="sm"
            color="primary"
            variant="flat"
          >
            <Edit2 size={14} />
          </Button>
          <Button
            onClick={handleDelete}
            isLoading={isDeleting}
            isDisabled={isDeleting}
            isIconOnly
            size="sm"
            color="danger"
            variant="flat"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
