"use-client";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import FileUpload from "@/components/uploader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="relative h-screen ">
      <div className="absolute inset-0 bg-cover bg-center bg-blue-50 dark:bg-slate-950"></div>
      <div className="relative flex items-center justify-center h-full">
        <FileUpload />
      </div>
    </div>
  );
}
