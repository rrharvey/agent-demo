# Command

Create a command for a feature (string) in the API with a specific name (string).

- Create a file to contain the use case in the feature folder
- Create a command DTO in the new file
  - If the command includes optional parameters, use a nullable type and implement the default value in the handler
- Create a handler class in the new file
- Never return a list or array. Always wrap lists or arrays in an object.
- Follow [Code Standards](code_standards.md)
