export function getScoreLabel(score: number) {
  if (score >= 1.08) return "Oportunidad";
  if (score >= 0.95) return "Precio normal";
  return "Sobrevaluado";
}

export function getScoreClass(score: number) {
  if (score >= 1.08) return "bg-green-500/20 text-green-300";
  if (score >= 0.95) return "bg-yellow-500/20 text-yellow-300";
  return "bg-red-500/20 text-red-300";
}
export function getScoreDescription(score: number) {
  if (score >= 1.08) return "Precio atractivo frente al mercado.";
  if (score >= 0.95) return "Valor alineado con referencias similares.";
  return "Precio por encima de la referencia estimada.";
}