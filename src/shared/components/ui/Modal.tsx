// Modal.tsx
"use client";

import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg" | "xl";
const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-5xl",
};

type ModalProps = {
  isOpen?: boolean;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  hasFooter?: boolean;
  onCancel?: () => void;
  onConfirm?: () => Promise<void> | void;
  size?: ModalSize;
};

export default function Modal({
  isOpen = false,
  title,
  children,
  confirmText,
  cancelText,
  hasFooter = true,
  onCancel,
  onConfirm,
  size = "sm",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!isOpen || !mounted) return null;

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!onConfirm) return;

    try {
      setIsLoading(true);
      await onConfirm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const modalUI = (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "bg-white rounded-lg shadow-xl w-full p-6 relative",
          sizeMap[size]
        )}
      >
        {isLoading && (
          <div className="fixed inset-0 z-[1100] bg-white/30 flex items-center justify-center">
            <Image
              src="/icons/spinner.svg"
              width={70}
              height={70}
              alt="spinner"
            />
          </div>
        )}
        {onCancel && (
          <button
            aria-label="close"
            onClick={onCancel}
            className="absolute top-2 right-2 px-2 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100"
          >
            X
          </button>
        )}
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="mb-6">{children}</div>
        {hasFooter && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 rounded-md text-white bg-primary"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalUI, document.body);
}
