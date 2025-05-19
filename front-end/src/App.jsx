import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './components/MainLayout';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';

import Register from './components/Register';
import Login from './components/Login';
import LupaPassword from './components/LupaPassword';
import Dashboard from './pages/Overview/Dashboard';
import Settings from './components/Pengaturan';

import HalamanTransaksi from './pages/Transaksi/Transaksi';
import HalamanTerjadwal from './pages/TransaksiTerjadwal/HalamanTerjadwal';

import Anggaran from './pages/Budgets/MainAnggaran';
import BudgetForm from './pages/Budgets/TambahAnggaran';
import KelolaKategori from './pages/Kategori/KelolaKategori';

import Kalender from './pages/Kalender/Kalender';

import Rekening from './pages/Rekening/Rekening';

import ExportPDF from './pages/Pdf/Export';

import Kategori from './pages/Diagram/Kategori';
import Waktu from './pages/Diagram/Waktu';



function App() {
  return (
    <Router basename="/">
      <Routes>
        <Route element={<MainLayout />}>
         {/* Rute untuk Overview */}
        <Route path='/dashboard' element={<Dashboard />} /> 

        {/* Rute untuk Transaksi */}
        <Route path='transaksi' element={<HalamanTransaksi />} />

         {/* Rute untuk Transaksi Terjadwal*/}
        <Route path='/transaksi-terjadwal' element={<HalamanTerjadwal />} />   
             
        {/* Rute untuk Anggaran */}
        <Route path='/anggaran' element={<Anggaran />} />
        <Route path='/anggaran/tambah' element={<BudgetForm />} />

        {/* Rute untuk Rekening */}
        <Route path='/rekening' element={<Rekening />} />

        {/* {Rute untuk Kalender} */}
        <Route path='/kalender' element={<Kalender />} />

        {/* Rute untuk Kategori */}
        <Route path='/kategori/kelola' element={<KelolaKategori />} />

        {/* Rute untuk diagram */}
        <Route path='/diagram/kategori' element={<Kategori />} />
        <Route path='/diagram/waktu' element={<Waktu />} />

        {/* Rute untuk export PDF */}
        <Route path='/export-pdf' element={<ExportPDF />} />

        {/* Rute untuk Pengaturan */}
        <Route path='/pengaturan' element={<Settings />} />
        </Route>

        <Route element={<Layout />}>
          {/* Rute default */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path='/forgot-password' element={<LupaPassword />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;