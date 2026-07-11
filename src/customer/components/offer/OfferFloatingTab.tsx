import { Button } from "@/components/ui/button";

const OfferFloatingTab = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="floating"
    className="fixed right-0 top-[45%] z-[3000] h-[110px] w-9 shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:-translate-x-[3px]"
    onClick={onClick}
  >
    <div className="flex items-center justify-center gap-2.5 -rotate-90 translate-y-[6px]">
      <span className="tracking-wider text-base font-sans select-none leading-none">Offers</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.3em"
        height="1.3em"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M2 3a1 1 0 0 1 1-1h8a1 1 0 0 1 .707.293l10 10a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-10-10A1 1 0 0 1 2 11V3zm2 1v6.586l9 9L19.586 13l-9-9H4z" />
        <path d="M9 7.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0z" />
      </svg>
    </div>
  </Button>
);

export default OfferFloatingTab;
