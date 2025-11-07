import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login | Datax Research",
}

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Welcome back</h2>
        <p className="text-sm text-gray-400">
          Sign in to your account to continue
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
