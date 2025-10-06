"use client";

import Form from "./components/Form";
import ListView from "./components/ListView";
// import EditForm from "./components/EditForm";
import { useSearchParams } from "next/navigation";
import EditForm from "./EditForm";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <main className="p-5 flex flex-col md:flex-row gap-5">
      {id ? <EditForm id={id} /> : <Form />}
      <ListView />
    </main>
  );
}
