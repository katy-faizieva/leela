export async function gameResponse(res: Response) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Не удалось выполнить действие')
  return data
}
