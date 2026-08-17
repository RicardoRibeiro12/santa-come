/**
 * Flag central que decide se o site lê o conteúdo do Google Sheets ou da
 * base de dados (gerida em /admin).
 *
 * DATA_SOURCE="sheets"   (ou por omissão) — lê do Google Sheets.
 * DATA_SOURCE="database" — ignora os links do Google Sheets e usa sempre a
 *                          base de dados, mesmo que as variáveis *_SHEET_CSV_URL
 *                          continuem definidas. Usar isto quando quiserem
 *                          voltar a gerir tudo pelo painel /admin.
 */
export function isUsingSheets(): boolean {
  return process.env.DATA_SOURCE !== "database";
}
