# Simple CQRS

Add the necessary code to support a CQRS pattern in the API.

- Follow [Code Standards](code_standards.md)
- Add interfaces for commands, queries and handlers
  - Add a command interface the does not return a result
  - Add a command interface that returns a result
  - Add a query interface that returns has parameters and returns a result
  - Add a query interface that returns a result
  - Add a handler interface for each of the above interfaces
- Do not use a mediator pattern. We will inject the handler interface directly.
- Use a convention to register all command and query handlers in the dependency injection container
- Do not use any external libraries
