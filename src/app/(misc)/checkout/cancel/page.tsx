export default function CancelPage() {
    return (
        <main className="mx-auto max-w-xl p-8 text-center">
            <h1 className="text-2xl font-semibold">Checkout canceled</h1>
            <p className="mt-2 text-gray-600">No charge made. You can try again anytime.</p>
            <a href="/pricing" className="mt-6 inline-block rounded-xl border px-5 py-3">
                Back to pricing
            </a>
        </main>
    );
}
