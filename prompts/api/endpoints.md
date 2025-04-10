# API Endpoints

Add endpoints for a feature (string).

- Add a class that inherits from EndpointGroupBase for the feature
- Create the endpoint class in the feature folder
- Register endpoints for all commands and queries in the feature
- Document each endpoint with OpenAPI
  - Endpoints that return a result should be documented using the Produces<T> method
