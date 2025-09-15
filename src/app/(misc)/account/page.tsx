import ManageBillingButton from "@/app/components/ManageBillingButton";

export default function AccountPage() {
    return (
        <main className="mx-auto max-w-xl p-8">
            <h1 className="text-2xl font-semibold">Account</h1>
            <p className="mt-2 text-gray-600">Manage your GeckoAI Plus subscription.</p>
            <div className="mt-6">
                <ManageBillingButton />
            </div>
        </main>
    );
}
