"use client";

import React, { useRef, useState } from "react";
import DeliveryRegionPopup from "./DeliveryRegionPopup";

export default function DeliveryRegionLauncher() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const modalOpenRef = useRef(false);

  // close when clicking outside
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (!open) return;
      // 🔥 모달이 열려 있으면 닫기 로직 무시
      if (modalOpenRef.current) return;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative " ref={wrapperRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="font-medium text-gray-700 hover:text-primary hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        배송지역 설정
      </button>
      {open && (
        <DeliveryRegionPopup
          modalOpenRef={modalOpenRef}
          onClose={() => {
            modalOpenRef.current = false;
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
