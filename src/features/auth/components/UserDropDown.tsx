"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "@/shared/types/user";
import { useRouter } from "next/navigation";
import { deleteCookie } from "@/shared/lib/cookie.client";
import { logout as logoutApi } from "@/features/auth/services/auth.service";

interface UserDropdownProps {
  currentUser: User;
}

export default function UserDropdown({ currentUser }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // const { logout } = useAuth();

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // 1️⃣ 서버 로그아웃 (실패해도 진행)
      await logoutApi();
    } catch (e) {
      console.error("서버 로그아웃 실패:", e);
    } finally {
      // 2️⃣ 클라이언트 인증 정보 제거
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      deleteCookie("accessToken");

      // 3️⃣ 로그인 페이지로 이동 (히스토리 제거)
      router.replace("/login");
    }
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 !text-sm font-semibold text-gray-800 hover:text-primary hover:scale-105 transition-all duration-200 bg-white/50 backdrop-blur-sm px-4 rounded-lg "
      >
        <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
          다
        </div>
        <span>{currentUser.name} 님</span>
        <Image
          src="/icons/dropdown-black.svg"
          alt="dropdown"
          width={16}
          height={16}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul className="absolute right-0 mt-3 w-48 rounded-xl bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 text-sm z-50 overflow-hidden">
          <li>
            <Link
              href="/my/profile"
              className="block px-4 py-3 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 transition-all duration-200 flex items-center gap-3"
            >
              <span className="text-primary">👤</span>
              회원 정보 수정
            </Link>
          </li>
          <li className="border-t border-gray-100">
            <button
              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 flex items-center gap-3"
              onClick={handleLogout}
            >
              <span className="text-red-500">🚪</span>
              로그아웃
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
