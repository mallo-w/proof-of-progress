export default function GetStarted() {
  return (
    <main className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center px-5 sm:px-8 py-10">
      <div className="max-w-sm w-full text-center space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Start a Commitment</h1>
          <p className="text-zinc-400 text-base mt-3">New here, or coming back?</p>
        </div>

        <div className="space-y-4">
          <a
            href="/sign-up"
            className="block w-full bg-white text-black py-4 rounded font-medium text-base hover:bg-zinc-200 transition"
          >
            Create an account
          </a>
          <a
            href="/login"
            className="block w-full border border-zinc-800 py-4 rounded font-medium text-base text-white hover:border-zinc-600 transition"
          >
            Log in
          </a>
        </div>

        <div>
          <a href="/" className="text-zinc-500 hover:text-white text-sm transition">
            ← Back
          </a>
        </div>
      </div>
    </main>
  )
}
