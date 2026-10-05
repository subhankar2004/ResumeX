"use client";
import LogoIcon from "@/assets/logo.svg";
import MenuIcon from "@/assets/icon-menu.svg";
import { Button } from "@/components/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { navLinks } from "@/lib/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProfileMenu } from "@/components/ProfileMenu";

export const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <header className="py-4 border-b border-white/15 md:border-none sticky top-0 z-10">
      <div className="absolute inset-0 backdrop-blur -z-10 md:hidden"></div>
      <div className="container">
        <div className="flex justify-between items-center md:border border-white/15 md:p-2.5 rounded-xl max-w-2xl mx-auto relative">
          <div className="absolute inset-0 backdrop-blur -z-10 hidden md:block"></div>
          <div>
            <Link
              href="/"
              aria-label="ResumeX home"
              className="border h-10 w-10 rounded-lg inline-flex justify-center items-center border-white/15"
            >
              <LogoIcon className="h-8 w-8" />
            </Link>
          </div>
          <div className="hidden md:block">
            <nav className="flex gap-8 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={twMerge(
                    "text-white/70 hover:text-white transition",
                    pathname === link.href && "text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex gap-4 items-center">
            {loading ? (
              <div className="h-10 w-10" />
            ) : user ? (
              <ProfileMenu />
            ) : (
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            )}
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-1 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={twMerge(
                      "py-2 text-white/70 hover:text-white transition",
                      pathname === link.href && "text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
