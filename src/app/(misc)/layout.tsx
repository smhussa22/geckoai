import '../globals.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="auth-layout bg-night flex h-screen flex-col p-4">{children}</div>;
}
