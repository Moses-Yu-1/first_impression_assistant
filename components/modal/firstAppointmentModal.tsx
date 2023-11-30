"use client";
import {
  useCallback,
  useRef,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Close from "@/public/icons/close.svg?url";
import { MailHtml } from "@/components/mailHtml/mailHtml";
import Image from "next/image";
import { Lang } from "@/lang/lang";

export function FirstAppointmentModal() {
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef(null);
  const router = useRouter();
  const closeRef = useRef<HTMLImageElement>(null);
  const param = useSearchParams();
  const [lang, setLang] = useState<keyof typeof Lang>("ko");
  const [share, setShare] = useState<ShareData>();
  const onDismiss = useCallback(() => router.back(), [router]);
  const onClick: MouseEventHandler = useCallback(
    (e) =>
      (e.target === overlay.current ||
        e.target === wrapper.current ||
        e.target === closeRef.current) &&
      onDismiss &&
      onDismiss(),
    [onDismiss, overlay, wrapper],
  );
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(share);
      } catch (error) {
        console.log("공유 실패:", error);
      }
    } else {
      console.log("브라우저가 Web Share API를 지원하지 않습니다.");
    }
  };

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => (e.key === "Escape" ? onDismiss() : null),
    [onDismiss],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const key = (param.get("lang") as keyof typeof Lang) ?? "ko";
    setLang(key);
    return () => {
      document.body.style.overflow = "visible";
    };
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={overlay}
      className="absolute h-[100vh] w-[100vw] top-0 z-20 mx-auto bg-black/60 overflow-auto md:pb-10"
      onClick={onClick}
    >
      <div
        ref={wrapper}
        className="w-full md:w-[1200px] mt-40 sm:mt-20 lg:mt-10 mx-auto bg-white rounded-xl"
      >
        <div className="h-14 md:h-20 bg-[#000D47] rounded-t-xl flex items-center justify-between px-8 md:px-11">
          <h2 className="text-xl md:text-3xl text-white font-[600]">
            {Lang[lang].report}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="bg-white text-xs py-2 px-3 md:py-3 md:px-6 rounded-lg md:rounded-xl md:text-xl"
            >
              {Lang[lang].share}
            </button>
            {/* <button className="bg-white text-xs py-2 px-3 md:py-3 md:px-6 rounded-lg md:rounded-xl md:text-xl mr-4 md:mr-8">
              전문의에 문의
            </button> */}
            <Image
              ref={closeRef}
              onClick={(e) => {
                e.stopPropagation();
                onClick(e);
              }}
              src={Close}
              alt="close"
              className="w-3 h-3 md:w-8 md:h-8 text-white cursor-pointer"
            />
          </div>
        </div>
        <p className="bg-[#EAF1F8] text-xs md:text-xl px-5 py-3 text-center text-[#777] tracking-[-0.8px]">
          {Lang[lang].warning}
        </p>
        <MailHtml setShare={setShare} />
      </div>
    </div>
  );
}
