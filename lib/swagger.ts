import {
  generateSchema,
  extendApi,
  extendZodWithOpenApi,
} from "@anatine/zod-openapi";
import { z } from "zod";
import * as schemas from "./validations";

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Create paths object to store all route documentation
export const paths: Record<string, any> = {};

// Create OpenAPI document
export const apiDocument = {
  openapi: "3.0.0",
  info: {
    title: "Mint API",
    version: "1.0.0",
    description: "API documentation for Mint application",
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
      description: "API Server",
    },
  ],
  paths,
  components: {
    schemas: Object.entries(schemas).reduce((acc, [name, schema]) => {
      if (name.endsWith("Schema")) {
        const schemaName = name.replace("Schema", "");
        const openApiSchema = generateSchema(schema);
        return {
          ...acc,
          [schemaName]: {
            ...openApiSchema,
            title: schemaName,
          },
        };
      }
      return acc;
    }, {}),
  },
};
