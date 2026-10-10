import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service & Legal Notice",
  description:
    "Terms of service and legal notice for Proof of Progress.",
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
            Please read these terms carefully before staking money.
          </p>
        </header>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              1. Who we are
            </h2>
            <p>
              Proof of Progress is a personal commitment tool built by the
              Proof of Progress team. By using the product and staking money,
              you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              2. What happens to your money
            </h2>
            <p>
              Funds are collected and{" "}
              <span className="text-white font-semibold">charged in real money</span>{" "}
              through Stripe. When you lock a commitment, the staked amount is
              charged to your payment method and held for the duration of your
              commitment. Once the verdict is in: if your proof is approved, your
              stake is released back to you; if your commitment fails, the staked
              amount is{" "}
              <span className="text-white font-semibold">kept by Proof of Progress</span>.
            </p>
          </section>

          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              3. Refund policy
            </h2>
            <p>
              Once a commitment is locked (committed and paid) there are{" "}
              <span className="text-white font-semibold">no refunds</span>. The
              only exception is a technical error on our side that prevented a
              fair review of your proof — in which case your stake will be
              returned. By locking a commitment you accept that a failed
              commitment means your stake is forfeited.
            </p>
          </section>

          <section>
            <h2 className="text-zinc-500 uppercase text-[10px] tracking-widest font-semibold mb-3">
              4. Disclaimer
            </h2>
            <p>
              This is an{" "}
              <span className="text-white font-semibold">early product</span> and
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
