import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Proof of Progress — Commit. Or lose your money." },
  description:
    "Set a goal. Stake real money. Deliver proof — or forfeit. A commitment contract for indie hackers, solopreneurs, and creators.",
};

const STEPS = [
  {
    num: "01",
    title: "Commit",
    body: "Define your goal, deadline, and binary success criteria. No vague resolutions—one clear result.",
  },
  {
    num: "02",
    title: "Stake",
    body: "Lock in €25, €50, or €100. Your money is held until the deadline passes.",
  },
  {
    num: "03",
    title: "Deliver",
    body: "Submit your proof before the deadline — or lose your stake. No excuses, no extensions.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Shipped my SaaS MVP in 14 days. €100 on the line.",
    author: "@indie_maker",
  },
  {
    quote:
      "Finally launched my newsletter after 3 months of procrastinating. €50 well risked.",
    author: "@creator_x",
  },
  {
    quote:
      "The fear of losing €100 to someone else was stronger than any productivity app.",
    author: "@solofounder",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center gap-3">
        <span className="font-bold text-base sm:text-lg tracking-tight">
          Proof of Progress
        </span>
        <a
          href="/login"
          className="text-zinc-400 hover:text-white text-xs sm:text-sm font-semibold transition whitespace-nowrap"
        >
          Login
        </a>
      </nav>

      {/* SECTION 1 — Hero */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24 text-center">
        <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight mb-6">
          Commit.
          <br />
          Or lose your money.
        </h1>
        <p className="text-zinc-400 text-lg sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto">
          Set a goal. Stake real money. Deliver proof — or forfeit.
          <br className="hidden sm:block" /> No excuses.
        </p>
        <a
          href="/sign-up"
          className="block sm:inline-block w-full sm:w-auto bg-white text-black font-bold px-8 py-4 rounded text-base sm:text-lg hover:bg-zinc-200 transition"
        >
          Start a Commitment →
        </a>
        <p className="text-zinc-500 text-sm mt-5">
          Already have an account?{" "}
          <a href="/login" className="text-zinc-300 underline hover:text-white transition">
            Login
          </a>
        </p>
      </section>

      {/* SECTION 2 — How it works */}
      <section className="border-t border-zinc-800 max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12 sm:mb-16 text-center tracking-tight">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-8">
          {STEPS.map((step) => (
            <div key={step.num}>
              <div className="text-zinc-600 text-3xl sm:text-4xl font-black mb-4 tracking-tight">
                {step.num}
              </div>
              <h3 className="font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3 — Why it works */}
      <section className="border-t border-zinc-800 max-w-2xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tight">
          Why money changes everything
        </h2>
        <div className="space-y-6 text-zinc-400 text-base sm:text-lg leading-relaxed">
          <p>
            Research on loss aversion shows we feel the pain of losing money
            roughly twice as strongly as the pleasure of gaining it. That
            asymmetry is exactly why this works.
          </p>
          <p>
            A to-do list has no teeth. A streak breaks and nobody notices. But
            put real money on the line and your brain treats the deadline like a
            threat—because it is. Suddenly &ldquo;later&rdquo; stops being an
            option.
          </p>
          <p className="text-zinc-300">
            You don&apos;t need more motivation. You need consequences.
          </p>
        </div>
      </section>

      {/* SECTION 4 — Social proof placeholder */}
      <section className="border-t border-zinc-800 max-w-4xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Early results
          </h2>
          <p className="text-zinc-600 text-xs uppercase tracking-widest">
            Illustrative examples — real results coming soon
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="border border-zinc-800 rounded p-6 flex flex-col justify-between gap-6 bg-zinc-950"
            >
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <span className="text-zinc-500 text-xs font-semibold">
                {t.author}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — Final CTA */}
      <section className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-8">
            Ready to stop procrastinating?
          </h2>
          <a
            href="/sign-up"
            className="block sm:inline-block w-full sm:w-auto bg-white text-black font-bold px-8 py-4 rounded text-base sm:text-lg hover:bg-zinc-200 transition"
          >
            Start your first commitment →
          </a>
          <p className="text-zinc-500 text-sm mt-5">
            Beta — test mode, no real charge yet. Going live soon.
          </p>
        </div>
      </section>

      {/* SECTION 6 — Footer */}
      <footer className="border-t border-zinc-800 px-5 sm:px-8 py-8 text-center text-zinc-600 text-sm space-y-2">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
          <a
            href="/terms"
            className="text-zinc-500 underline hover:text-zinc-300 transition"
          >
            Terms of Service &amp; Legal Notice
          </a>
          <span className="hidden sm:inline text-zinc-700">·</span>
          <a
            href="mailto:mallory@system-strategy.co"
            className="text-zinc-500 hover:text-zinc-300 transition"
          >
            mallory@system-strategy.co
          </a>
        </div>
        <p className="text-zinc-600">© 2026 Proof of Progress</p>
      </footer>
    </main>
  );
}
