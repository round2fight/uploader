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
    <div className="relative min-h-screen flex items-center justify-center bg-zinc-300 dark:bg-zinc-900">
      <FileUpload />
    </div>
  );
}
