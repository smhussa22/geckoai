export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-2xl font-semibold">You’re in 🎉</h1>
      <p className="mt-2 text-gray-600">GeckoAI Plus is now active.</p>
      <a href="/app" className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-white">
        Go to app
      </a>
    </main>
  );
}