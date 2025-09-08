import type { Metadata } from "next";
import { FaYoutube } from "react-icons/fa6";
import { VscGithubInverted } from "react-icons/vsc";
import Image from "next/image";

export const metadata: Metadata = {
  title: "GeckoAI - Help",
  description: "Get help for any inquiries.",
};

export default function HelpPage() {
  return (
    <div className="w-full h-full rounded-md border border-neutral-800 shadow-md p-8">
      <h1 className="text-3xl font-bold text-asparagus tracking-tighter mb-6">
        Need Help?
      </h1>
      <p className="text-neutral-300 mb-8 max-w-2xl">
        Here are some useful resources to help you get started with GeckoAI or
        explore the project in more depth.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* YouTube Tutorial */}
        <a
          href="https://www.youtube.com/your-video-url"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-6 transition-transform hover:scale-[1.02] hover:border-red-500/60"
        >
          <div className="flex items-center gap-3">
            <FaYoutube size={28} className="text-red-500" />
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Video Tutorial
            </h2>
          </div>
          <p className="text-neutral-300 text-sm leading-snug">
            Watch a step-by-step walkthrough of GeckoAI’s features and learn how
            to make the most out of the app.
          </p>
        </a>

        {/* GitHub Repository */}
        <a
          href="https://github.com/smhussa22/geckoai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-start gap-3 rounded-xl border border-neutral-700 bg-neutral-800/40 p-6 transition-transform hover:scale-[1.02] hover:border-neutral-500"
        >
          <div className="flex items-center gap-3">
            <VscGithubInverted size={28} className="text-white" />
            <h2 className="text-xl font-semibold text-white tracking-tight">
              GitHub Repository
            </h2>
          </div>
          <p className="text-neutral-300 text-sm leading-snug">
            Explore the full GeckoAI codebase, contribute, or check out how
            everything works behind the scenes.
          </p>
        </a>

        <a
          href="mailto:geckoaihelp@gmail.com"
          className="flex flex-col items-start gap-3 rounded-xl border border-asparagus/50 bg-asparagus/10 p-6 transition-transform hover:scale-[1.02] hover:border-asparagus/70 hover:bg-asparagus/20"
        >
          <div className="flex items-center gap-3">
            <Image
              src="/logoAnimated.svg"
              alt="GeckoAI Logo"
              width={28}
              height={28}
              className="rounded-full"
            />
            <h2 className="text-xl font-semibold text-white tracking-tight">
              Get Support
            </h2>
          </div>
          <p className="text-neutral-300 text-sm leading-snug">
            Contact our support team at{" "}
            <span className="text-asparagus">geckoaihelp@gmail.com</span>
          </p>
        </a>
      </div>
    </div>
  );
}
