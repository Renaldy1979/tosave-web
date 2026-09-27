/**
 * Números do site nunca são exatos: sempre arredondados para baixo, em
 * degraus amigáveis, com "mais de" — sensação de acervo sem limite, não
 * uma contagem que pode cair no dia seguinte. Abaixo de 10, mostra o
 * número (não faz sentido dizer "mais de 3").
 */
export function marketingNumber(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n < 10) return String(Math.floor(n));

  if (n < 100) return `mais de ${Math.floor(n / 10) * 10}`;
  if (n < 1000) return `mais de ${Math.floor(n / 50) * 50}`;
  if (n < 10_000) return `mais de ${(Math.floor(n / 100) * 100).toLocaleString("pt-BR")}`;
  if (n < 1_000_000) return `mais de ${Math.floor(n / 1000).toLocaleString("pt-BR")} mil`;

  const millions = Math.floor(n / 100_000) / 10;
  return `mais de ${millions.toLocaleString("pt-BR")} ${millions === 1 ? "milhão" : "milhões"}`;
}
