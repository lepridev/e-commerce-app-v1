"use client";

import Form from "./components/Form";
import ListView from "./components/ListView";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <main className="p-5 flex flex-col md:flex-row gap-5">
      <Form id={id} />
      <ListView />
    </main>
  );
}
