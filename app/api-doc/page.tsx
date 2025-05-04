import { apiDocument } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";
import { Suspense } from "react";

export default async function ApiDoc() {
  return (
    <section className="container mx-auto p-4">
      <Suspense fallback={<div>Loading API documentation...</div>}>
        <ReactSwagger spec={apiDocument} />
      </Suspense>
    </section>
  );
}
