export class AuthTokenError extends Error {
  constructor() {
    // chama a classe pai (Error)
    super("Error with authentication token.");
  }
}
