"use client";

import { useSearchParams } from "next/navigation";
import Form from "./components/Form";
import ListView from "./components/ListView";
import EditBrandForm from "./EditBrandForm";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <main className="p-5 flex flex-col md:flex-row gap-5">
      {id ? <EditBrandForm brandId={id} /> : <Form />}
      <ListView />
    </main>
  );
}
