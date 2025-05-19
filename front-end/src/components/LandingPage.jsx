import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from 'lucide-react';
import Footer from "./Footer"; 
import logo from "../assets/logo.png";
import logoIDX from "../assets/logo-IDX.png";
import logoOJK from "../assets/logo-OJK.png";
import illustration from "../assets/illustration.png";
import illustration2 from "../assets/illustration2.png";
import fitur1 from "../assets/fitur1.png";
import fitur2 from "../assets/fitur2.png";
import fitur3 from "../assets/fitur3.png";
import gambar1 from "../assets/gambar1.png";
import gambar2 from "../assets/gambar2.png";
import gambar3 from "../assets/gambar3.png";
import gambar4 from "../assets/gambar4.png";

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMobileNavClick = (id) => {
    scrollToSection(id);
    setIsMenuOpen(false); // Close menu after clicking a navigation item
  };

  const handleSubscribeClick = (e) => {
    e.preventDefault(); // Prevent default form submission
    navigate('/Register'); // Navigate to Register page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-md py-4 fixed top-0 w-full z-50">
        <div className="container mx-auto flex justify-between items-center px-6">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="DompetIQ Logo" className="h-10 mr-3" />
            <h1 className="text-2xl font-bold text-green-600">DompetIQ</h1>
          </div>

          {/* Menu Navigasi */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection("Home")} className="hover:text-green-500">
              Home
            </button>
            <button onClick={() => scrollToSection("Tentang")} className="hover:text-green-500">
              Tentang
            </button>
            <button onClick={() => scrollToSection("Fitur")} className="hover:text-green-500">
              Fitur
            </button>
            <button onClick={() => scrollToSection("Tangkapan-Layar")} className="hover:text-green-500">
              Tangkapan Layar
            </button>
          </nav>

          {/* Login & Register */}
          <div className="hidden md:flex space-x-4">
            <Link to="/login" className="px-4 py-2 text-white bg-green-500 rounded-lg">
              Masuk
            </Link>
            <Link to="/Register" className="px-4 py-2 text-green-500 border border-green-500 rounded-lg">
              Daftar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-green-600" />
            ) : (
              <Menu className="h-6 w-6 text-green-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4 px-6 shadow-lg">
            <nav className="flex flex-col space-y-4">
              <button onClick={() => handleMobileNavClick("Home")} className="text-left py-2 px-4 hover:bg-green-50 hover:text-green-500 rounded-lg">
                Home
              </button>
              <button onClick={() => handleMobileNavClick("Tentang")} className="text-left py-2 px-4 hover:bg-green-50 hover:text-green-500 rounded-lg">
                Tentang
              </button>
              <button onClick={() => handleMobileNavClick("Fitur")} className="text-left py-2 px-4 hover:bg-green-50 hover:text-green-500 rounded-lg">
                Fitur
              </button>
              <button onClick={() => handleMobileNavClick("Tangkapan-Layar")} className="text-left py-2 px-4 hover:bg-green-50 hover:text-green-500 rounded-lg">
                Tangkapan Layar
              </button>
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link to="/login" className="py-2 px-4 text-center text-white bg-green-500 rounded-lg">
                  Masuk
                </Link>
                <Link to="/Register" className="py-2 px-4 text-center text-green-500 border border-green-500 rounded-lg">
                  Daftar
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main id="Home" className="flex-grow flex items-center justify-center bg-green-50 py-24">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
          {/* Ilustrasi di kiri */}
          <div className="flex justify-center md:order-1">
            <img src={illustration} alt="Illustration" className="w-full max-w-lg" />
          </div>

          {/* Teks Hero di kanan */}
          <div className="text-center md:text-left md:order-2">
            <h1 className="text-5xl font-bold text-green-700 leading-tight">
              Mengelola keuangan <br />
              tidak pernah semudah ini
            </h1>
            <p className="mt-4 text-gray-600 text-lg">
              Membantu individu dan rumah tangga dalam mengelola keuangan secara efektif, serta memberikan analisis keuangan yang mudah dipahami.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Masuk
            </Link>
            <p className="mt-4 text-sm text-gray-500">Terdaftar dan diawasi oleh:</p>
            <div className="flex items-center space-x-6 mt-2">
              <img src={logoIDX} alt="IDX" className="h-12" />
              <img src={logoOJK} alt="OJK" className="h-12" />
            </div>
          </div>
        </div>
      </main>

      {/* Tentang Section */}
      <section id="Tentang" className="py-24 bg-white">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">
          {/* Ilustrasi di kiri */}
          <div className="flex justify-center">
            <img src={illustration2} alt="Tentang DompetIQ" className="w-full max-w-lg" />
          </div>

          {/* Teks di kanan */}
          <div>
            <h2 className="text-5xl font-bold text-black leading-tight">
              Solusi cerdas untuk <br /> keuangan pribadi Anda
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Pengelolaan keuangan yang cermat penting untuk menjaga stabilitas pendapatan dan pengeluaran. Namun, banyak orang mengalami kesulitan karena kurangnya waktu untuk pencatatan.
            </p>
            <p className="mt-2 text-gray-600 text-lg">
              Aplikasi DompetIQ dapat membantu mengelola keuangan secara tepat dan terperinci, sehingga pengeluaran bulanan dapat dipantau dengan baik.
            </p>
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="Fitur" className="py-32 bg-white">
        <div className="container mx-auto text-center px-6">
          {/* Judul & Deskripsi */}
          <h3 className="text-xl font-semibold text-green-600">Mengapa Harus Kita?</h3>
          <h2 className="text-5xl font-bold text-black leading-tight mt-2">
            Kami adalah tim <br /> yang antusias
          </h2>
          <p className="mt-4 text-gray-600 text-lg max-w-3xl mx-auto">
            Rangkaian teknologi kami dirancang untuk mendukung berbagai kebutuhan 
            keuangan pribadi dan rumah tangga. Tinjau transaksi dengan opsi filter, 
            menetapkan anggaran mingguan dan bulanan serta analisis keuangan dapat 
            mudah dipahami yang belum pernah ada sebelumnya.
          </p>

          {/* Tombol */}
          <div className="mt-6">
            <button className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center mx-auto">
              Jelajahi <span className="ml-2">→</span>
            </button>
          </div>

          {/* Grid Fitur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {/* Kartu 1 */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center border border-gray-200">
              <img src={fitur1} alt="Transaksi Filter" className="w-20 mx-auto mb-6" />
              <h4 className="text-2xl font-semibold text-black">Transaksi dengan opsi filter</h4>
              <p className="text-gray-600 mt-2">
                Menyaring transaksi berdasarkan kategori atau periode waktu tertentu, 
                sehingga memudahkan dalam mengelola keuangan dengan lebih sistematis.
              </p>
              <div className="mt-4 h-1 bg-green-500 w-full"></div>
            </div>

            {/* Kartu 2 */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center border border-gray-200">
              <img src={fitur2} alt="Anggaran" className="w-20 mx-auto mb-6" />
              <h4 className="text-2xl font-semibold text-black">Menetapkan anggaran</h4>
              <p className="text-gray-600 mt-2">
                Membantu dalam mengontrol pengeluaran dan memastikan pengguna tetap 
                berada dalam batas keuangan yang telah direncanakan.
              </p>
              <div className="mt-4 h-1 bg-green-500 w-full"></div>
            </div>

            {/* Kartu 3 */}
            <div className="bg-white shadow-lg rounded-lg p-8 text-center border border-gray-200">
              <img src={fitur3} alt="Analisis Keuangan" className="w-20 mx-auto mb-6" />
              <h4 className="text-2xl font-semibold text-black">Analisis keuangan</h4>
              <p className="text-gray-600 mt-2">
                Menyediakan laporan dan visualisasi data yang membantu pengguna dalam 
                menganalisis kondisi keuangan dan mengoptimalkan pengelolaan dana.
              </p>
              <div className="mt-4 h-1 bg-green-500 w-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tangkapan Layar Section */}
      <section id="Tangkapan-Layar" className="py-24 bg-gray-50">
        <div className="container mx-auto text-center px-6">
          {/* Judul Section */}
          <h3 className="text-xl font-semibold text-green-600">Tangkapan Layar</h3>
          <h2 className="text-5xl font-bold text-black leading-tight mt-2">
            Telusuri fitur-fitur utama <span className="text-green-600">DompetIQ</span>
          </h2>

          {/* Grid Tangkapan Layar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 mt-16">
            {/* Kartu 1 */}
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
              <div className="h-70 bg-gray-200 rounded-lg mb-4"><img src={gambar1} alt="Logo DompetIQ" className="h-70" /></div>
              <h4 className="text-2xl font-semibold text-black">Analisis Keuangan</h4>
            </div>

            {/* Kartu 2 */}
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
              <div className="h-70 bg-gray-200 rounded-lg mb-4"><img src={gambar2} alt="Logo DompetIQ" className="h-70" /></div>
              <h4 className="text-2xl font-semibold text-black">Transaksi dengan Filter</h4>
            </div>

            {/* Kartu 3 */}
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
              <div className="h-70 bg-gray-200 rounded-lg mb-4"><img src={gambar3} alt="Logo DompetIQ" className="h-70" /></div>
              <h4 className="text-2xl font-semibold text-black">Menetapkan Anggaran</h4>
            </div>

            {/* Kartu 4 */}
            <div className="bg-white shadow-lg rounded-lg p-6 text-center">
              <div className="h-70 bg-gray-200 rounded-lg mb-4"><img src={gambar4} alt="Logo DompetIQ" className="h-70" /></div>
              <h4 className="text-2xl font-semibold text-black">Pengelolaan Kategori</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto max-w-4xl px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Teks Subscribe */}
          <div className="text-left">
            <h3 className="text-lg font-semibold text-green-500">Subscribe</h3>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mt-2">
              Tetap terinformasi, jangan <br />
              pernah melewatkan <span className="underline decoration-green-500">informasi terbaru!</span>
            </h2>
            <p className="mt-4 text-gray-400 text-base">
              Kami akan mengirimkan informasi terbaru seputar pengelolaan keuangan pribadi dan rumah tangga. Kami juga akan membagikan wawasan tentang teknologi digital yang dapat membantu Anda merencanakan keuangan dengan lebih cerdas.
            </p>
          </div>

          {/* Form Subscribe */}
          <div>
            <form 
              className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4"
              onSubmit={handleSubscribeClick}
            >
              <input
                type="email"
                placeholder="Alamat Email"
                className="w-full md:w-auto flex-1 px-4 py-2 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-lg text-base font-semibold hover:bg-green-600"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Copyright Section */}
      <div className="bg-white text-black text-center py-4">
        <p className="text-sm">
          Copyright © DompetIQ 2025. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;