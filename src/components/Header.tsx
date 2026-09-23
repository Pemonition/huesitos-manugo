import Link from "next/link";
import { BoneIcon } from "./BoneIcon";

export function Header() {
  return (
    <header className="border-b border-amber-200 bg-amber-50/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-amber-900">
          <BoneIcon className="h-6 w-12" />
          Huesitos Manugo
        </Link>
        <nav className="flex gap-4 text-sm">
          <a href="#comprar" className="text-amber-900 hover:underline">
            Comprar
          </a>
          <a href="#revenda" className="text-amber-900 hover:underline">
            Sou revendedor
          </a>
        </nav>
      </div>
    </header>
  );
}
