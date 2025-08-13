import '../globals.css';

export default function AuthLayout({children}: { children: React.ReactNode; }) {

  return (

      <div className="auth-layout flex items-center justify-center h-screen bg-night">
      {children}
      
    </div>

  );

}
