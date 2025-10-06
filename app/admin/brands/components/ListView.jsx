"use client";

import { useBrands } from "@/lib/firestore/brands/read";
import { deleteBrand } from "@/lib/firestore/brands/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function ListView() {
  const { data: brands, error, isLoading } = useBrands();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center p-5">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl">
      <h1 className="text-xl">Marque</h1>
      <table className="border-separate border-spacing-y-3 w-full">
        <thead>
          <tr>
            <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">
              N° Commande
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2">Image</th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Nom
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {brands?.map((item, index) => (
            <Row
              key={item.id ?? `${item.name}-${index}`}
              item={item}
              index={index}
              router={router}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ item, index, router }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this brand?")) return;

    setIsDeleting(true);
    try {
      const result = await deleteBrand({ id: item?.id });
      if (result.error) throw new Error(result.error);

      toast.success("Brand deleted successfully");
      router.refresh(); // refresh la liste
    } catch (error) {
      toast.error(error.message || "Failed to delete brand");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = () => {
    router.push(`/admin/brands?id=${item?.id}`);
  };

  return (
    <tr>
      <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
        {index + 1}
      </td>
      <td className="border-y bg-white px-3 py-2 text-center">
        <div className="flex justify-center relative w-16 h-16">
          <Image
            src={item?.imageUrl || "/placeholder.png"}
            alt={item?.name || "Brand image"}
            width={64}
            height={64}
            className="object-cover rounded"
          />
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2">{item?.name}</td>
      <td className="border-y bg-white px-3 py-2 border-r rounded-r-lg">
        <div className="flex gap-2 items-center justify-center">
          <Button
            onClick={handleUpdate}
            isDisabled={isDeleting}
            isIconOnly
            size="sm"
          >
            <Edit2 size={13} />
          </Button>
          <Button
            onClick={handleDelete}
            isLoading={isDeleting}
            isDisabled={isDeleting}
            isIconOnly
            size="sm"
            color="danger"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
