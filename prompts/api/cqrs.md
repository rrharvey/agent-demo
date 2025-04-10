# Simple CQRS

Add the necessary code to support a CQRS pattern in the API.

- Follow [Code Standards](code_standards.md)
- Add interfaces for commands, queries and handlers
- Do not use a mediator pattern. We will inject the handler interface directly.
- Use a convention to register all command and query handlers in the dependency injection container
- Do not use any external libraries
