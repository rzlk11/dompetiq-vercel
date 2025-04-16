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

      // Bersihkan parameter undefined
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await axios.get("http://localhost:5000/scheduled", {
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
      const response = await axios.get("http://localhost:5000/category", {
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
    if(editingTransaction) {
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

      await axios.post("http://localhost:5000/scheduled", transactionData, {
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
      await axios.delete(`http://localhost:5000/scheduled/${id}`, {
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
        `http://localhost:5000/scheduled/${editingTransaction.uuid}`,
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
  };

  const resetFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      type: '',
      category: ''
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
    <div className="flex bg-gray-100 min-h-screen p-4 gap-4">
      {/* Panel Kiri - Riwayat Transaksi Terjadwal */}
      <div className="w-2/3 bg-white p-4 shadow-md rounded-lg">
        <h1 className="text-lg font-medium mb-4">Transaksi Terjadwal</h1>
        
        {/* Tampilkan filter aktif */}
        {(filters.type || filters.category) && (
          <div className="mb-4 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Filter aktif: 
              {filters.type && ` Tipe: ${filters.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`}
              {filters.category && ` Kategori: ${filters.category}`}
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Memuat data...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : scheduledTransactions.length === 0 ? (
          <div className="text-center py-8">Tidak ada transaksi terjadwal yang ditemukan</div>
        ) : (
          <div className="space-y-1">
            {scheduledTransactions.map((transaction) => (
              <div
                key={transaction.uuid}
                className="flex items-center p-3 hover:bg-gray-50 border-b cursor-pointer transition-colors relative"
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {transaction.category || "Tanpa Kategori"}
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {transaction.period}
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {transaction.description}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    Mulai: {formatDate(transaction.start_date)} | 
                    {transaction.end_date && ` Selesai: ${formatDate(transaction.end_date)}`}
                  </div>
                </div>

                <div className="text-right mr-2 font-medium">
                  {transaction.type === "income" ? (
                    <span className="text-green-600">
                      + {formatCurrency(transaction.amount)}
                    </span>
                  ) : (
                    <span className="text-red-600">
                      - {formatCurrency(transaction.amount)}
                    </span>
                  )}
                </div>

                <button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={() => 
                    setActiveTransactionId(prev => 
                      prev === transaction.uuid ? null : transaction.uuid
                    )
                  }
                >
                  <MoreVert fontSize="small" />
                </button>

                {activeTransactionId === transaction.uuid && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-10 bg-white shadow-md rounded-lg p-2 z-10"
                  >
                    <button
                      className="flex items-center w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                      onClick={() => handleEditClick(transaction)}
                    >
                      <Edit fontSize="small" className="mr-2" />
                      Edit
                    </button>
                    <button
                      className="flex items-center w-full px-3 py-2 hover:bg-gray-100 rounded-md"
                      onClick={() => {
                        setDeletingTransaction(transaction);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Delete fontSize="small" className="mr-2" />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Panel Kanan - Filter */}
      <div className="w-1/3 bg-white p-4 shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Filter</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
          <div className="relative">
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({...filters, start_date: e.target.value})}
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
              onChange={(e) => setFilters({...filters, end_date: e.target.value})}
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
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value="expense"
                checked={filters.type === 'expense'}
                onChange={() => setFilters({...filters, type: 'expense'})}
                className="mr-2"
              />
              Pengeluaran
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value="income"
                checked={filters.type === 'income'}
                onChange={() => setFilters({...filters, type: 'income'})}
                className="mr-2"
              />
              Pemasukan
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value=""
                checked={!filters.type}
                onChange={() => setFilters({...filters, type: ''})}
                className="mr-2"
              />
              Semua
            </label>
          </div>
        </div>

        <div className="mb-2">
          <label className="block font-medium mb-1">Periode</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="period"
                value="daily"
                checked={filters.period === "daily"}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              />
              Harian
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="period"
                value="weekly"
                checked={filters.period === "weekly"}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              />
              Mingguan
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="period"
                value="monthly"
                checked={filters.period === "monthly"}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              />
              Bulanan
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="period"
                value="all"
                checked={filters.period === "all"}
                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              />
              Semua
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Kategori</label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
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

        <button 
          className="w-full mt-4 p-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          onClick={applyFilters}
        >
          Terapkan Filter
        </button>

        <button 
          className="w-full mt-2 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          onClick={resetFilters}
        >
          Reset Filter
        </button>
      </div>

      {/* Tombol Aksi */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
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
          className="w-14 h-14 bg-red-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-full max-w-md shadow-lg bg-white rounded">
            <div className="text-center font-semibold text-xl p-4 border-b">
              TAMBAH PEMASUKAN TERJADWAL
            </div>
            <form onSubmit={(e) => handleSubmit(e, true)} className="p-4">
              {/* Jumlah */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Kategori */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                {loadingCategories ? (
                  <div className="p-2 text-center">Memuat kategori...</div>
                ) : categoryError ? (
                  <div className="text-red-500 text-sm">{categoryError}</div>
                ) : (
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Periode */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Periode</label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="monthly">Bulanan</option>
                  <option value="weekly">Mingguan</option>
                  <option value="daily">Harian</option>
                </select>
              </div>

              {/* Tanggal Mulai */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tanggal Berakhir */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Berakhir (Opsional)</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Deskripsi */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-green-500 rounded hover:bg-blue-50"
                  onClick={() => setShowIncomeForm(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-full max-w-md shadow-lg bg-white rounded">
            <div className="text-center font-semibold text-xl p-4 border-b">
              TAMBAH PENGELUARAN TERJADWAL
            </div>
            <form onSubmit={(e) => handleSubmit(e, false)} className="p-4">
              {/* Jumlah */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Kategori */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                {loadingCategories ? (
                  <div className="p-2 text-center">Memuat kategori...</div>
                ) : categoryError ? (
                  <div className="text-red-500 text-sm">{categoryError}</div>
                ) : (
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Periode */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Periode</label>
                <select
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="monthly">Bulanan</option>
                  <option value="weekly">Mingguan</option>
                  <option value="daily">Harian</option>
                </select>
              </div>

              {/* Tanggal Mulai */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Tanggal Berakhir */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Berakhir (Opsional)</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Deskripsi */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 text-green-500 rounded hover:bg-blue-50"
                  onClick={() => setShowExpenseForm(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {editingTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Transaksi Terjadwal</h2>
              <button onClick={() => setEditingTransaction(null)}>
                <Close fontSize="small" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <select
                  name="type"
                  value={editingTransaction.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Jumlah</label>
                <input
                  type="number"
                  name="amount"
                  value={editingTransaction.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Kategori</label>
                {loadingCategories ? (
                  <div className="p-2 text-center">Memuat kategori...</div>
                ) : categoryError ? (
                  <div className="text-red-500 text-sm">{categoryError}</div>
                ) : (
                  <select
                    name="category_name"
                    value={editingTransaction.category_name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
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
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Tanggal Berakhir (Opsional)</label>
                <input
                  type="date"
                  name="end_date"
                  value={editingTransaction.end_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
                <textarea
                  name="description"
                  value={editingTransaction.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded h-24"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 border border-gray-300 rounded"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Hapus Transaksi Terjadwal?</h2>
            <p className="mb-6">Anda yakin ingin menghapus transaksi terjadwal ini?</p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deletingTransaction.uuid)}
                className="px-4 py-2 bg-red-500 text-white rounded"
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