import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      stage: string
    }
  }

  interface User {
    role: string
    stage: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    stage: string
    id: string
  }
}
