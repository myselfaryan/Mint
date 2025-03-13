"use client";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

type Props = {
  spec: Record<string, any>;
};

function ReactSwagger({ spec }: Props) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-react@5.20.1/swagger-ui.css"
      />
      <SwaggerUI spec={spec} />
    </>
  );
}

export default ReactSwagger;
