import Image from "next/image";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center bg-primary px-6">
        <Image
          src="/icons/logo-horizontal-light.svg"
          alt="HomeLedger"
          width={140}
          height={32}
          priority
        />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground">
        HomeLedger © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
