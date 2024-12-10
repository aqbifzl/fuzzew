export class ValidationError extends Error {
  constructor(prop: string) {
    super(prop);
    this.name = "PropertyRequiredError";
  }
}
