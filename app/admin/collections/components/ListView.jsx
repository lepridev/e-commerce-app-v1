"use client";

import { useCollections } from "@/lib/firestore/collections/read";
import { deleteCollection } from "@/lib/firestore/collections/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ListView() {
  const { data: collections, error, isLoading } = useCollections();

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <CircularProgress />
        <span className="ml-2">Chargement des collections...</span>
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

  if (!collections || collections.length === 0) {
    return (
      <div className="flex-1 flex flex-col gap-3 p-5">
        <h1 className="text-xl font-semibold">Collections</h1>
        <div className="text-center py-8 text-gray-500">
          Aucune collection trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl">
      <h1 className="text-xl font-semibold">Collections</h1>
      <table className="border-separate border-spacing-y-3 w-full">
        <thead>
          <tr>
            <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">
              N°
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2">Image</th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Titre
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Sous-titre
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Produits
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {collections?.map((item, index) => (
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette collection ?"))
      return;

    setIsDeleting(true);
    try {
      console.log("🗑️ Suppression de la collection:", item.id);

      const result = await deleteCollection({ id: item.id });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("✅ Collection supprimée avec succès");
      router.refresh();
    } catch (error) {
      console.error("❌ Erreur de suppression:", error);
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = () => {
    router.push(`/admin/collections?id=${item.id}`);
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
              alt={item?.title || "Image de collection"}
              fill
              className="object-cover rounded"
              sizes="48px"
            />
          </div>
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 font-medium">{item?.title}</td>
      <td className="border-y bg-white px-3 py-2 text-gray-600 text-sm">
        {item?.subTitle || "-"}
      </td>
      <td className="border-y bg-white px-3 py-2 text-center">
        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
          {item?.products?.length || 0}
        </span>
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
