import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🔥 Get session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    // 🔥 Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 🔥 Fetch profile (NO default fake role)
  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      console.log("PROFILE LOADED:", data) // debug

      setProfile(data)
    } catch (err) {
      console.error("Profile fetch failed:", err)

      // ⚠️ DO NOT silently assign admin/user randomly
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  // 🔐 Sign In
  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    return { error }
  }

  // 🔐 Sign Up — stores role + business info in user_metadata
  // The database trigger reads these to create the profiles row
  async function signUp(email, password, name, accountType = 'customer', businessName = '') {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: accountType,           // 'customer' or 'business'
          business_name: businessName, // only relevant for business accounts
        }
      }
    })

    return { error }
  }

  // 🔐 Sign Out
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)