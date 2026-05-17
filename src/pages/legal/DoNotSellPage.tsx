import { useState } from "react";
import LegalLayout from "./_LegalLayout";

const DoNotSellPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subject = encodeURIComponent("Do Not Sell or Share My Personal Information");
  const body = encodeURIComponent(
    `I am submitting a request to opt out of the sale or sharing of my personal information.\n\nAccount email: ${email}\n\nThank you.`,
  );

  return (
    <LegalLayout
      title="Do Not Sell or Share My Personal Information"
      description="Submit a CCPA/CPRA opt-out request."
      canonical="/legal/do-not-sell"
    >
      <section>
        <p>
          <strong className="text-foreground">[COMPANY NAME] does not sell your personal
          information, and we do not "share" it for cross-context behavioral advertising</strong>
          {" "}as those terms are defined under the California Consumer Privacy Act (CCPA) as
          amended by the California Privacy Rights Act (CPRA).
        </p>
        <p className="mt-3">
          You may still submit a formal opt-out request below. We will honor it and confirm by
          email.
        </p>
      </section>

      <section>
        <h2 className="text-[22px] font-semibold text-foreground mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Submit a request
        </h2>
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 text-[15px] bg-transparent focus:outline-none"
            style={{ border: "0.5px solid hsl(var(--border))", borderRadius: "4px" }}
          />
          <a
            href={email ? `mailto:[CONTACT EMAIL]?subject=${subject}&body=${body}` : undefined}
            onClick={() => email && setSubmitted(true)}
            aria-disabled={!email}
            className={`inline-flex items-center px-5 py-3 text-[14px] font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 ${
              !email ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Submit opt-out request
          </a>
          {submitted && (
            <p className="text-[14px] text-muted-foreground">
              Your email client should open with a pre-filled request. We will respond within 45 days.
            </p>
          )}
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground">
          You may also email <a href="mailto:[CONTACT EMAIL]" className="text-primary hover:underline">[CONTACT EMAIL]</a>{" "}
          directly with the subject line "Do Not Sell or Share My Personal Information".
        </p>
      </section>

      <section>
        <p>
          For more on your privacy rights, see our{" "}
          <a href="/legal/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>
      </section>
    </LegalLayout>
  );
};

export default DoNotSellPage;
