export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
      <div className="w-full max-w-md">
        <div className="border border-slate-700 rounded-lg p-8 bg-slate-900/50 backdrop-blur">
          <h1 className="text-2xl font-bold text-center mb-8 text-white">
            Datax Research
          </h1>
          {children}
        </div>
      </div>
    </div>
  )
}
