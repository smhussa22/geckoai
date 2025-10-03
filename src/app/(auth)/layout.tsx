import LogInLeftPanel from "../components/LogInLeftPanel";
import LoadingWrapper from "../LoadingWrapper";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-night flex h-screen">
            <section className="relative z-1 hidden flex-1 flex-col bg-[url('/layered-blobs-haikei.svg')] bg-cover bg-center p-8 md:flex">
                <div className="mb-6">
                    <LogInLeftPanel />
                </div>
            </section>

            <section className="relative z-10 flex w-full items-center justify-center border-l-1 border-l-neutral-800 p-8 shadow-md md:w-1/2">
                <div className="w-full max-w-md">{children}</div>
            </section>
        </div>
    );
}
