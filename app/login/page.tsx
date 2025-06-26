"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()

  const handleLogin = async () => {
    try {
      const result = await login(email, password, "customer")
      if (result?.error) {
        console.error("Login failed:", result.error)
        // Handle login error (e.g., display an error message)
      } else {
        // Login successful, redirect or perform other actions
        console.log("Login successful:", result)
      }
    } catch (error) {
      console.error("An error occurred during login:", error)
      // Handle unexpected errors
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
