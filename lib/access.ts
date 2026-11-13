import { auth } from '@/auth'

export const isAdministrator = (role?: string) => role === 'owner' || role === 'admin'

// Fresh database-backed access checks run inside auth(), including for existing JWTs.
export async function gameSession() {
  const session = await auth()
  return session?.user?.accessAllowed ? session : null
}
