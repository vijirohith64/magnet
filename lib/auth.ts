export class AuthService {
  private static readonly ADMIN_KEY = "adminKey"

  static setAdminSession(key: string): boolean {
    const validKey = process.env.NEXT_PUBLIC_ADMIN_SECRET || "Dsu020311"
    if (key === validKey) {
      if (typeof window !== "undefined") {
        localStorage.setItem(this.ADMIN_KEY, key)
        // Set cookie for server-side validation
        document.cookie = `${this.ADMIN_KEY}=${key}; path=/; secure; samesite=strict`
      }
      return true
    }
    return false
  }

  static getAdminSession(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.ADMIN_KEY)
    }
    return null
  }

  static clearAdminSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.ADMIN_KEY)
      document.cookie = `${this.ADMIN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`
    }
  }

  static isAuthenticated(): boolean {
    return this.getAdminSession() !== null
  }
}
