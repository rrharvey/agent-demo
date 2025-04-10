# Add Client API Layer

Add a client side API layer to the application in packages/app that matches the specification in api_openapi.json.

- Install @tanstack/react-query, @tanstack/react-query-devtools, zod, and ky
  - Use the package manager specified in package.json if one exists
  - If no package manager is specified in package.json, look for lock files to determine the package manager
  - If no lock files are found, use npm
- Place all generated code in an api folder
  - Do not create additional folders inside the api folder
  - Use file names with same style and case consistent with the rest of the project
- Use [React Query](https://tanstack.com/query/latest/docs/framework/react/overview) for data fetching and caching
  - Generate [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) for each of the endpoints in the API specification
    - Do not create custom hooks to wrap each API call
    - Query options should be strongly typed for TypeScript using the queryOptions function from @tanstack/react-query
  - Use ky for all HTTP requests
    - The only option specified for ky is the base path
  - Generate query keys using the [Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys) pattern
  - Use the [Zod](https://zod.dev/) library for all request and response body validation
    - Use upper camel case for all Zod schemas and their infered types
  - Use the [React Query Devtools](https://tanstack.com/queryu/latest/docs/framework/react/devtools) for debugging
