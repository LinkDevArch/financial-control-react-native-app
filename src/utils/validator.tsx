export class Validator {
  private value: string | number;
  private valid: boolean = true;

  constructor(value: string | number) {
    this.value = value;
  }

  notBlank() {
    if (this.value === "") {
      this.valid = false;
      console.log("no valido");
    }
    console.log("valido");

    return this; // SIEMPRE retorna this
  }

  minLength(n: number) {
    if (typeof this.value === "string" && this.value.length < n) this.valid = false;
    return this;
  }

  isValidAmount() {
    if (typeof this.value === "number" && this.value <= 0) this.valid = false;
    return this;
  }

  result() {
    console.log(this.valid);
    return this.valid;
  }
}