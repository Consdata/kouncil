export class RandomUtils {

  private static createRandomIban(): string {
    let iban;
    let pruef;
    const ktnr = (Math.round(Math.random() * 8999999) + 1000000);
    pruef = ((ktnr * 1000000) + 43);
    const pruef2 = pruef % 97;
    pruef = 98 - pruef2;
    if (pruef > 9) {
      iban = 'DE';
    } else {
      iban = 'DE0';
    }
    return iban + pruef + '70050000' + '000' + ktnr;
  }

  public static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public static formatAmount(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  public static randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  public static createRandomEvent(): string {
    const today = new Date();
    const nextDay = new Date();
    nextDay.setDate(today.getDate() + 3);
    return `{
      "source_account": "${RandomUtils.createRandomIban()}",
      "dst_account": "${RandomUtils.createRandomIban()}",
      "currency": "EUR",
      "amount": "${RandomUtils.formatAmount(RandomUtils.randomInt(100, 10000000))}",
      "transaction_date": "${RandomUtils.randomDate(today, nextDay).toLocaleDateString()}"
      }
    `;
  }
}
