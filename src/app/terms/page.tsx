import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service & Legal Notice",
  description:
    "Terms of service and legal notice for Proof of Progress (beta).",
};

export default function Terms() {
  return (
    <main className="min-h-screen bg-black text-white px-5 py-8 sm:px-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <header className="border-b border-zinc-800 pb-6 mb-10">
          <h1 className="text-2xl font-bold mb-2 tracking-tight">
            Terms of Service &amp; Legal Notice
          </h1>
          <p className="text-zinc-500 text-sm">
            Last updated for the Proof of Progress beta.
          </p>
        </header>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              1. Who we are
            </h2>
            <p>
              Proof of Progress is a personal commitment tool built in beta by the
              Proof of Progress team. It is currently an experimental product and
              is <span className="text-white font-semibold">not yet a
              registered legal entity</span>. Using the product means you
              understand it is an early-stage beta.
            </p>
          </section>

          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              2. What happens to your money
            </h2>
            <p>
              Funds are collected through Stripe in{" "}
              <span className="text-white font-semibold">sandbox (test) mode</span>{" "}
              during the beta phase — no real payment is ever charged. When live
              mode is enabled, the staked amount will be held for the duration of
              your commitment and then either released back to you or forfeited,
              depending on the verdict on your submitted proof.
            </p>
          </section>

          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              3. Refund policy
            </h2>
            <p>
              During the beta, no real money is charged, so there is nothing to
              refund. In live mode, once a commitment is locked there are{" "}
              <span className="text-white font-semibold">no refunds</span>, except
              in the case of a technical error on our side that prevented a fair
              review of your proof.
            </p>
          </section>

          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              4. Disclaimer
            </h2>
            <p>
              This is a{" "}
              <span className="text-white font-semibold">beta product</span> and
              may contain bugs. It is provided &ldquo;as is&rdquo;, without any
              warranty of availability, reliability, or fitness for a particular
              purpose. Use it at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              5. Contact
            </h2>
            <p>
              Questions, issues, or refund requests related to technical errors?
              Reach us at{" "}
              <a
                href="mailto:mallory@system-strategy.co"
                className="text-white underline hover:text-zinc-300 transition"
              >
                mallory@system-strategy.co
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="border-t border-zinc-800 mt-12 pt-8">
          <a
            href="/"
            className="text-zinc-500 hover:text-white text-xs underline"
          >
            &larr; Back to home
          </a>
        </footer>
      </div>
    </main>
  );
}
