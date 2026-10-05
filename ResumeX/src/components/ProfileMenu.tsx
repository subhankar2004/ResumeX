"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

// Avatar button for signed-in users, opening a menu with account links
export const ProfileMenu = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  if (!user) return null;

  const initial = user.email.charAt(0).toUpperCase();

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    router.push("/");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Account menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-full inline-flex items-center justify-center font-medium bg-gradient-to-b from-[#190d2e] to-[#4a208a] shadow-[0px_0px_12px_#8c45ff] border border-white/15 hover:shadow-[0px_0px_20px_#8c45ff] transition"
      >
        {initial}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-64 border border-white/15 rounded-xl bg-black/90 backdrop-blur p-2 z-20"
          >
            <div className="px-3 py-3 border-b border-white/10">
              <div className="text-sm font-medium truncate">{user.email}</div>
              <div className="mt-1.5 inline-block text-xs rounded-full px-2 py-0.5 bg-[#8c44ff] text-black font-semibold capitalize">
                {user.plan} plan
              </div>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
              >
                Profile
              </Link>
            </div>
            <div className="pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
              >
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
