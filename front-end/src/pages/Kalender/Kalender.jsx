import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../../features/authSlice";
import axios from "axios";

const Kalender = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('transaksi'); // 'transaksi' atau 'terjadwal'
  const [transactions, setTransactions] = useState([]);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [categories, setCategories] = useState([]);

  

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Gagal mengambil transaksi:', error);
    }
  };

  const fetchScheduledEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scheduled', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setScheduledEvents(response.data);
    } catch (error) {
      console.error('Gagal mengambil event terjadwal:', error);
    }
  };
  
  // Fetch data dari backend
  useEffect(() => {
    dispatch(getMe());
    fetchTransactions();
    fetchScheduledEvents();
    // fetchCategories();
  }, []);
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mai', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const getTransactionMarker = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const transaction = transactions.find(t => 
        t.createdAt.split(' ')[0] === dateString
    );
    
    if (transaction) {
        if (transaction.category_type === 'income') {
            return { marker: 'I', color: 'bg-green-100 text-green-800' };
          } else if (transaction.category_type === 'expense') {
            return { marker: 'E', color: 'bg-red-100 text-red-800' };
          }
      }
      return null;
    };
  

  const getScheduledMarker = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const startEvent = scheduledEvents.find(e => 
      e.start_date.split(' ')[0] === dateString
    );
    const endEvent = scheduledEvents.find(e => 
      e.end_date.split(' ')[0] === dateString
    );

    if (startEvent) {
      return { marker: 'Ss', color: 'bg-blue-100 text-blue-800' };
    }
    if (endEvent) {
      return { marker: 'Se', color: 'bg-purple-100 text-purple-800' };
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-4 mb-4">
        <button
            onClick={handlePrevMonth}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
            ←
        </button>
        <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button
            onClick={handleNextMonth}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
            →
        </button>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="view"
              value="transaksi"
              checked={viewMode === 'transaksi'}
              onChange={(e) => setViewMode(e.target.value)}
            />
            Transaksi
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="view"
              value="terjadwal"
              checked={viewMode === 'terjadwal'}
              onChange={(e) => setViewMode(e.target.value)}
            />
            Terjadwal
          </label>
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1);
            
            let marker = null;
            let markerColor = '';

            if (viewMode === 'transaksi') {
              const transactionMarker = getTransactionMarker(date);
              marker = transactionMarker?.marker;
              markerColor = transactionMarker?.color || '';
            } else if (viewMode === 'terjadwal') {
              const scheduledMarker = getScheduledMarker(date);
              marker = scheduledMarker?.marker;
              markerColor = scheduledMarker?.color || '';
            }

            return (
              <div
                key={index + 1}
                className={`aspect-square p-2 text-center border rounded-lg ${markerColor} relative`}
              >
                <div className="absolute top-0 left-0 w-full h-full flex items-start justify-start">
                  {marker && (
                    <span className="text-xs p-0.5">
                      {marker}
                    </span>
                  )}
                </div>
                {index + 1}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Kalender;
