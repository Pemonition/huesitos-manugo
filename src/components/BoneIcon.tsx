// Ícone de ossinho simples em SVG — placeholder até vocês terem fotos reais
// do produto. Trocar por <Image src="/huesito.jpg" ... /> assim que tiverem
// uma foto (colocar o arquivo em /public).
export function BoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M40 20a15 15 0 0 0-15 15 15 15 0 0 0 5 11 15 15 0 0 0-5 11 15 15 0 0 0 15 15c6 0 11-3 13.5-8h93c2.5 5 7.5 8 13.5 8a15 15 0 0 0 15-15 15 15 0 0 0-5-11 15 15 0 0 0 5-11 15 15 0 0 0-15-15c-6 0-11 3-13.5 8h-93C51 23 46 20 40 20Z"
        className="fill-amber-100 stroke-amber-700"
        strokeWidth="3"
      />
    </svg>
  );
}
