import { useState } from "react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "bn", label: "Bengali" },
  { code: "te", label: "Telugu" },
  { code: "mr", label: "Marathi" },
  { code: "ta", label: "Tamil" },
  { code: "ur", label: "Urdu" },
  { code: "gu", label: "Gujarati" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "or", label: "Odia" },
  { code: "pa", label: "Punjabi" },
  { code: "as", label: "Assamese" },
  { code: "sa", label: "Sanskrit" },
  { code: "ne", label: "Nepali" },
  { code: "ks", label: "Kashmiri" },
];

export function LanguageSwitcher() {
  const [lang, setLang] = useState("en");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLang(newLang);
    
    document.cookie = `googtrans=/en/${newLang}; path=/;`;
    document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname};`;

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = newLang;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      // Double dispatch with a slight delay fixes the first-click bug
      setTimeout(() => {
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }, 150);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="relative flex items-center">
      <select
        value={lang}
        onChange={handleChange}
        translate="no"
        className={cn(
          "notranslate h-8 cursor-pointer appearance-none bg-transparent pl-2 pr-6 text-xs font-medium uppercase tracking-widest text-ink outline-none",
          "border border-ink/20 hover:border-ink/50 focus:border-ink",
          "transition-colors duration-200"
        )}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-paper text-ink">
            {l.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-ink">
        <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}
