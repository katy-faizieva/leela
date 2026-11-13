import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminPanel } from '@/components/admin-panel'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!session.user.accessAllowed) redirect('/access')
  if (!['owner', 'admin'].includes(session.user.role ?? '')) redirect('/')
  return <AdminPanel currentUserId={session.user.id} currentRole={session.user.role ?? ''} />
}
