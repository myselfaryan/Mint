import { generateSchema } from "@anatine/zod-openapi";
import { paths } from "../swagger";
import { z } from "zod";

type HttpMethod = "get" | "post" | "put" | "delete" | "patch";

interface Parameter {
  name: string;
  in: "path" | "query";
  required: boolean;
  schema: any; // OpenAPI schema
}

interface RouteDocConfig {
  method: HttpMethod;
  path: string;
  summary: string;
  description?: string;
  request?: {
    body?: z.ZodType;
    query?: z.ZodType;
    params?: z.ZodType;
  };
  responses: {
    [statusCode: string]: {
      description: string;
      schema?: z.ZodType;
    };
  };
  tags?: string[];
}

export function documentRoute(config: RouteDocConfig) {
  const {
    method,
    path,
    summary,
    description,
    request,
    responses,
    tags = [],
  } = config;

  // Create path parameters array if they exist
  const parameters: Parameter[] = [];
  if (request?.params) {
    const paramsSchema = generateSchema(request.params);
    Object.entries(paramsSchema.properties || {}).forEach(([name, schema]) => {
      parameters.push({
        name,
        in: "path",
        required: true,
        schema,
      });
    });
  }

  // Add query parameters if they exist
  if (request?.query) {
    const querySchema = generateSchema(request.query);
    Object.entries(querySchema.properties || {}).forEach(([name, schema]) => {
      parameters.push({
        name,
        in: "query",
        required: querySchema.required?.includes(name) || false,
        schema,
      });
    });
  }

  // Create the path documentation
  const pathDoc = {
    [method]: {
      summary,
      description,
      tags,
      parameters,
      ...(request?.body && {
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: generateSchema(request.body),
              example: generateExample(request.body),
            },
          },
        },
      }),
      responses: Object.entries(responses).reduce(
        (acc, [status, { description, schema }]) => ({
          ...acc,
          [status]: {
            description,
            ...(schema && {
              content: {
                "application/json": {
                  schema: generateSchema(schema),
                  example: generateExample(schema),
                },
              },
            }),
          },
        }),
        {},
      ),
    },
  };

  // Add or merge the path documentation
  if (paths[path]) {
    paths[path] = { ...paths[path], ...pathDoc };
  } else {
    paths[path] = pathDoc;
  }
}

// Helper function to generate example from schema
function generateExample(schema: z.ZodType): any {
  const openApiSchema = generateSchema(schema);
  if (!openApiSchema) return undefined;

  // If schema has example property, use it
  if (openApiSchema.example) return openApiSchema.example;

  // If schema has properties, generate example for each property
  if (openApiSchema.properties) {
    const example: Record<string, any> = {};
    Object.entries(openApiSchema.properties).forEach(
      ([key, prop]: [string, any]) => {
        if (prop.example) {
          example[key] = prop.example;
        } else if (prop.type === "string") {
          example[key] =
            prop.format === "email" ? "user@example.com" : "string";
        } else if (prop.type === "number") {
          example[key] = 0;
        } else if (prop.type === "boolean") {
          example[key] = false;
        } else if (prop.type === "array") {
          example[key] = [];
        } else if (prop.type === "object" && schema instanceof z.ZodObject) {
          example[key] = generateExample(schema._def.shape()[key]);
        }
      },
    );
    return example;
  }

  return undefined;
}
