"use client"; // Make this a client component for framer-motion

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { SiLinkedin } from "react-icons/si";
import { useState, useEffect } from "react";

// Animation variant
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to close menu on link click
  const handleLinkClick = () => setIsMenuOpen(false);

  // Smooth scroll with offset
  const scrollWithOffset = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const headerOffset = 80; // adjust according to navbar height
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

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

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6">
            <button onClick={() => scrollWithOffset("about")} className="btn-secondary">About</button>
            <button onClick={() => scrollWithOffset("team")} className="btn-secondary">Team</button>
            <button onClick={() => scrollWithOffset("contact")} className="btn-secondary">Contact Us</button>
          </div>

          {/* Hamburger Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col justify-between h-6 w-8 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className="block w-full h-0.5 bg-gray-800"></span>
              <span className="block w-full h-0.5 bg-gray-800"></span>
              <span className="block w-full h-0.5 bg-gray-800"></span>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <button
              onClick={() => { scrollWithOffset("about"); handleLinkClick(); }}
              className="block px-6 py-3 border-t border-gray-200 w-full text-left"
            >
              About
            </button>
            <button
              onClick={() => { scrollWithOffset("team"); handleLinkClick(); }}
              className="block px-6 py-3 border-t border-gray-200 w-full text-left"
            >
              Team
            </button>
            <button
              onClick={() => { scrollWithOffset("contact"); handleLinkClick(); }}
              className="block px-6 py-3 border-t border-gray-200 w-full text-left"
            >
              Contact Us
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen bg-gray-50 px-6 sm:px-12 py-20 overflow-hidden"
      >
        {/* Text block */}
        <div className="relative z-10 w-full sm:w-3/5 mb-10 sm:mb-0">
          <h1 className="text-4xl sm:text-5xl md:text-5xl font-bold mb-4 text-gray-800">
            The skin is a window into the body
          </h1>
          <h2 className="text-xl sm:text-2xl md:text-2xl font-semibold mb-6 text-gray-700">
            Smart textile electrode arrays for faster, earlier and better diagnostics
          </h2>
          <p className="text-xl sm:text-2xl md:text-2xl font-semibold mb-6 text-c2">
            <a href="mailto:contact@polytecks.com" className="text-c2 font-semibold hover:underline">
              contact@polytecks.com
            </a>
          </p>
        </div>

        {/* Bottom-right image */}
        <div className="w-full sm:w-2/5 sm:absolute sm:bottom-12 sm:right-24 sm:h-auto mt-6 sm:mt-0">
          <Image
            src="/hero-bg.png"
            alt="Hero Image"
            width={700}
            height={500}
            className="object-contain w-full"
          />
        </div>

        {/* Bottom-left logo */}
        <div className="hidden sm:block absolute bottom-10 left-12">
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
        className="container mx-auto py-10 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800">About Polytecks</h2>
        <p className="text-lg text-gray-600 pb-5">
          Polytecks is a Cambridge University spin-out pioneering smart textile technology for next-generation healthcare diagnostics. Our patented high-density e-textile electrode arrays capture bioelectrical signals from the body’s surface with unprecedented resolution and comfort. Combined with advanced AI, these signals are transformed into detailed maps that provide actionable insights in minutes.
        </p>  
        <p className="text-lg text-gray-600 pb-5">
          We are starting with cardiology — the world’s leading cause of death — where early detection can extend lives and prevent over 80% of cases. Our pilot studies, conducted in collaboration with veterinary hospitals, have already shown promising results opening the door to faster and more accessible care.
        </p> 
        <p className="text-lg text-gray-600 pb-5"> 
          But our vision goes further. The same approach can be applied across multiple healthcare domains, from neurology and neuroprosthetics to gut health and foetal monitoring. By building a platform for high-resolution, non-invasive bioelectrical mapping, Polytecks aims to unlock a new era of diagnostics and monitoring that is scalable, affordable and accessible.
        </p>  
        <p className="text-lg text-gray-600">
          Polytecks is more than an upgrade to the ECG — it is a step-change in how we connect the body’s signals to healthcare, ensuring no patient, human or animal, is left behind.
        </p>
        {/* Pitch deck */}
        <p className="mt-10 mb-10 text-center">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-2xl text-c1 bg-c2 rounded-xl px-3 py-2 font-semibold hover:underline hover:bg-c3 transition"
          >
            View our latest slide deck
          </a>
        </p>

        {/* Images side by side */}
        <div className="mt-10 flex flex-col md:flex-row gap-6">
          <Image 
            src="/lab-photo.png" 
            alt="Polytecks prototype"
            width={500}
            height={300}
            className="rounded-xl object-cover w-full md:w-1/2"
          />
          <Image 
            src="/back-device.jpg" 
            alt="Polytecks research"
            width={500}
            height={300}
            className="rounded-xl object-cover w-full md:w-1/2"
          />
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section 
        id='team'
        className="container mx-auto py-10 px-6 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        {/* Team Heading */}
        <h2 className="text-3xl font-bold mb-5 text-gray-800 text-left">Our Team</h2>

        <hr className="border-t border-gray-400 my-8" />

        {/* Executive Team */}
        <h2 className="text-2xl font-bold mb-10 text-c1 text-center">Executive</h2>
        <div className="flex flex-wrap justify-center gap-10 mb-5">
          {/* Team member */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md">
              <Image 
                src="/team/ruben-ruiz-mateos-serrano.png" 
                alt="Ruben Ruiz-Mateos Serrano" 
                width={160} 
                height={160} 
                className="object-cover object-center w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Ruben Ruiz-Mateos Serrano</h3>
            <p className="text-c1 font-medium">Founder & CEO</p>
            <p className="text-gray-600 text-sm mt-2">
              Ruben is a PhD researcher in Bioelectronics at the University of Cambridge, where his work focuses on developing advanced bioelectronic interfaces for healthcare. He founded Polytecks to translate his research into wearable technology that enables early, accessible and non-invasive diagnostics.
            </p>
          </div>

          {/* Team member */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md">
              <Image 
                src="/team/charlie-brunt.png" 
                alt="Charlie Brunt" 
                width={160} 
                height={160} 
                className="object-cover object-top w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Charlie Brunt</h3>
            <p className="text-c1 font-medium">Technical Advisor</p>
            <p className="text-gray-600 text-sm mt-2">
              Charlie holds an MEng from the University of Cambridge and brings strong expertise in electrical engineering to Polytecks. As technical advisor, he leads the technical strategy and development of the company’s technology, ensuring it is robust, scalable and ready for real-world deployment.
            </p>
          </div>

          {/* Team member */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md">
              <Image 
                src="/team/callan-macdonald.png" 
                alt="Callan MacDonald" 
                width={160} 
                height={160} 
                className="object-cover object-top w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Callan MacDonald</h3>
            <p className="text-c1 font-medium">Commercial Advisor</p>
            <p className="text-gray-600 text-sm mt-2">
              Callan holds an MPhil in Bioscience Enterprise from the University of Cambridge and leads Polytecks’ commercialisation. With experience across the Cambridge deep-tech ecosystem, Callan focuses on turning our breakthrough bioelectronics into scalable operations.
            </p>
          </div>

        {/* Team member */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md">
              <Image 
                src="/team/jen-richardson.png" 
                alt="Jen Richardson" 
                width={160} 
                height={160} 
                className="object-cover object-top w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Jen Richardson</h3>
            <p className="text-c1 font-medium">Engagement Lead</p>
            <p className="text-gray-600 text-sm mt-2">
              Jen has 13 years’ experience working within the startup ecosystem in Cambridge. Covering all things recruitment, brand, marketing and communications, she supports Polytecks’ engagement. She also hosts The Project Cambridge Podcast, a podcast showcasing innovation, entrepreneurship and inclusivity within the Cambridge ecosystem.
            </p>
          </div>
        </div>

        {/* Advisors */}
        <h2 className="text-2xl font-bold mt-10 mb-10 text-c1 text-center">Advisors</h2>
        <div className="flex flex-wrap justify-center gap-10 mb-5">
          {/* Advisor */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md">
              <Image 
                src="/team/george-malliaras.png" 
                alt="George Malliaras" 
                width={160} 
                height={160} 
                className="object-cover object-center w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Prof. George Malliaras</h3>
            <p className="text-c1 font-medium">Medical Device Manufacturing</p>
            <p className="text-gray-600 text-sm mt-2">
              Professor Malliaras is the Prince Philip Professor of Technology at the University of Cambridge and a global leader in bioelectronics. As Scientific Advisor to Polytecks, he provides strategic scientific guidance, ensuring the company’s technology is built on the latest advances in medical electronics.
            </p>
          </div>

          {/* Advisor */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md">
              <Image 
                src="/team/jose-novo-matos.png" 
                alt="Jose Novo Matos" 
                width={160} 
                height={160} 
                className="object-cover object-top w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Prof. Jose Novo Matos</h3>
            <p className="text-c1 font-medium">Veterinary Cardiology</p>
            <p className="text-gray-600 text-sm mt-2">
              Professor Novo Matos is a European Specialist in Small Animal Cardiology at the University of Cambridge. He supports Polytecks by advising on veterinary applications and guiding pre-clinical validation studies, helping to ensure the technology benefits both animal and human healthcare.
            </p>
          </div>

          {/* Advisor */}
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4 shadow-md">
              <Image 
                src="/team/david-fairen-jimenez.png" 
                alt="David Fairen-Jimenez" 
                width={160} 
                height={160} 
                className="object-cover object-bottom w-full h-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Prof. David Fairen-Jimenez</h3>
            <p className="text-c1 font-medium">Entrepreneurship</p>
            <p className="text-gray-600 text-sm mt-2">
              Prof. David Fairen-Jimenez is Professor of Molecular Engineering at the University of Cambridge and an experienced academic entrepreneur. As Entrepreneurship Advisor to Polytecks, he offers strategic guidance on company growth, technology commercialisation and the transition from academic research to market-ready innovation.
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-400 my-8" />

        {/* Affiliations & Partners */}
        <h2 className="text-2xl font-bold mt-10 mb-10 text-gray-800 text-center">Affiliations & Partners</h2>
        <div className="flex flex-wrap justify-center gap-10 mb-5">
          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/cambridge.png" 
                alt="Cambridge Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/imperial-college-london.png" 
                alt="Imperial Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/ucl.png" 
                alt="UCL Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/bioelectronics-lab.png" 
                alt="Bioelectronics Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/ceps.png" 
                alt="CEPS Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/wcsim.png" 
                alt="WCSIM Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/impulse-maxwell-centre.jpg" 
                alt="impulse Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/spark.png" 
                alt="SPARK1.0 Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>

          {/* Affiliation */}
          <div className="flex flex-col items-center text-center">
            <div className="w-40 h-20 overflow-hidden mb-4">
              <Image 
                src="/affiliations/qtrace.png" 
                alt="Qtrace Logo" 
                width={160} 
                height={80} 
                className="object-contain w-full h-full"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id='contact'
        className="container mx-auto py-10 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold mb-5 text-gray-800">Contact Us</h2>
        <div className="text-left">
          <p className="text-lg text-gray-700">
            Reach out: <a href="mailto:contact@polytecks.com" className="text-c1 font-semibold hover:underline">contact@polytecks.com</a>
          </p>
          <p className="text-lg text-gray-700">
            Follow us on{' '}
            <a 
              href="https://www.linkedin.com/company/polytecks/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-c1 font-semibold hover:underline"
            >
              LinkedIn
            </a>
          </p>
        </div>

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
              className="text-c1 hover:text-c2 transition"
            >
              <SiLinkedin size={24} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}