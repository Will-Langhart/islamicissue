import Link from "next/link";
import Image from "next/image";
import SearchDialog from "./SearchDialog";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Examining Islam from Within logo"
            width={36}
            height={36}
            priority
          />
          <span className="font-semibold tracking-tight text-heading transition-colors group-hover:text-accent">
            Examining Islam from Within
          </span>
        </Link>
        <nav className="flex items-center gap-1.5 font-ui sm:gap-4">
          <Link
            href="/#contents"
            className="nav-link hidden text-sm text-muted transition-colors hover:text-accent sm:inline"
          >
            Contents
          </Link>
          <Link
            href="/conclusion"
            className="nav-link hidden text-sm text-muted transition-colors hover:text-accent sm:inline"
          >
            Conclusion
          </Link>
          <Link
            href="/sources"
            className="nav-link hidden text-sm text-muted transition-colors hover:text-accent md:inline"
          >
            Sources
          </Link>
          <SearchDialog />
        </nav>
      </div>
    </header>
  );
}
