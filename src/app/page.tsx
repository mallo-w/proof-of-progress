export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 px-8 py-5 flex justify-between items-center">
        <span className="font-bold text-lg tracking-tight">Proof of Progress</span>
        <a
          href="/sign-up"
          className="bg-white text-black text-sm font-semibold px-5 py-2 rounded hover:bg-zinc-200 transition"
        >
          Create a commitment
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-28 pb-20 text-center">
        <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
          Ship your next meaningful result—or forfeit.
        </h1>
        <p className="text-zinc-400 text-xl mb-10 leading-relaxed">
          Proof of Progress turns your most important founder commitment into a contract.
          Define the work, put money on the line, prove you shipped.
        </p>
        <a
          href="/sign-up"
          className="bg-white text-black font-semibold px-8 py-4 rounded text-lg hover:bg-zinc-200 transition"
        >
          Create a commitment
        </a>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800 max-w-3xl mx-auto px-8 py-20">
        <h2 className="text-2xl font-bold mb-12 text-center tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="text-zinc-500 text-sm font-semibold mb-2">01</div>
            <h3 className="font-bold text-lg mb-2">Commit</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Define one measurable shipping outcome and a deadline. No vague goals. No habits. One result.
            </p>
          </div>
          <div>
            <div className="text-zinc-500 text-sm font-semibold mb-2">02</div>
            <h3 className="font-bold text-lg mb-2">Stake</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Put money on the line. If you ship, you keep it. If you don't, you forfeit. Real consequences only.
            </p>
          </div>
          <div>
            <div className="text-zinc-500 text-sm font-semibold mb-2">03</div>
            <h3 className="font-bold text-lg mb-2">Prove</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Submit the pre-agreed evidence before time runs out. A referee or self-review confirms completion.
            </p>
          </div>
        </div>
      </section>

      {/* Example commitments */}
      <section className="border-t border-zinc-800 max-w-3xl mx-auto px-8 py-20">
        <h2 className="text-2xl font-bold mb-10 text-center tracking-tight">Example commitments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Publish a live landing page for my SaaS by Friday.",
            "Conduct 10 customer interviews and upload notes.",
            "Send 100 personalized prospecting emails.",
            "Release version 1.0 with a public demo URL.",
            "Publish my product on Product Hunt.",
            "Publish four technical blog posts this month.",
          ].map((example) => (
            <div
              key={example}
              className="border border-zinc-800 rounded px-5 py-4 text-sm text-zinc-300"
            >
              {example}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-8 py-8 text-center text-zinc-600 text-sm">
        Proof of Progress — A commitment contract for indie hackers.
      </footer>
    </main>
  );
}