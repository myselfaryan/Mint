"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./swagger.css";
import { apiDocument } from "@/lib/swagger/index";

export default function ApiDocs() {
  return (
    <div className="swagger-ui-container">
      <SwaggerUI spec={apiDocument} />
    </div>
  );
}
