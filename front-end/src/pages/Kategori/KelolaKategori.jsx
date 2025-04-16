import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../features/authSlice';
import axios from "axios";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import HomeIcon from "@mui/icons-material/Home";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PetsIcon from "@mui/icons-material/Pets";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

const KelolaKategori = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isError, user, token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("pemasukan");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

  // Fetch categories dari backend
  const fetchCategories = async (type) => {
    try {
      const response = await axios.get(`http://localhost:5000/category`, {
        params: { type },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  // Load data
  const loadCategories = async () => {
    try {
      setLoading(true);
      const type = activeTab === 'pemasukan' ? 'income' : 'expense';
      const data = await fetchCategories(type);
      
      const transformed = data.map(item => ({
        uuid: item.uuid,
        name: item.name,
        type: item.type,
        icon: getIconComponent(item.name),
        sublist: []
      }));
      
      setCategories(transformed);
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal memuat kategori");
    } finally {
      setLoading(false);
    }
  };

  // Pilih ikon berdasarkan nama kategori
  const getIconComponent = (name) => {
    const iconMap = {
      "Pendapatan Keuangan": AttachMoneyIcon,
      "Pemasukan": AccountBalanceWalletIcon,
      "Makanan / Minuman": RestaurantIcon,
      "Berbelanja": ShoppingCartIcon,
      "Transportasi": DirectionsCarIcon,
      "Hiburan": SportsEsportsIcon,
      "Rumah": HomeIcon,
      "Keluarga": FamilyRestroomIcon,
      "Kesehatan / Olahraga": FitnessCenterIcon,
      "Hewan Peliharaan": PetsIcon,
      "Liburan": BeachAccessIcon,
      "Lain (Pemasukan)": AddIcon,
      "Lain (Pengeluaran)": MoreHorizIcon
    };
    return iconMap[name] || MoreHorizIcon;
  };

  // Handle create category
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const type = activeTab === "pemasukan" ? "income" : "expense";
      await axios.post(`http://localhost:5000/category`, 
        { name: newCategoryName, type },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setNewCategoryName("");
      setShowAddDialog(false);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal membuat kategori");
    }
  };

  // Handle update category
  const handleUpdateCategory = async (uuid, newName) => {
    try {
      await axios.patch(`http://localhost:5000/category/${uuid}`, 
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setEditingItem(null);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal memperbarui kategori");
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (uuid) => {
    try {
      await axios.delete(`http://localhost:5000/category/${uuid}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      loadCategories();
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Gagal menghapus kategori");
    }
  };

  // Toggle expand category
  const toggleExpand = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Start editing
  const startEditing = (index) => {
    setEditingItem(index);
    setEditingText(categories[index].name);
  };

  // Save edit
  const saveEdit = (index) => {
    if (!editingText.trim()) return;
    handleUpdateCategory(categories[index].uuid, editingText);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingItem(null);
    setEditingText("");
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditingItem(null);
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/login");
    }
  }, [isError, navigate]);

  useEffect(() => {
    loadCategories();
  }, [activeTab]);

  // Render category list
  const renderCategories = () => {
    if (loading) return <div className="text-center py-4">Memuat...</div>;
    if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

    return categories.map((category, index) => {
      return (
        <div key={category.uuid} className="border rounded mb-2">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center">
              {editingItem === index ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                  autoFocus
                />
              ) : (
                <span>{category.name}</span>
              )}
            </div>
            <div className="flex items-center">
              {editingItem === index ? (
                <>
                  <button
                    onClick={() => saveEdit(index)}
                    className="text-green-500 mr-2"
                  >
                    <CheckIcon sx={{ fontSize: 18 }} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-red-500"
                  >
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(index)}
                    className="text-blue-500 mr-2"
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </button>
                  <button
                    onClick={() =>{
                      setDeletingCategory(category)
                      setShowDeleteModal(true)
                      }}
                    className="text-red-500 mr-2"
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </button>
                  
                </>
              )}
            </div>
          </div>

          {expandedCategories[category.name] && category.sublist.length > 0 && (
            <div className="pl-10 pr-3 pb-3">
              {category.sublist.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className="border-t flex items-center justify-between py-2"
                >
                  <div className="flex items-center">
                    <ArrowRightIcon sx={{ fontSize: 18 }} className="text-gray-400 mr-2" />
                    <span>{subItem.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow">
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === "pemasukan" ? "bg-gray-100" : "bg-white"
            }`}
            onClick={() => handleTabChange("pemasukan")}
          >
            Pemasukan
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === "pengeluaran" ? "bg-gray-100" : "bg-white"
            }`}
            onClick={() => handleTabChange("pengeluaran")}
          >
            Pengeluaran
          </button>
        </div>

        {/* Category List */}
        <div className="p-4">
          {renderCategories()}
        </div>
      </div>

      {/* Add Button */}
      <div className="fixed bottom-6 right-6">
        <button
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
          onClick={() => setShowAddDialog(true)}
        >
          <AddCircleIcon sx={{ fontSize: 24 }} />
        </button>
      </div>

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">
                Tambah Kategori Baru ({activeTab === "pemasukan" ? "Pemasukan" : "Pengeluaran"})
              </h2>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nama Kategori</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="border rounded w-full px-3 py-2"
                  placeholder="Masukkan nama kategori"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end space-x-2">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleCreateCategory}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Hapus Category?</h2>
            <p className="mb-6">Anda yakin ingin menghapus category ini?</p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={() => 
                  handleDeleteCategory(deletingCategory.uuid)
                }
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

export default KelolaKategori;