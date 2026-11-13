export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AccessStatus } from '@/components/access-status'

export default async function AccessPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.accessAllowed) redirect('/')
  return <AccessStatus blocked={session.user.blocked} approved={session.user.approved} email={session.user.email ?? ''} />
}
