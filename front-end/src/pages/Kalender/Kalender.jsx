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
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateTransactions, setSelectedDateTransactions] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions`, {
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
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/scheduled`, {
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
    setSelectedDate(null); // Reset selected date when changing month
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null); // Reset selected date when changing month
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

  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTransactionMarker = (date) => {
    const dateString = formatDateString(date);
    
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
    const dateString = formatDateString(date);

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

  const handleDateClick = (date) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
    setSelectedDate(clickedDate);
    
    // Find transactions for the selected date
    const dateString = formatDateString(clickedDate);
    const dateTransactions = transactions.filter(t => 
      t.createdAt.split(' ')[0] === dateString
    );
    setSelectedDateTransactions(dateTransactions);
    
    // Find scheduled events for the selected date
    const dateEvents = scheduledEvents.filter(e => 
      e.start_date.split(' ')[0] === dateString || e.end_date.split(' ')[0] === dateString
    );
    setSelectedDateEvents(dateEvents);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount).replace("Rp", "Rp ");
  };

  const formatNumberWithSpaces = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Calculate summary for selected date
  const calculateSummary = () => {
    if (!selectedDateTransactions.length) return { income: 0, expense: 0, total: 0 };
    
    const income = selectedDateTransactions
      .filter(t => t.category_type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const expense = selectedDateTransactions
      .filter(t => t.category_type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    return {
      income,
      expense,
      total: income - expense
    };
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
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
              {day.substring(0, 3)}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1);
            const isSelected = selectedDate && 
              selectedDate.getDate() === (index + 1) &&
              selectedDate.getMonth() === currentDate.getMonth() &&
              selectedDate.getFullYear() === currentDate.getFullYear();
            
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
                onClick={() => handleDateClick(index + 1)}
                className={`aspect-square p-2 text-center border rounded-lg ${markerColor} 
                  relative cursor-pointer hover:bg-gray-100 
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
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

      {selectedDate && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md mt-4">
          {/* Header with selected date */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-800">
              {dayNames[selectedDate.getDay()]}, {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            
            {/* Summary section like in the image */}
            {selectedDateTransactions.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2"></span>
                    Pemasukan:
                  </span>
                  <span className="text-green-500 font-medium">
                    Rp {formatNumberWithSpaces(calculateSummary().income)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block mr-2"></span>
                    Pengeluaran:
                  </span>
                  <span className="text-red-500 font-medium">
                    -Rp {formatNumberWithSpaces(calculateSummary().expense)}
                  </span>
                </div>
                <div className="border-t pt-1 mt-1">
                  <div className="flex justify-end">
                    <span className="font-medium text-gray-800">
                      Rp {formatNumberWithSpaces(calculateSummary().total)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Transactions list */}
          <div className="divide-y">
            {selectedDateTransactions.map(transaction => {
              const isIncome = transaction.category_type === 'income';
              const formattedDate = new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric'
              });
              
              return (
                <div key={transaction.id} className="flex justify-between p-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{transaction.description || transaction.category_name}</span>
                      <button className="text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.category_name || 'Tidak ada kategori'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formattedDate}
                    </div>
                  </div>
                  <div className={`ml-4 self-center font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '' : '-'}Rp {formatNumberWithSpaces(transaction.amount)}
                  </div>
                </div>
              );
            })}
            
            {selectedDateTransactions.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                Tidak ada transaksi pada tanggal ini
              </div>
            )}
          </div>
          
          {/* Scheduled Events (hidden if in transaction view) */}
          {viewMode === 'terjadwal' && selectedDateEvents.length > 0 && (
            <div className="border-t">
              <h4 className="font-medium text-gray-700 p-4 border-b">Jadwal:</h4>
              <div className="divide-y">
                {selectedDateEvents.map(event => {
                  const isStart = event.start_date.split(' ')[0] === formatDateString(selectedDate);
                  const isEnd = event.end_date.split(' ')[0] === formatDateString(selectedDate);
                  
                  return (
                    <div key={event.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <span className="font-medium">{event.title || 'Tidak ada judul'}</span>
                        <button className="text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-sm text-blue-600">
                        {isStart && isEnd ? 'Mulai & Selesai' : isStart ? 'Mulai' : 'Selesai'}
                        {' - '}
                        {new Date(isStart ? event.start_date : event.end_date).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {event.notes && (
                        <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Kalender;