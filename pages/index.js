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
    // <div className="relative min-h-screen xbg-zinc-300 dark:bg-zinc-900">
    <div className="relative min-h-screen bg-zinc-300 dark:bg-zinc-900 flex flex-col items-center justify-center">
      {/* Logo Section */}

      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/paintwater.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 to-transparent"></div>
      <div className="flex justify-center items-center m-6">
        <img
          src="/Uday4.png"
          alt="Company Logo"
          className="sm:w-96 lg:w-96 opacity-90 drop-shadow-lg"
        />
      </div>
      {/* Main Content Section */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full h-full px-10 text-center">
        {/* Left Section (Text) */}
        <div className="text-white max-w-lg mb-6 md:mb-0">
          <h2 className="text-sm font-semibold tracking-widest uppercase">
            Uday Digital
          </h2>
          <h1 className="text-5xl font-extrabold tracking-wide leading-snug">
            Exceptional Print Quality <br /> Delivered with Precision
          </h1>
          <p className="text-lg mt-4">
            Elevate your brand with our top-tier printing solutions. Explore our
            latest catalog for premium designs and flawless prints.
          </p>
          <a href="/brochure.pdf" download>
            <button className="mt-6 px-6 py-3 bg-opacity-70 bg-white text-black rounded-md shadow-lg hover:bg-gray-200">
              Download Our Catalog
            </button>
          </a>
        </div>

        {/* Right Section (Card) */}
        <div className="flex flex-col items-center justify-center mt-6 md:mt-0">
          <FileUpload />
        </div>
      </div>
    </div>
  );
}
