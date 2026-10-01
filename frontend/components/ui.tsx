import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function Mascot({ name, className = "" }: { name: string; className?: string }) {
  return <Image src={`/koda/koda-${name}.png`} alt="Koda" width={600} height={600} className={`w-auto ${className}`} priority />;
}

export function Logo({ className = "h-11" }: { className?: string }) {
  return (
    <Link href="/dashboard" aria-label="Koda">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/koda/logo.png" alt="Koda" className={`w-auto rounded-xl bg-logo px-1.5 py-0.5 ${className}`} />
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[28px] bg-surface p-6 shadow-soft sm:p-7 ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="mb-4 text-xs font-bold tracking-[0.12em] text-ink-2/70 uppercase">{children}</div>;
}

export function Chip({ children, tone = "soft" }: { children: ReactNode; tone?: "soft" | "neutral" }) {
  return (
    <span className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${tone === "soft" ? "bg-koda-soft text-koda" : "bg-tint text-ink"}`}>
      {children}
    </span>
  );
}

export const btnPrimary =
  "inline-flex h-13 items-center justify-center gap-2 rounded-[18px] bg-koda px-6 text-[15px] font-bold text-white shadow-[0_8px_20px_rgb(102_92_255/0.28)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-koda-dark hover:shadow-[0_12px_28px_rgb(102_92_255/0.4)] active:translate-y-0 active:scale-[.97]";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold transition duration-200 hover:-translate-x-1">{children}</Link>;
}

export function PageHeader({ mascot, title, subtitle, action, children }: { mascot: string; title: string; subtitle?: string; action?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex items-center gap-4 sm:gap-5">
        <Mascot name={mascot} className="h-20 shrink-0 sm:h-28" />
        <div>
          {children}
          <h1 className="text-[26px] leading-tight font-bold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-2">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
