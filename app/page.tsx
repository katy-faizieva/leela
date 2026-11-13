import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { GamePage } from '@/components/game-page'

export default async function Home() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!session.user.accessAllowed) redirect('/access')
  return <GamePage user={session.user as any} />
}
