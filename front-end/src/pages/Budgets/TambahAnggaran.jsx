import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../../features/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { addDays, addMonths } from "date-fns";
// Import Material UI icons
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CategoryIcon from "@mui/icons-material/Category";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
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
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const BudgetForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isError } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/login");
    }
  }, [isError, navigate]);

  useEffect(() => {
    selectedDurations("monthly"); // Set default to monthly
  }, []);  

  const [activeTab, setActiveTab] = useState("single");
  const [categoryData, setCategoryData] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    category: {
      id: "",
      name: "",
    },
    period: "",
    source: "All accounts",
    start_date: "",
    end_date: "",
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categories = await axios.get("http://localhost:5000/category");
      setCategoryData(categories.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  // const [incomeCategories, setIncomeCategories] = useState([
  //   {
  //     name: 'Pendapatan Keuangan',
  //     icon: AttachMoneyIcon,
  //     sublist: []
  //   },
  //   {
  //     name: 'Pemasukan',
  //     icon: AccountBalanceWalletIcon,
  //     sublist: [
  //       { name: 'Gaji' },
  //       { name: 'Part time job' }
  //     ]
  //   },
  //   {
  //     name: 'Lain (Pemasukan)',
  //     icon: AddIcon,
  //     sublist: [
  //       { name: 'Tabungan pribadi' }
  //     ]
  //   }
  // ]);

  // // Expense categories with Material UI icons and sublists
  // const [expenseCategories, setExpenseCategories] = useState([
  //   { name: 'Makanan / Minuman', icon: RestaurantIcon, sublist: [] },
  //   { name: 'Berbelanja', icon: ShoppingCartIcon, sublist: [] },
  //   {
  //     name: 'Transportasi',
  //     icon: DirectionsCarIcon,
  //     sublist: [
  //       { name: 'Mobil' },
  //       { name: 'Motor' },
  //       { name: 'Bahan bakar' },
  //       { name: 'Asuransi' }
  //     ]
  //   },
  //   { name: 'Hiburan', icon: SportsEsportsIcon, sublist: [] },
  //   {
  //     name: 'Rumah',
  //     icon: HomeIcon,
  //     sublist: [
  //       { name: 'Tagihan listrik' },
  //       { name: 'Tagihan air' }
  //     ]
  //   },
  //   {
  //     name: 'Keluarga',
  //     icon: FamilyRestroomIcon,
  //     sublist: [
  //       { name: 'Anak' },
  //       { name: 'Istri' }
  //     ]
  //   },
  //   { name: 'Kesehatan / Olahraga', icon: FitnessCenterIcon, sublist: [] },
  //   { name: 'Hewan Peliharaan', icon: PetsIcon, sublist: [] },
  //   {
  //     name: 'Liburan',
  //     icon: BeachAccessIcon,
  //     sublist: [
  //       { name: 'Akomodasi' },
  //       { name: 'Transportasi' }
  //     ]
  //   },
  //   {
  //     name: 'Lain (Pengeluaran)',
  //     icon: MoreHorizIcon,
  //     sublist: [
  //       { name: 'Pajak' }
  //     ]
  //   }
  // ]);

  const durations = [
    { label: "1 Minggu", value: "weekly" },
    { label: "1 Bulan", value: "monthly" },
  ];

  const selectedDurations = (period) => {
    const start_date = new Date();
    let end_date;
  
    if (period === "weekly") {
      end_date = addDays(start_date, 7);
    } else {
      end_date = addMonths(start_date, 1);
    }
  
    setFormData((prev) => ({
      ...prev,
      period,
      start_date: start_date.toISOString().split("T")[0],
      end_date: end_date.toISOString().split("T")[0],
    }));
  };
  

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "period") {
      selectedDurations(value);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/budgets", {
        amount: formData.amount,
        categoryId: formData.category.id,
        period: formData.period,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });
    } catch (error) {
      console.error(error);
    }
    // Navigate to anggaran page
    navigate("/anggaran");
  };

  const handleCancel = () => {
    // Navigate to anggaran page
    navigate("/anggaran");
  };

  const openCategoryModal = () => {
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const selectCategory = (category) => {
    setFormData({
      ...formData,
      category: {
        id: category.id,
        name: category.name,
      },
    });
    closeCategoryModal();
  };

  // const toggleExpandCategory = (categoryName) => {
  //   if (expandedCategory === categoryName) {
  //     setExpandedCategory(null);
  //   } else {
  //     setExpandedCategory(categoryName);
  //   }
  // };

  const filteredCategories = [...categoryData].filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md shadow-lg bg-white rounded">
        <div className="p-0">
          <div className="text-center font-semibold text-xl p-4 border-b">
            BUAT ANGGARAN BARU
          </div>
          <form onSubmit={handleSubmit} className="p-4">
            {/* Budget Amount */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="mr-4 text-gray-700">
                  <AttachMoneyIcon />
                </div>
                <label className="block text-sm font-medium">
                  Jumlah Anggaran
                </label>
              </div>
              <div className="flex">
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan jumlah"
                />
                <span className="p-2 border border-l-0 rounded-r bg-white">
                  Rp
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="mr-4 text-gray-700">
                  <CategoryIcon />
                </div>
                <label className="block text-sm font-medium">Kategori</label>
              </div>
              {activeTab === "all" ? (
                <div className="p-2 bg-gray-100 border rounded">
                  Semua Kategori
                </div>
              ) : (
                <div
                  onClick={openCategoryModal}
                  className="w-full p-2 border rounded focus:outline-none cursor-pointer bg-white"
                >
                  {formData.category.name
                    ? formData.category.name
                    : "Pilih Kategori"}
                </div>
              )}
            </div>
            {/* Duration - now shown in all tabs */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="mr-4 text-gray-700">
                  <AccessTimeIcon />
                </div>
                <label className="block text-sm font-medium">Durasi</label>
              </div>
              <select
                name="period"
                value={formData.period}
                onChange={(e) => selectedDurations(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {durations.map((duration, index) => (
                  <option key={index} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                className="px-4 py-2 text-green-500 rounded hover:bg-blue-50"
                onClick={handleCancel}
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

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          {/* Modal Backdrop - changed to fully transparent to show the budget form */}
          <div className="absolute inset-0 bg-transparent"></div>

          <div
            className="w-full max-w-md rounded shadow-lg z-10 "
            style={{ backgroundColor: "#f7f7f7" }}
          >
            <div className="text-center font-semibold text-xl p-4 border-b">
              SELECT CATEGORY
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded-l focus:outline-none"
                placeholder="Search..."
              />
              <button className="bg-green-500 text-white px-3 rounded-r">
                <SearchIcon />
              </button>
            </div>

            {/* Categories List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredCategories.map((category, index) => (
                <div key={index} className="border-b">
                  <div
                    className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectCategory(category)}
                  >
                    <div className="flex-grow">{category.name}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 flex justify-end">
              <button
                onClick={closeCategoryModal}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetForm;
