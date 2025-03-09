"use-client";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import FileUpload from "@/components/uploader";
import LazyLoadVideo from "@/components/lazyLoadVideo";
import { motion } from "framer-motion";

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
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center">
      {/* Logo Section */}

      {/* Background Video */}
      {/* <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/paintwater.mp4" type="video/mp4" />
      </video> */}
      <LazyLoadVideo />

      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 to-transparent"></div>
      <div className="flex justify-center items-center ">
        <motion.img
          src="/Uday4.png"
          alt="Company Logo"
          className="sm:w-[500px] lg:w-[550px] opacity-90 drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {/* Main Content Section */}

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center w-full h-full px-10 text-center">
        {/* Left Section (Text) */}
        <motion.div
          className="text-white max-w-lg mb-6 md:mb-0 mx-9"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* <h2 className="text-sm font-semibold font-mono tracking-widest uppercase">
            Uday Digital
          </h2> */}
          <h1 className="font-montserrat text-4xl text-start font-extrabold font-mono tracking-wide leading-snug">
            Exceptional Prints Delivered with Precision
          </h1>
          {/* <h2 className=" text-start text-sm font-semibold font-mono tracking-widest uppercase">
            Featuring
          </h2> */}
          <p className="flex justify-center items-center text-start text-lg font-mono  ">
            <motion.img
              src="/7color.png"
              alt="Company Logo"
              className="w-[150px] opacity-90 drop-shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            <motion.img
              src="/fcl.png"
              alt="Company Logo"
              className="w-[150px] opacity-90 drop-shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </p>

          <p className="text-start text-lg font-mono mt-4">
            Elevate your brand with our top-tier printing solutions. Explore our
            latest catalog for premium designs and flawless prints.
          </p>
          <a href="/brochure.pdf" download>
            <button className="flex mt-4 px-6 py-3 bg-opacity-70 font-mono bg-white text-black rounded-md shadow-lg hover:bg-gray-200">
              Download Our Catalog
            </button>
          </a>
        </motion.div>

        {/* Right Section (Card) */}
        <motion.div
          className="flex flex-col items-center justify-center mt-6 md:mt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <FileUpload />
        </motion.div>
      </div>
    </div>
  );
}
