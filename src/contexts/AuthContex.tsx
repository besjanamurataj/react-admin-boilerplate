import{ createContext, useEffect, useMemo, useState, type FunctionComponent, type ReactNode } from 'react'
import type { User } from '../types/user'
import type{ RoleRequest } from '../types/role'

interface AuthProviderProps {
  children: ReactNode
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | any
  userId: string | null
  roles: RoleRequest[] | any[]
  hasRole: (roleName: string) => boolean
  hasPermission: (permissionName: string) => boolean
  authenticateUser: (user: Partial<User>) => void
  unAuthenticateUser: () => void
  updateUser: () => void
  loading: boolean
}

const initialState: AuthContextType = {
  isAuthenticated: false,
  user: null,
  userId: null,
  roles: [],
  hasRole: () => false,
  hasPermission: () => false,
  authenticateUser: () => {},
  unAuthenticateUser: () => {},
  updateUser: () => {},
  loading: true,
}

const AuthContext = createContext<AuthContextType>(initialState)

const AuthProvider: FunctionComponent<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [roles, setRoles] = useState<RoleRequest[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const isAuthenticated = useMemo<boolean>(() => Boolean(user), [user])
  const [loading, setLoading] = useState(true)

  const authenticateUser = (userData: any) => {
    const { email, authorities, id } = userData

    setUser({ email })
    setPermissions(authorities || [])
    setUserId(id || null)
  }

  const unAuthenticateUser = () => {
    localStorage.removeItem('jwtToken')
    setUser(null)
    setRoles([])
    setPermissions([])
    setUserId(null)
  }

  const hasRole = (roleName: string): boolean => {
    return roles.some(role => role.name === roleName)
  }
  const hasPermission = (permissionName: string): boolean => {
    return permissions.some(permission => permission.includes(permissionName))
  }

  useEffect(() => {
    const token = localStorage.getItem('jwtToken')

    if (!token) {
      setLoading(false)
      return
    }

    const decoded = JSON.parse(atob(token.split('.')[1] || ''))
    const storedUser = decoded?.sub
    const authorities: string[] = decoded?.authorities || []

    setUserId(decoded.id || '')

    if (storedUser) {
      setUser({
        email: storedUser,
      })
      setPermissions(authorities)
    }
    setLoading(false)
  }, [])

  const updateUser = () => {}

  useEffect(() => {}, [])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userId,
        roles,
        hasRole,
        hasPermission,
        authenticateUser,
        unAuthenticateUser,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
