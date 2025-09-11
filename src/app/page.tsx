"use client"; // Make this a client component for framer-motion

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SiLinkedin } from "react-icons/si";

// Animation variant
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="Polytecks Logo"
              width={150}
              height={50}
              priority
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex gap-6">
            <Link href="#about" className="btn-secondary">
              About
            </Link>
            <Link href="#team" className="btn-secondary">
              Team
            </Link>
            <Link href="#contact" className="btn-secondary">
              Contact Us
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen bg-gray-50 px-12 py-20 overflow-hidden"
      >
        {/* Text block */}
        <div className="absolute top-20 left-12 md:top-24 md:left-24 z-10 w-3/5">
          <h1 className="text-6xl md:text-6xl font-bold mb-4 text-gray-800">
            The skin, a window into the body
          </h1>
          <h2 className="text-2xl md:text-2xl font-semibold mb-6 text-gray-700">
            Smart textile electrode arrays for faster, earlier and better diagnostics
          </h2>
          <Link
            href="/contact"
            className="bg-c1 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition"
          >
            Get in Touch
          </Link>
        </div>

        {/* Image block */}
        <div className="absolute bottom-0 right-0 md:bottom-12 md:right-24 w-2/5">
          <Image
            src="/hero-bg.png"
            alt="Hero Image"
            width={700}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Logo bottom-left */}
        <div className="absolute bottom-20 left-20">
          <Image
            src="/logo.svg"
            alt="Polytecks Logo"
            width={700}
            height={500}
            className="object-contain"
          />
        </div>
      </section>

      {/* About Section */}
      <motion.section 
        id='about'
        className="container mx-auto py-20 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">About Polytecks</h2>
        <p className="text-lg text-gray-600">
          At Polytecks, we are advancing non-invasive electrophysiological diagnostics by means of body surface potential mapping — a technique that shifts the focus from individual electrical signals from single electrodes to comprehensive electrical maps captured by electrode arrays.
        </p>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        id='team'
        className="container mx-auto py-20 px-6 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Team</h2>
        <p className="text-lg text-gray-600">
          Our team combines expertise in biomedical engineering, AI, and textiles.
        </p>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id='contact'
        className="container mx-auto py-20 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Contact Us</h2>
        <p className="text-lg text-gray-600">
          Reach out to us to learn more or schedule a demo.
        </p>
        <Link
          href="/contact"
          className="bg-c1 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition mt-4 inline-block"
        >
          Get in Touch
        </Link>
      </motion.section>

      {/* Footer */}
      <footer className="bg-c3 py-6 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between text-gray-600 px-6">
          <div>
            © {new Date().getFullYear()} Polytecks. All rights reserved.
          </div>

          {/* LinkedIn Icon */}
          <div className="mt-4 md:mt-0">
            <a
              href="https://www.linkedin.com/company/polytecks" // your LinkedIn URL
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition"
            >
              <SiLinkedin size={24} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}