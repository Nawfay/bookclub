import pb from "./pocketbase"


export type RoleType = 'super' | 'admin' | 'user' ;

export interface AuthUser {
  id: string
  email: string
  name: string
  avatar: string
  role: RoleType
}

// Login with email and password
export async function login(email: string, password: string): Promise<AuthUser> {
  try {
    const authData = await pb.collection("users").authWithPassword(email, password)

    return {
      id: authData.record.id,
      email: authData.record.email,
      name: authData.record.name || authData.record.username,
      avatar: authData.record.avatar ? pb.files.getURL(authData.record, authData.record.avatar) : "",
      role: authData.record.role as RoleType
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to login")
  }
}

// Sign up new user
export async function signup(
  email: string,
  password: string,
  passwordConfirm: string,
  username: string,
  code?: string,
): Promise<AuthUser> {
  try {
    const requestBody = {
      email,
      password,
      passwordConfirm,
      username,
      name: username,
      ...(code && { code })
    }

    // Make POST request to the custom register endpoint
    const response = await fetch(`${pb.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to create account")
    }

    // Auto-login after successful registration
    await pb.collection("users").authWithPassword(email, password)

    const user = pb.authStore.record
    if (!user) {
      throw new Error("Failed to authenticate after registration")
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.username,
      avatar: user.avatar ? pb.files.getURL(user, user.avatar) : "",
      role: user.role as RoleType
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to create account")
  }
}

// Logout
export function logout() {
  pb.authStore.clear()
}

// Get current user
export function getCurrentUser(): AuthUser | null {
  if (!pb.authStore.isValid || !pb.authStore.record) {
    return null
  }

  const user = pb.authStore.record

  return {
    id: user.id,
    email: user.email,
    name: user.name || user.username,
    avatar: user.avatar ? pb.files.getURL(user, user.avatar) : "",
    role: user.role as RoleType
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return pb.authStore.isValid
}

// Refresh auth token
export async function refreshAuth(): Promise<boolean> {
  try {
    await pb.collection("users").authRefresh()
    return true
  } catch (error) {
    return false
  }
}

export function canViewSuper(): boolean {
  const user = getCurrentUser()
  return user?.role === 'super'
}

export function canViewAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'super' || user?.role === 'admin'
}