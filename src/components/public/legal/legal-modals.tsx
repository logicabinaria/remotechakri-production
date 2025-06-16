"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface LegalModalProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LegalModal({ title, content, isOpen, onClose }: LegalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {title} document - please read carefully
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useTermsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  
  useEffect(() => {
    // Fetch terms content when modal is opened
    if (isOpen) {
      fetch("/api/legal/terms")
        .then(res => res.json())
        .then(data => setContent(data.content))
        .catch(err => console.error("Error loading terms:", err));
    }
  }, [isOpen]);
  
  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    content
  };
}

export function usePrivacyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  
  useEffect(() => {
    // Fetch privacy content when modal is opened
    if (isOpen) {
      fetch("/api/legal/privacy")
        .then(res => res.json())
        .then(data => setContent(data.content))
        .catch(err => console.error("Error loading privacy policy:", err));
    }
  }, [isOpen]);
  
  return {
    isOpen,
    openModal: () => setIsOpen(true),
    closeModal: () => setIsOpen(false),
    content
  };
}
