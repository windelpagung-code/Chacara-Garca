const UNITS = [
  "", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
];
const TENS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const HUNDREDS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function below1000(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  let result = "";
  if (n >= 100) {
    result = HUNDREDS[Math.floor(n / 100)];
    n = n % 100;
    if (n > 0) result += " e ";
  }
  if (n >= 20) {
    result += TENS[Math.floor(n / 10)];
    if (n % 10 > 0) result += " e " + UNITS[n % 10];
  } else if (n > 0) {
    result += UNITS[n];
  }
  return result;
}

export function numberToWords(value: number): string {
  if (isNaN(value) || value < 0) return "";
  if (value === 0) return "zero reais";

  const reais = Math.floor(value);
  const centavos = Math.round((value - reais) * 100);

  let reaisStr = "";
  if (reais > 0) {
    if (reais < 1000) {
      reaisStr = below1000(reais);
    } else if (reais < 1_000_000) {
      const mil = Math.floor(reais / 1000);
      const resto = reais % 1000;
      reaisStr = mil === 1 ? "mil" : below1000(mil) + " mil";
      if (resto > 0) reaisStr += " e " + below1000(resto);
    } else {
      const mi = Math.floor(reais / 1_000_000);
      const resto = reais % 1_000_000;
      reaisStr = below1000(mi) + (mi === 1 ? " milhão" : " milhões");
      const mil = Math.floor(resto / 1000);
      const cent = resto % 1000;
      if (mil > 0) reaisStr += " e " + (mil === 1 ? "mil" : below1000(mil) + " mil");
      if (cent > 0) reaisStr += " e " + below1000(cent);
    }
    reaisStr += reais === 1 ? " real" : " reais";
  }

  let centavosStr = "";
  if (centavos > 0) {
    centavosStr = below1000(centavos) + (centavos === 1 ? " centavo" : " centavos");
  }

  if (reaisStr && centavosStr) return reaisStr + " e " + centavosStr;
  if (reaisStr) return reaisStr;
  return centavosStr;
}
