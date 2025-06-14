// Ref class (used to convert outline references)
export class Ref {
  num: number;
  gen: number;

  constructor({ num, gen }: { num: number; gen: number }) {
    this.num = num;
    this.gen = gen;
  }

  toString() {
    return `${this.num}R${this.gen !== 0 ? this.gen : ""}`;
  }
}
