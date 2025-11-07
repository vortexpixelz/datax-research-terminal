import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Sign Up | Datax Research",
}

export default function SignupPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Create account</h2>
        <p className="text-sm text-gray-400">
          Join us to start your research journey
        </p>
      </div>
      <SignupForm />
    </div>
  )
}
