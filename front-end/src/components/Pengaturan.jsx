import React, { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Settings = () => {
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD - $');
  const [firstDayOfMonth, setFirstDayOfMonth] = useState('1');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Monday');
  const [setTimeTransactions, setSetTimeTransactions] = useState(true);
  const [displayIcon, setDisplayIcon] = useState(true);
  const [checkedDefault, setCheckedDefault] = useState('Checked');

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white">
      {/* Feedback & Support Header */}
      <div className="border-b border-green-500 pb-2 mb-6">
        <h2 className="text-lg font-bold text-green-600">Feedback & Support</h2>
        <p className="text-sm mt-2">
        Jika Anda memiliki pertanyaan, hubungi layanan pelanggan kami di <a href="mailto:dompetIQ@gmail.com" className="text-green-500">dompetIQ@gmail.com</a>
        </p>
      </div>

      {/* Languages */}
      {/* <div className="flex items-center justify-between mb-6 border-b pb-4">
        <label className="font-medium">Bahasa:</label>
        <div className="flex items-center">
          <div className="relative w-64">
            <select 
              className="w-full p-2 border rounded appearance-none pr-10 bg-white"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Indonesia">Indonesia</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ExpandMoreIcon className="text-gray-400" />
            </div>
          </div>
          <button className="ml-4 text-green-500 font-medium">Simpan</button>
        </div>
      </div> */}

      {/* Currency */}
      {/* <div className="flex items-center justify-between mb-6 border-b pb-4">
        <label className="font-medium">Mata Uang:</label>
        <div className="flex items-center">
          <div className="relative w-64">
            <select 
              className="w-full p-2 border rounded appearance-none pr-10 bg-white"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD - $">USD - $</option>
              <option value="EUR - €">EUR - €</option>
              <option value="IDR - Rp">IDR - Rp</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ExpandMoreIcon className="text-gray-400" />
            </div>
          </div>
          <button className="ml-4 text-green-500 font-medium">Simpan</button>
        </div>
      </div> */}

      {/* General Settings */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4">General settings</h2>
        
        {/* First day of month */}
        <div className="flex items-center mb-4">
          <label className="w-40 font-medium">Hari pertama setiap bulan:</label>
          <div className="relative w-24">
            <select 
              className="w-full p-2 border rounded appearance-none pr-10 bg-white"
              value={firstDayOfMonth}
              onChange={(e) => setFirstDayOfMonth(e.target.value)}
            >
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={(i+1).toString()}>{i+1}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ExpandMoreIcon className="text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* First day of week */}
        <div className="flex items-center mb-6">
          <label className="w-40 font-medium">Hari pertama dalam seminggu:</label>
          <div className="relative w-64">
            <select 
              className="w-full p-2 border rounded appearance-none pr-10 bg-white"
              value={firstDayOfWeek}
              onChange={(e) => setFirstDayOfWeek(e.target.value)}
            >
              <option value="Monday">Senin</option>
              <option value="Sunday">Minggu</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ExpandMoreIcon className="text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Transaction time toggle */}
        {/* <div className="flex items-center mb-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={setTimeTransactions}
              onChange={() => setSetTimeTransactions(!setTimeTransactions)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
          <div className="ml-4 flex items-center">
            <AccessTimeIcon className="text-green-500 mr-2" />
            <span>Transactions - Set the time of the transactions</span>
          </div>
        </div> */}
        
        {/* Default option */}
        {/* <div className="flex items-center ml-16 mb-4">
          <label className="w-24 font-medium">Default:</label>
          <div className="relative w-64">
            <select 
              className="w-full p-2 border rounded appearance-none pr-10 bg-white"
              value={checkedDefault}
              onChange={(e) => setCheckedDefault(e.target.value)}
            >
              <option value="Checked">Checked</option>
              <option value="Not checked">Not checked</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ExpandMoreIcon className="text-gray-400" />
            </div>
          </div>
        </div> */}
        
        <div className="flex justify-end mt-6">
          <button className="text-green-500 font-medium">Simpan</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;