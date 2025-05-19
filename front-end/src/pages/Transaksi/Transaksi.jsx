import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../features/authSlice";
import axios from "axios";
import { 
  KeyboardArrowLeft,
  KeyboardArrowRight,
  MoreVert,
  Add,
  Remove,
  CalendarToday,
  KeyboardArrowDown,
  Close,
  Search,
  ExpandMore,
  Edit,
  Delete,
  AttachMoney,
} from "@mui/icons-material";

const Transaksi = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError, token } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
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
  const [rekenings, setRekenings] = useState([]);
  
  const [formData, setFormData] = useState({
    amount: "",
    rekening_name: "",
    type: "",
    category_name: "",
    is_scheduled: "false",
    notes: "",
  });

  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    rekening: "",
    type: "",
    category: "",
  });

  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(getMe());
    fetchTransactions();
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveTransactionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        rekening: filters.rekening || undefined,
        type: filters.type || undefined,
        category: filters.category || undefined,
      };

      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let filteredData = response.data;
      if (filters.category) {
        filteredData = filteredData.filter(
          (transaction) =>
            transaction.category?.toLowerCase() ===
            filters.category.toLowerCase()
        );
      }

      setTransactions(filteredData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchRekenings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rekening`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRekenings(response.data);
    } catch (err) {
      setError("Gagal memuat daftar rekening");
    }
  };

  // Panggil di useEffect:
  useEffect(() => {
    fetchRekenings();
  }, []);

  const fetchCategories = async (type = null) => {
    setLoadingCategories(true);
    setCategoryError(null);
    try {
      const params = {};
      if (type) params.type = type;
      
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/category`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (err) {
      setCategoryError(err.response?.data?.msg || "Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "type" && value) {
      fetchCategories(value);
      setFormData((prev) => ({
        ...prev,
        category_name: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/transactions`, {
        ...formData,
          is_scheduled: formData.is_scheduled === "true",
        },
        {
        headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTransactions();
      setShowIncomeForm(false);
      setShowExpenseForm(false);
      setFormData({
        amount: "",
        rekening_name: "",
        type: "",
        category_name: "",
        is_scheduled: "false",
        notes: "",
      });
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create transaction");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTransactions();
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete transaction");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/transactions/${editingTransaction.uuid}`,
        {
          ...formData,
          is_scheduled: formData.is_scheduled === "true",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTransactions();
      setEditingTransaction(null);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update transaction");
    }
  };

  const applyFilters = () => {
    fetchTransactions();
    if (window.innerWidth < 768) {
      setFilterExpanded(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      type: "",
      category: "",
    });
    fetchTransactions();
  };

  const handleEditClick = (transaction) => {
    setFormData({
      amount: transaction.amount,
      rekening_name: transaction.rekening,
      type: transaction.category_type,
      category_name: transaction.category,
      is_scheduled: transaction.is_scheduled ? "true" : "false",
      notes: transaction.notes || "",
    });
    setEditingTransaction(transaction);
    fetchCategories(transaction.category_type);
  };

  const toggleFilter = () => {
    setFilterExpanded(!filterExpanded);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      {/* Page Header with Filter Toggle for Mobile */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-4 py-3 sm:py-4 flex justify-between items-center">
        <h1 className="text-lg font-medium"> Riwayat Transaksi</h1>
        <button
          className="md:hidden flex items-center justify-center p-2 bg-gray-100 rounded-full"
          onClick={toggleFilter}
        >
          <span className="sr-only">Toggle Filters</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3.293 9.293a1 1 0 011.414 0L12 16.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414z"
            />
          </svg>
        </button>
      </div>

      {/* Main Content with Responsive Layout */}
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
        {/* Transaction List Panel */}
        <div className="order-2 md:order-1 w-full md:w-2/3 bg-white p-4 shadow-md rounded-lg">
          <div className="h-full flex flex-col">
            {/* Active filters indicator */}
            {(filters.type || filters.category || filters.rekening) && (
              <div className="mb-3 p-2 bg-blue-50 rounded-lg text-sm">
                <p className="text-blue-800">
                  Active filters:
                  {filters.type &&
                    ` Type: ${
                      filters.type === "income" ? "Income" : "Expense"
                    }`}
                  {filters.category && ` Category: ${filters.category}`}
                  {filters.rekening && ` Rekening: ${filters.rekening}`}
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
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada transaksi yang ditemukan
                </div>
              ) : (
                <div className="space-y-1">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.uuid}
                      className="flex items-center p-3 hover:bg-gray-50 border-b cursor-pointer transition-colors relative"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {transaction.category || "No Category"}
                          {transaction.is_scheduled && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Terjadwal
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-sm truncate">
                          {transaction.notes || "No notes"}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-gray-600 mr-2 whitespace-nowrap">
                        {formatDate(transaction.createdAt)}
                      </div>

                      <div className="text-right whitespace-nowrap font-medium mr-2">
                        <span
                          className={
                            transaction.category_type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.category_type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>

                      <button
                        className="p-1.5 hover:bg-gray-100 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTransactionId((prev) =>
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
        <div
          className={`order-1 md:order-2 w-full md:w-1/3 bg-white shadow-md rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${
            filterExpanded || window.innerWidth >= 768
              ? "max-h-screen"
              : "max-h-0 md:max-h-screen p-0 md:p-4"
          }`}
        >
          {(filterExpanded || window.innerWidth >= 768) && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Filter</h2>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {" "}
                  Tanggal Mulai
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) =>
                      setFilters({ ...filters, start_date: e.target.value })
                    }
                    className="w-full p-2 border rounded appearance-none"
                  />
                  <CalendarToday
                    fontSize="small"
                    className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Tanggal Akhir
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) =>
                      setFilters({ ...filters, end_date: e.target.value })
                    }
                    className="w-full p-2 border rounded appearance-none"
                  />
                  <CalendarToday
                    fontSize="small"
                    className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Rekening
                </label>
                <select
                  value={filters.rekening}
                  onChange={(e) =>
                    setFilters({ ...filters, rekening: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="">Semua Rekening</option>
                  {rekenings.map((rekening) => (
                    <option key={rekening.uuid} value={rekening.name}>
                      {rekening.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="filterType"
                      value="expense"
                      checked={filters.type === "expense"}
                      onChange={() =>
                        setFilters({ ...filters, type: "expense" })
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">Pengeluaran</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="filterType"
                      value="income"
                      checked={filters.type === "income"}
                      onChange={() =>
                        setFilters({ ...filters, type: "income" })
                      }
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
                      onChange={() => setFilters({ ...filters, type: "" })}
                      className="mr-2"
                    />
                    <span className="text-sm">Semua</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                  disabled={loadingCategories}
                >
                  <option value="">Semua Kategori</option>
                  {loadingCategories ? (
                    <option value="" disabled>
                      Loading categories...
                    </option>
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
                  Terapkan Filters
                </button>

                <button
                  className="w-full p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-20">
        <button
          aria-label="Add Income"
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors transform hover:scale-105"
          onClick={() => {
            setFormData({
              amount: "",
              type: "income",
              category_name: "",
              is_scheduled: "false",
              notes: "",
            });
            fetchCategories("income");
            setShowIncomeForm(true);
          }}
        >
          <Add fontSize="medium" />
        </button>
        <button
          aria-label="Add Expense"
          className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors transform hover:scale-105"
          onClick={() => {
            setFormData({
              amount: "",
              type: "expense",
              category_name: "",
              is_scheduled: "false",
              notes: "",
            });
            fetchCategories("expense");
            setShowExpenseForm(true);
          }}
        >
          <Remove fontSize="medium" />
        </button>
      </div>

      {/* Income Form Modal */}
      {showIncomeForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4  bg-opacity-50">
          <div className="w-full max-w-md shadow-lg bg-white rounded-lg overflow-hidden">
            <div className="text-center font-semibold text-xl p-4 border-b flex justify-between items-center">
              <div className="flex-1 text-center">Tambah Pemasukan</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowIncomeForm(false)}
              >
                <Close />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
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
                <label className="block text-sm font-medium mb-1">
                  Rekening
                </label>
                <select
                  name="rekening_name"
                  value={formData.rekening_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Pilih Rekening</option>
                  {rekenings.map((rekening) => (
                    <option key={rekening.uuid} value={rekening.name}>
                      {rekening.name}
                    </option>
                  ))}
                </select>
              </div>

              <input type="hidden" name="type" value="income" />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>
                {loadingCategories ? (
                  <div className="p-3 text-center border rounded-lg bg-gray-50">
                    Loading categories...
                  </div>
                ) : categoryError ? (
                  <div className="p-3 text-red-500 text-sm border rounded-lg bg-red-50">
                    {categoryError}
                  </div>
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
                <label className="block text-sm font-medium mb-1">
                  {" "}
                  Transaksi Terjadwal
                </label>
                <select
                  name="is_scheduled"
                  value={formData.is_scheduled}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="false">Tidak</option>
                  <option value="true">Ya</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-green-500 rounded-lg hover:bg-green-50 transition-colors"
                  onClick={() => setShowIncomeForm(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-opacity-50">
          <div className="w-full max-w-md shadow-lg bg-white rounded-lg overflow-hidden">
            <div className="text-center font-semibold text-xl p-4 border-b flex justify-between items-center">
              <div className="flex-1 text-center">Tambah Pengeluaran</div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowExpenseForm(false)}
              >
                <Close />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
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
                <label className="block text-sm font-medium mb-1">
                  Rekening
                </label>
                <select
                  name="rekening_name"
                  value={formData.rekening_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Pilih Rekening</option>
                  {rekenings.map((rekening) => (
                    <option key={rekenings.uuid} value={rekening.name}>
                      {rekening.name} (Saldo: {formatCurrency(rekening.balance)}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <input type="hidden" name="type" value="expense" />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>
                {loadingCategories ? (
                  <div className="p-3 text-center border rounded-lg bg-gray-50">
                    Loading categories...
                  </div>
                ) : categoryError ? (
                  <div className="p-3 text-red-500 text-sm border rounded-lg bg-red-50">
                    {categoryError}
                  </div>
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
                <label className="block text-sm font-medium mb-1">
                  {" "}
                  Transaksi Terjadwal
                </label>
                <select
                  name="is_scheduled"
                  value={formData.is_scheduled}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="false">Tidak</option>
                  <option value="true">Ya</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-green-500 rounded-lg hover:bg-green-50 transition-colors"
                  onClick={() => setShowExpenseForm(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4  bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Transaksi</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditingTransaction(null)}
              >
                <Close fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Pilih Tipe</option>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah</label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Rekening
                </label>
                <select
                  name="rekening_name"
                  value={formData.rekening_name}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">Pilih Rekening</option>
                  {rekenings.map((rekening) => (
                    <option key={rekening.uuid} value={rekening.name}>
                      {rekening.name} (Saldo: {formatCurrency(rekening.balance)}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>
                {loadingCategories ? (
                  <div className="p-3 text-center border rounded-lg bg-gray-50">
                    Loading categories...
                  </div>
                ) : categoryError ? (
                  <div className="text-red-500 text-sm">{categoryError}</div>
                ) : categories.length === 0 ? (
                  <select
                    className="w-full p-3 border rounded-lg bg-gray-100"
                    disabled
                  >
                    <option>Pilih jenisnya terlebih dahulu</option>
                  </select>
                ) : (
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
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
                <label className="block text-sm font-medium mb-1">
                  Transaksi Terjadwal?
                </label>
                <select
                  name="is_scheduled"
                  value={formData.is_scheduled}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Simpan perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4  bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Hapus Transaksi?</h2>
            <p className="mb-6 text-gray-600">
              Anda yakin ingin menghapus transaksi ini?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deletingTransaction.uuid)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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

export default Transaksi;
