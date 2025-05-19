import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import axios from "axios";
import {
  KeyboardArrowLeft, KeyboardArrowRight, MoreVert,
  Add, Remove, CalendarToday, KeyboardArrowDown,
  Close, Search, ExpandMore, Edit, Delete
} from "@mui/icons-material";

const HalamanTerjadwal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError, user, token } = useSelector((state) => state.auth);
  const [scheduledTransactions, setScheduledTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [activeTransactionId, setActiveTransactionId] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [filterExpanded, setFilterExpanded] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    period: "monthly",
    start_date: "",
    end_date: "",
    description: "",
    category_name: ""
  });

  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    type: '',
    category: '',
    period: ''
  });

  const incomeFormRef = useRef(null);
  const expenseFormRef = useRef(null);
  const dropdownRef = useRef(null);

  // Toggle filter panel for mobile view
  const toggleFilter = () => {
    setFilterExpanded(!filterExpanded);
  };

  const fetchScheduledTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        type: filters.type || undefined,
        category_name: filters.category || undefined,
        period: filters.period || undefined
      };

      // Clean undefined parameters
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/scheduled`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setScheduledTransactions(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal memuat transaksi terjadwal");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (type = null) => {
    setLoadingCategories(true);
    setCategoryError(null);
    try {
      const params = {};
      if (type) params.type = type;
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/category`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(response.data);
    } catch (err) {
      setCategoryError(err.response?.data?.msg || "Gagal memuat kategori");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingTransaction) {
      setEditingTransaction({
        ...editingTransaction,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    if (name === 'type' && value) {
      fetchCategories(value);
    }
  };

  const handleSubmit = async (e, isIncome) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        type: isIncome ? 'income' : 'expense'
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/scheduled`, transactionData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchScheduledTransactions();
      if (isIncome) {
        setShowIncomeForm(false);
      } else {
        setShowExpenseForm(false);
      }
      setFormData({
        amount: "",
        type: "expense",
        period: "monthly",
        start_date: "",
        end_date: "",
        description: "",
        category_name: ""
      });
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal membuat transaksi terjadwal");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/scheduled/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchScheduledTransactions();
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal menghapus transaksi terjadwal");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/scheduled/${editingTransaction.uuid}`,
        {
          amount: editingTransaction.amount,
          type: editingTransaction.type,
          period: editingTransaction.period,
          start_date: editingTransaction.start_date,
          end_date: editingTransaction.end_date,
          description: editingTransaction.description,
          category_name: editingTransaction.category_name
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchScheduledTransactions();
      setEditingTransaction(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal mengupdate transaksi terjadwal");
    }
  };

  const applyFilters = () => {
    fetchScheduledTransactions();
    // Close filter panel on mobile after applying
    if (window.innerWidth < 768) {
      setFilterExpanded(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      type: '',
      category: '',
      period: ''
    });
    fetchScheduledTransactions();
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    fetchCategories(transaction.type);
  };

  useEffect(() => {
    dispatch(getMe());
    fetchScheduledTransactions();
    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/login");
    }
  }, [isError, navigate]);

  useEffect(() => {
    fetchCategories(filters.type || undefined);
  }, [filters.type]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveTransactionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Page Header with Filter Toggle for Mobile */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 sm:py-4 flex justify-between items-center">
        <h1 className="text-lg font-medium">Transaksi Terjadwal</h1>
        <button
          className="md:hidden flex items-center justify-center p-2 bg-gray-100 rounded-full"
          onClick={toggleFilter}
        >
          <span className="sr-only">Toggle Filters</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3.293 9.293a1 1 0 011.414 0L12 16.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z" />
          </svg>
        </button>
      </div>

      {/* Main Content with Responsive Layout */}
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
        {/* Transaction List Panel */}
        <div className="order-2 md:order-1 w-full md:w-2/3 bg-white p-4 shadow-md rounded-lg">
          <div className="h-full flex flex-col">
            {/* Active filters indicator */}
            {(filters.type || filters.category || filters.period) && (
              <div className="mb-3 p-2 bg-blue-50 rounded-lg text-sm">
                <p className="text-blue-800">
                  Filter aktif:
                  {filters.type && ` Tipe: ${filters.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`}
                  {filters.category && ` Kategori: ${filters.category}`}
                  {filters.period && filters.period !== 'all' && ` Periode: ${filters.period === 'daily' ? 'Harian' :
                      filters.period === 'weekly' ? 'Mingguan' :
                        'Bulanan'
                    }`}
                </p>
              </div>
            )}

            {/* Transaction list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : scheduledTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Tidak ada transaksi terjadwal yang ditemukan</div>
              ) : (
                <div className="space-y-1">
                  {scheduledTransactions.map((transaction) => (
                    <div
                      key={transaction.uuid}
                      className="flex items-center p-3 hover:bg-gray-50 border-b cursor-pointer transition-colors relative"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {transaction.category || "Tanpa Kategori"}
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            {transaction.period}
                          </span>
                        </div>
                        <div className="text-gray-500 text-sm truncate">
                          {transaction.description || "Tanpa deskripsi"}
                        </div>
                        <div className="text-gray-500 text-xs mt-1 truncate">
                          Mulai: {formatDate(transaction.start_date)} |
                          {transaction.end_date && ` Selesai: ${formatDate(transaction.end_date)}`}
                        </div>
                      </div>

                      <div className="text-right whitespace-nowrap font-medium mr-2">
                        <span className={transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>

                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTransactionId(prev =>
                            prev === transaction.uuid ? null : transaction.uuid
                          );
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </button>

                      {activeTransactionId === transaction.uuid && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg p-2 z-10 w-36"
                        >
                          <button
                            className="flex items-center w-full px-3 py-2 hover:bg-gray-100 rounded-md text-left"
                            onClick={() => handleEditClick(transaction)}
                          >
                            <Edit fontSize="small" className="mr-2" />
                            <span>Edit</span>
                          </button>
                          <button
                            className="flex items-center w-full px-3 py-2 hover:bg-gray-100 rounded-md text-left"
                            onClick={() => {
                              setDeletingTransaction(transaction);
                              setShowDeleteModal(true);
                            }}
                          >
                            <Delete fontSize="small" className="mr-2" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className={`order-1 md:order-2 w-full md:w-1/3 bg-white shadow-md rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${filterExpanded || window.innerWidth >= 768 ? 'max-h-screen' : 'max-h-0 md:max-h-screen p-0 md:p-4'}`}>
          {(filterExpanded || window.innerWidth >= 768) && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Filter</h2>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                    className="w-full p-2 border rounded appearance-none"
                  />
                  <CalendarToday
                    fontSize="small"
                    className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Akhir</label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                    className="w-full p-2 border rounded appearance-none"
                  />
                  <CalendarToday
                    fontSize="small"
                    className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="filterType"
                      value="expense"
                      checked={filters.type === 'expense'}
                      onChange={() => setFilters({ ...filters, type: 'expense' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Pengeluaran</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="filterType"
                      value="income"
                      checked={filters.type === 'income'}
                      onChange={() => setFilters({ ...filters, type: 'income' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Pemasukan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="filterType"
                      value=""
                      checked={!filters.type}
                      onChange={() => setFilters({ ...filters, type: '' })}
                      className="mr-2"
                    />
                    <span className="text-sm">Semua</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Periode</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="period"
                      value="daily"
                      checked={filters.period === "daily"}
                      onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Harian</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="period"
                      value="weekly"
                      checked={filters.period === "weekly"}
                      onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Mingguan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="period"
                      value="monthly"
                      checked={filters.period === "monthly"}
                      onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Bulanan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="period"
                      value="all"
                      checked={filters.period === "all" || !filters.period}
                      onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                      className="mr-1"
                    />
                    <span className="text-sm">Semua</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full p-2 border rounded"
                  disabled={loadingCategories}
                >
                  <option value="">Semua Kategori</option>
                  {loadingCategories ? (
                    <option value="" disabled>Memuat kategori...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.uuid} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  className="w-full p-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  onClick={applyFilters}
                >
                  Terapkan Filter
                </button>

                <button
                  className="w-full p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={resetFilters}
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-20">
        <button
          aria-label="Tambah Pemasukan"
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors transform hover:scale-105"
          onClick={() => {
            setFormData({
              amount: "",
              type: "income",
              period: "monthly",
              start_date: "",
              end_date: "",
              description: "",
              category_name: ""
            });
            fetchCategories("income");
            setShowIncomeForm(true);
          }}
        >
          <Add fontSize="medium" />
        </button>
        <button
          aria-label="Tambah Pengeluaran"
          className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors transform hover:scale-105"
          onClick={() => {
            setFormData({
              amount: "",
              type: "expense",
              period: "monthly",
              start_date: "",
              end_date: "",
              description: "",
              category_name: ""
            });
            fetchCategories("expense");
            setShowExpenseForm(true);
          }}
        >
          <Remove fontSize="medium" />
        </button>
      </div>

      {/* Form Pemasukan Terjadwal */}
      {showIncomeForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50  overflow-hidden">
          <div className="w-full max-w-md shadow-lg bg-white rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="text-center font-semibold text-xl p-4 border-b flex justify-between items-center">
              <div className="flex-1 text-center">TAMBAH PEMASUKAN TERJADWAL</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowIncomeForm(false)}
              >
                <Close />
              </button>
            </div>

            <form onSubmit={(e) => handleSubmit(e, true)} className="p-4 overflow-y-auto">
              {/* Form content remains the same */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan Jumlah"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                {loadingCategories ? (
                  <div className="p-3 text-center border rounded-lg bg-gray-50">Memuat kategori...</div>
                ) : categoryError ? (
                  <div className="p-3 text-red-500 text-sm border rounded-lg bg-red-50">{categoryError}</div>
                ) : (
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.uuid} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Periode</label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                  required
                >
                  <option value="monthly">Bulanan</option>
                  <option value="weekly">Mingguan</option>
                  <option value="daily">Harian</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Berakhir (Opsional)</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan deskripsi"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-green-500 rounded-lg hover:bg-green-50 transition-colors"
                  onClick={() => setShowIncomeForm(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Pengeluaran Terjadwal */}
      {showExpenseForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4  bg-opacity-50 overflow-hidden">
          <div className="w-full max-w-md shadow-lg bg-white rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="text-center font-semibold text-xl p-4 border-b flex justify-between items-center">
              <div className="flex-1 text-center">TAMBAH PENGELUARAN TERJADWAL</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowExpenseForm(false)}
              >
                <Close />
              </button>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="p-4 overflow-y-auto">
              {/* Form content remains the same */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan Jumlah"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                {loadingCategories ? (
                  <div className="p-3 text-center border rounded-lg bg-gray-50">Memuat kategori...</div>
                ) : categoryError ? (
                  <div className="p-3 text-red-500 text-sm border rounded-lg bg-red-50">{categoryError}</div>
                ) : (
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.uuid} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Periode</label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                  required
                >
                  <option value="monthly">Bulanan</option>
                  <option value="weekly">Mingguan</option>
                  <option value="daily">Harian</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Berakhir (Opsional)</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan deskripsi"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={() => setShowExpenseForm(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4  bg-opacity-50 overflow-hidden">
          <div className="w-full max-w-md shadow-lg bg-white rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="text-center font-semibold text-xl p-4 border-b flex justify-between items-center">
              <div className="flex-1 text-center">EDIT TRANSAKSI TERJADWAL</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditingTransaction(null)}
              >
                <Close />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-4 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="amount"
                  value={editingTransaction.amount}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan Jumlah"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <select
                  name="type"
                  value={editingTransaction.type}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  required
                >
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                {loadingCategories ? (
                  <div className="p-3 text-center border rounded-lg bg-gray-50">Memuat kategori...</div>
                ) : categoryError ? (
                  <div className="p-3 text-red-500 text-sm border rounded-lg bg-red-50">{categoryError}</div>
                ) : (
                  <select
                    name="category_name"
                    value={editingTransaction.category_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((category) => (
                      <option key={category.uuid} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Periode</label>
                <select
                  name="period"
                  value={editingTransaction.period}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  required
                >
                  <option value="monthly">Bulanan</option>
                  <option value="weekly">Mingguan</option>
                  <option value="daily">Harian</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="start_date"
                  value={editingTransaction.start_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Berakhir (Opsional)</label>
                <input
                  type="date"
                  name="end_date"
                  value={editingTransaction.end_date || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                <textarea
                  name="description"
                  value={editingTransaction.description || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan deskripsi"
                />
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => setEditingTransaction(null)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  UPDATE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4  bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Konfirmasi Hapus</h3>
            <p className="text-gray-700 mb-4">
              Apakah Anda yakin ingin menghapus transaksi terjadwal ini?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                onClick={() => handleDelete(deletingTransaction.uuid)}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanTerjadwal;
