import LogInLeftPanel from "../components/LogInLeftPanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  
  return (

    <div className="flex h-screen bg-night">
      
      <section className="relative z-1 bg-[url('/layered-blobs-haikei.svg')] bg-cover bg-center hidden md:flex flex-1 flex-col p-8 ">

        <div className="mb-6">

          <LogInLeftPanel/>
          
        </div>

      </section>

      <section className="relative z-10 w-full md:w-1/2 flex items-center justify-center p-8 border-l-1 border-l-neutral-800 shadow-md">

        <div className="w-full max-w-md">

          {children}

        </div>

      </section>

    </div>

  );
}
