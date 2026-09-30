import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { About } from './components/About.tsx';
import { Services } from './components/Services.tsx';
import { Products } from './components/Products.tsx';
import { Work } from './components/Work.tsx';
import { Team } from './components/Team.tsx';
import { Contact } from './components/Contact.tsx';
import { Reviews } from './components/Reviews.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const scrollToContact = (productName?: string) => {
    if (productName) {
      setSelectedProduct(productName);
    }
    const contactElem = document.getElementById('contact');
    if (contactElem) {
      const headerOffset = 64;
      const elementPosition = contactElem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-['Inter',system-ui,sans-serif]">
      {/* 1. Header with 3-dot dropdown menu */}
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto">
        {/* 2. Hero / Introduction */}
        <Hero onContactClick={() => scrollToContact()} />

        {/* 3. About TornedoX */}
        <About />

        {/* 4. Our Services */}
        <Services />

        {/* 5. Products */}
        <Products onContactClick={(productName) => scrollToContact(productName)} />

        {/* 6. Our Work */}
        <Work />

        {/* 7. Founder & Co-Founder */}
        <Team />

        {/* 8. Contact Section (Let's Work Together) */}
        <Contact initialSubject={selectedProduct} />

        {/* 9. Client Reviews */}
        <Reviews />
      </main>

      {/* 9. Dark Footer */}
      <Footer />
    </div>
  );
}
