"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import React from "react";
import { useChat } from "ai/react";
import { useRouter, useSearchParams } from "next/navigation";
import PuffLoader from "react-spinners/PuffLoader";
import { coverteReport } from "@/utils/coverte-report";
import Chosun from "@/public/images/logo.png";
import Image from "next/image";
import { CiUser } from "react-icons/ci";
import Send from "@/public/icons/send.svg?url";
import generateRandomId from "@/utils/idGenerator";
import Robot from "@/public/svgs/Robot";
import { LangContents } from "@/lang/lang";
import backgroundImage from "@/public/images/bg.jpg"; // Replace with your image path
import {
  Backdrop,
  Icon,
  IconButton,
  TextField,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import styled from "@emotion/styled";
import precautions from "@/public/images/text.png";
import { Character } from "./Character";
import { Chat } from "./chat";
import SendIcon from "@mui/icons-material/Send";
import PrivacyConsentModal from "./PrivacyConsentModal";
import { track } from "@vercel/analytics";
import { Header } from "../header/header";
// AI와 대화할 수 있는 form
export const AiForm = () => {
  useEffect(() => {
    localStorage.removeItem("report");
  }, []);
  // ai/react 라이브러리에서 제공하는 ai와 대화할 수 있는 hook
  const {
    messages, // 대화 내용/기록
    input, // 사용자가 입력한 내용
    handleInputChange, // 사용자가 입력한 내용을 업데이트하는 함수
    handleSubmit, // 사용자가 입력한 내용을 서버로 전송하는 함수
    isLoading, // 서버로 전송하는 중인지 여부
    setMessages, // 대화 내용/기록을 업데이트하는 함수
  } = useChat();
  const param = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null); // form element
  const textareaRef = useRef<HTMLTextAreaElement>(null); // textarea element
  const chatbgRef = useRef<HTMLDivElement>(null); // 대화 내용/기록을 감싸는 div element
  const [isResult, setIsResult] = useState(false); // 결과 보고서를 받았는지 여부
  const [isAutoScroll, setIsAutoScroll] = useState(true); // 대화 내용/기록이 업데이트 될 때마다 자동으로 스크롤을 내릴지 여부
  const [lang, setLang] = useState<keyof typeof LangContents>("ko"); // 언어 설정
  const router = useRouter();

  // textarea의 높이를 자동으로 조절하는 함수
  function resizeTextarea() {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    if (textareaRef.current.scrollHeight > 200)
      textareaRef.current.style.height = "208px";
  }

  // 최초 렌더링 시 대화 내용/기록에 "어디가 불편해서 방문하신건가요?"를 추가
  useEffect(() => {
    const tempLang = (param.get("lang") as keyof typeof LangContents) ?? "ko";
    setLang(tempLang);
    setMessages([
      {
        role: "assistant",
        id: new Date().getTime().toString(),
        content: LangContents[tempLang].firstQuestion,
        createdAt: new Date(),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 대화 내용/기록이 업데이트 될 때마다 textarea의 높이를 조절
  useEffect(() => {
    if (!chatbgRef.current || !isAutoScroll) return;
    const { scrollHeight, clientHeight } = chatbgRef.current;
    chatbgRef.current.scrollTop = scrollHeight - clientHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);
  // 대화 내용/기록이 업데이트 될 때마다 스크롤을 내릴지 여부를 결정
  const autoScroll = () => {
    if (!chatbgRef.current) return;
    const { scrollHeight, clientHeight, scrollTop } = chatbgRef.current;
    if (scrollHeight < scrollTop + clientHeight + 100) setIsAutoScroll(true);
    else setIsAutoScroll(false);
  };

  // 대화 내용/기록이 업데이트 될 때마다 결과 보고서를 받았는지 확인
  useEffect(() => {
    if (isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    if (lastMessage.role !== "assistant") return;
    if (lastMessage.content.includes("# 결과 보고서 #")) {
      const rawReport = lastMessage.content.split("# 결과 보고서 #")[1];
      localStorage.setItem("report", JSON.stringify(coverteReport(rawReport)));
      setIsResult(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // 개인정보 이용 동의
  const [open, setOpen] = useState(false);

  const handleAgree = () => {
    router.push(`/result?lang=${lang ?? "ko"}`);
  };
  // console.log("AI Form");
  return (
    <>
      <Header />
      <div className="flex flex-col w-full h-full pt-4">
        <PrivacyConsentModal
          open={open}
          setOpen={setOpen}
          handleAgree={handleAgree}
          lang={lang}
        ></PrivacyConsentModal>
        <div className="max-w-[1400px] flex-1 overflow-hidden w-full rounded-xl md:rounded-3xl bg-white mt-2 pt-2 md:mt-3 shadow-lg px-3 xl:px-auto mx-auto">
          <div className="w-full h-full pt-2 pb-4 md:pt-4 md:pb-8 flex flex-col max-w-[1200px] mx-auto">
            <div className="flex-1 overflow-hidden px-3">
              <div
                ref={chatbgRef}
                onScroll={() => autoScroll()}
                className="flex flex-col gap-4 py-4 overflow-auto h-full"
              >
                {/* 대화 내용 / 기록 */}
                {messages.map((chat) => (
                  <Chat
                    key={generateRandomId(15)}
                    role={chat.role}
                    content={chat.content}
                    createdAt={chat.createdAt}
                  />
                ))}
              </div>
            </div>
            {/* 입력창 */}
            <div className="w-full px-1 md:px-10">
              {isResult ? (
                <div className="w-full flex items-center flex-row gap-2 md:gap-4">
                  <div
                    onClick={() => window.location.reload()}
                    className="rounded-lg md:rounded-xl cursor-pointer text-center w-full font-[400] text-xs md:text-2xl shadow-md py-4 bg-[#D9D9D9]"
                  >
                    {LangContents[lang].refresh}
                  </div>
                  <div
                    onClick={() => {
                      track("Finish Chat", {lang: lang});
                      setOpen(true);
                    }} // 모달창 열기
                    className="bg-[#00387F] rounded-lg md:rounded-xl text-xs font-[400] md:text-2xl cursor-pointer shadow-md py-4 text-white text-center w-full"
                  >
                    {LangContents[lang].viewResult}
                  </div>
                </div>
              ) : (
                <form
                  className="relative w-full"
                  onSubmit={(e) => !isLoading && handleSubmit(e)}
                  ref={formRef}
                >
                  <textarea
                    className="w-full text-xs md:text-2xl font-[400] rounded-xl shadow-md pl-3 pr-8 py-4 md:pl-7 md:pr-16 md:py-6 outline-none row-auto resize-none"
                    rows={1}
                    // style="height: 80px;"
                    style={{ height: "80px" }}
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      if (e.target.value[e.target.value.length - 1] === "\n")
                        return;
                      handleInputChange(e);
                      resizeTextarea();
                    }}
                    placeholder={
                      isLoading
                        ? LangContents[lang].genMedical
                        : LangContents[lang].input
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      !isLoading &&
                      formRef.current?.requestSubmit()
                    }
                  ></textarea>
                  <Image
                    alt="send"
                    loading="eager"
                    width={40}
                    height={40}
                    decoding="async"
                    className="absolute right-3 md:right-5 bottom-[22px] md:bottom-7 cursor-pointer w-4 h-4 md:w-10 md:h-10"
                    src={Send}
                    onClick={(e: FormEvent) =>
                      handleSubmit(e as FormEvent<HTMLFormElement>)
                    }
                  />
                  {isLoading && (
                    <div className="absolute w-8 h-8 right-3 bottom-4 md:right-5 md:bottom-6 md:w-12 md:h-12">
                      <PuffLoader
                        loading={isLoading}
                        size="100%"
                        color="#9F9F9F"
                      />
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="z-1 w-full text-xs md:text-xl text-[#777] font-[300] text-center mt-4">
          ※정확한 진단은 내방하셔서 의사의 처방을 받으시길 바랍니다.
        </div>
      </div>
    </>
  );
};
