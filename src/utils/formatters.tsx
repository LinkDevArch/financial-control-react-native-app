export function amountFormatter(value: number): string {
  if (isNaN(value)) return "0";

  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(value);
}

export function dateTimeFormatter(value: string): string {
  let result = "";
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "T") {
      result += " ";
    } else if (value[i] === ".") {
      break;
    } else {
      result += value[i];
    }
  }

  return result;
}

export function toLocalISOString(date: any) : string {
  const pad = (n: any) => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
}
