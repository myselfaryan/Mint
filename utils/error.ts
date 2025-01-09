export const formatValidationErrors = (errorData: any) => {
  if (errorData?.errors && Array.isArray(errorData.errors)) {
    return errorData.errors
      .map((err: any) => {
        const field = err.path?.[0] ? `${err.path[0]}: ` : "";
        return `${field}${err.message}`;
      })
      .join("\n");
  }
  return "Unknown error occurred";
};
