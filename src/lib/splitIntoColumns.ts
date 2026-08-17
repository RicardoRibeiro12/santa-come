/**
 * Distribui categorias por 2 colunas equilibrando o número de itens (em vez
 * de deixar ao critério do CSS, que às vezes deixa uma coluna quase vazia).
 * Categorias maiores entram primeiro, sempre na coluna mais curta no momento.
 */
export function splitIntoColumns<T extends { category: string }>(
  categories: string[],
  items: T[]
): [string[], string[]] {
  const counts = categories
    .map((category) => ({
      category,
      count: items.filter((i) => i.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);

  const columns: [string[], string[]] = [[], []];
  const totals = [0, 0];
  for (const { category, count } of counts) {
    const target = totals[0] <= totals[1] ? 0 : 1;
    columns[target].push(category);
    totals[target] += count;
  }
  return columns;
}
