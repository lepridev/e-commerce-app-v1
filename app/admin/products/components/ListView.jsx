"use client";

import { useProducts } from "@/lib/firestore/products/read";
import { deleteProduct } from "@/lib/firestore/products/write";
import { Button, CircularProgress } from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ListView() {
  const [pageLimit, setPageLimit] = useState(10);
  const [lastSnapDocList, setLastSnapDocList] = useState([]);

  useEffect(() => {
    setLastSnapDocList([]);
  }, [pageLimit]);

  const {
    data: products,
    error,
    isLoading,
    lastSnapDoc,
  } = useProducts({
    pageLimit: pageLimit,
    lastSnapDoc:
      lastSnapDocList?.length === 0
        ? null
        : lastSnapDocList[lastSnapDocList?.length - 1],
  });

  const handleNextPage = () => {
    let newStack = [...lastSnapDocList];
    newStack.push(lastSnapDoc);
    setLastSnapDocList(newStack);
  };

  const handlePrePage = () => {
    let newStack = [...lastSnapDocList];
    newStack.pop();
    setLastSnapDocList(newStack);
  };

  if (isLoading) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }
  if (error) {
    return <div>{error}</div>;
  }
  return (
    <div className="flex-1 flex flex-col gap-3 md:pr-5 md:px-0 px-5 rounded-xl w-full overflow-x-auto">
      <table className="border-separate border-spacing-y-3">
        <thead>
          <tr>
            <th className="font-semibold border-y bg-white px-3 py-2 border-l rounded-l-lg">
              N° commande
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2">Image</th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Titre
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Prix
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Stock
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Commandes
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 text-left">
              Statut
            </th>
            <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products?.map((item, index) => {
            return (
              <Row
                index={index + lastSnapDocList?.length * pageLimit}
                item={item}
                key={`${item.id}-${index}`}
              />
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-between text-sm py-3">
        <Button
          isDisabled={isLoading || lastSnapDocList?.length === 0}
          onClick={handlePrePage}
          size="sm"
          variant="bordered"
        >
          Previous
        </Button>
        <select
          value={pageLimit}
          onChange={(e) => setPageLimit(e.target.value)}
          className="px-5 rounded-xl"
          name="perpage"
          id="perpage"
        >
          <option value={3}>3 Articles</option>
          <option value={5}>5 Articles</option>
          <option value={10}>10 Articles</option>
          <option value={20}>20 Articles</option>
          <option value={100}>100 Articles</option>
        </select>
        <Button
          isDisabled={isLoading || products?.length === 0}
          onClick={handleNextPage}
          size="sm"
          variant="bordered"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

function Row({ item, index }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;

    setIsDeleting(true);
    try {
      await deleteProduct({ id: item?.id });
      toast.success("Successfully Deleted");
    } catch (error) {
      toast.error(error?.message);
    }
    setIsDeleting(false);
  };

  const handleUpdate = () => {
    router.push(`/admin/products/form?id=${item?.id}`);
  };

  return (
    <tr>
      <td className="border-y bg-white px-3 py-2 border-l rounded-l-lg text-center">
        {index + 1}
      </td>
      <td className="border-y bg-white px-3 py-2 text-center">
        <div className="relative h-10 w-10 mx-auto">
          <Image
            src={item?.featureImage || "/placeholder.png"}
            alt={item?.title || "Image du produit"}
            fill
            objectFit="contain"
            className=" rounded"
            sizes="(max-width: 768px) 50px, 100px"
          />
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 whitespace-nowrap">
        {item?.title}{" "}
        {item?.isFeatured === true && (
          <span className="ml-2 bg-gradient-to-tr from-blue-500 to-indigo-400 text-white text-[10px] rounded-full px-3 py-1">
            En vedette
          </span>
        )}
      </td>
      <td className="border-y bg-white px-3 py-2  whitespace-nowrap">
        {item?.salePrice < item?.price && (
          <span className="text-xs text-gray-500 line-through">
            CFA {item?.price}
          </span>
        )}{" "}
        CFA {item?.salePrice}
      </td>
      <td className="border-y bg-white px-3 py-2">{item?.stock}</td>
      <td className="border-y bg-white px-3 py-2">{item?.orders ?? 0}</td>
      <td className="border-y bg-white px-3 py-2">
        <div className="flex">
          {item?.stock - (item?.orders ?? 0) > 0 && (
            <div className="px-2 py-1 text-xs text-green-500 bg-green-100 font-bold rounded-md">
              Disponible
            </div>
          )}
          {item?.stock - (item?.orders ?? 0) <= 0 && (
            <div className="px-2 py-1 text-xs text-red-500 bg-red-100 rounded-md">
              Rupture de stock
            </div>
          )}
        </div>
      </td>
      <td className="border-y bg-white px-3 py-2 border-r rounded-r-lg">
        <div className="flex gap-2 items-center">
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
