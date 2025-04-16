import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getMe } from '../../features/authSlice';
import axios from "axios";
import AddCircle from "@mui/icons-material/AddCircle";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import LaptopIcon from "@mui/icons-material/Laptop";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CategoryIcon from "@mui/icons-material/Category";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PetsIcon from "@mui/icons-material/Pets";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

function Anggaran() {
  // Add useNavigate hook for routing
  const navigate = useNavigate();
  // protected route
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
  

  // Initial budget data
  const initialWeeklyBudgets = [
    {
      id: "w1",
      name: "Makan di Luar",
      date: "10/03/2025 - 16/03/2025",
      current: 150000,
      total: 500000,
      icon: RestaurantIcon,
      duration: "Anggaran Mingguan",
    },
    {
      id: "w2",
      name: "Hiburan",
      date: "10/03/2025 - 16/03/2025",
      current: 110000,
      total: 350000,
      icon: SportsEsportsIcon,
      duration: "Anggaran Mingguan",
    },
    {
      id: "w3",
      name: "Bahan Bakar",
      date: "17/03/2025 - 23/03/2025",
      current: 350000,
      total: 950000,
      icon: LocalGasStationIcon,
      duration: "Anggaran Mingguan",
    },
  ];

  const initialMonthlyBudgets = [
    {
      id: "m1",
      name: "Tagihan Listrik",
      date: "01/03/2025 - 31/03/2025",
      current: 650000,
      total: 1200000,
      icon: BoltIcon,
      duration: "Anggaran Bulanan",
    },
    {
      id: "m2",
      name: "Sepatu, Pakaian",
      date: "01/03/2025 - 31/03/2025",
      current: 260000,
      total: 750000,
      icon: CheckroomIcon,
      duration: "Anggaran Bulanan",
    },
    {
      id: "m3",
      name: "Teknologi",
      date: "01/03/2025 - 31/03/2025",
      current: 460000,
      total: 1250000,
      icon: LaptopIcon,
      duration: "Anggaran Bulanan",
    },
    {
      id: "m4",
      name: "Berbelanja",
      date: "01/03/2025 - 31/03/2025",
      current: 210000,
      total: 850000,
      icon: ShoppingCartIcon,
      duration: "Anggaran Bulanan",
    },
    {
      id: "m5",
      name: "Pembayaran Online",
      date: "01/03/2025 - 31/03/2025",
      current: 1200000,
      total: 5550000,
      icon: PaymentsIcon,
      duration: "Anggaran Bulanan",
    },
  ];

  // State for weekly and monthly budgets
  const [weeklyBudgets, setWeeklyBudgets] = useState([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [formValues, setFormValues] = useState({
    total: "",
    category: {
      id:"",
      name: ""
    },
    source: "All accounts",
  });

  // State for category selection modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState("");

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const weekly = await axios.get('http://localhost:5000/budgets/period/weekly');
      const monthly = await axios.get('http://localhost:5000/budgets/period/monthly');
      setWeeklyBudgets(weekly.data);
      setMonthlyBudgets(monthly.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await axios.get('http://localhost:5000/category');
      setCategoryData(categories.data);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Category data with icons - updated as specified
  // const categoryData = [
  //   { name: "Makanan / Minuman", icon: RestaurantIcon, sublist: [] },
  //   { name: "Berbelanja", icon: ShoppingCartIcon, sublist: [] },
  //   {
  //     name: "Transportasi",
  //     icon: DirectionsCarIcon,
  //     sublist: [
  //       { name: "Mobil" },
  //       { name: "Motor" },
  //       { name: "Bahan bakar" },
  //       { name: "Asuransi" },
  //     ],
  //   },
  //   { name: "Hiburan", icon: SportsEsportsIcon, sublist: [] },
  //   {
  //     name: "Rumah",
  //     icon: HomeIcon,
  //     sublist: [{ name: "Tagihan listrik" }, { name: "Tagihan air" }],
  //   },
  //   {
  //     name: "Keluarga",
  //     icon: FamilyRestroomIcon,
  //     sublist: [{ name: "Anak" }, { name: "Istri" }],
  //   },
  //   { name: "Kesehatan / Olahraga", icon: FitnessCenterIcon, sublist: [] },
  //   { name: "Hewan Peliharaan", icon: PetsIcon, sublist: [] },
  //   {
  //     name: "Liburan",
  //     icon: BeachAccessIcon,
  //     sublist: [{ name: "Akomodasi" }, { name: "Transportasi" }],
  //   },
  //   {
  //     name: "Lain (Pengeluaran)",
  //     icon: MoreHorizIcon,
  //     sublist: [{ name: "Pajak" }],
  //   },
  // ];


  // Filter categories based on search query
  const filteredCategories = categoryData.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to toggle category expansion
  const toggleExpandCategory = (categoryName) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory("");
    } else {
      setExpandedCategory(categoryName);
    }
  };

  // Function to select a category
  const selectCategory = (category) => {
    setFormValues({
      ...formValues,
      category:{
        id: category.id,
        name: category.name
      }
      
    });
    closeCategoryModal();
  };

  // Function to open category modal
  const openCategoryModal = () => {
    setShowCategoryModal(true);
  };

  // Function to close category modal
  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setSearchQuery("");
    setExpandedCategory("");
  };

  // Categories list
  const categories = [
    "Makanan/Minuman",
    "Berbelanja",
    "Transportasi",
    "Hiburan",
    "Rumah",
    "Keluarga",
    "Kesehatan / Olahraga",
    "Hewan Peliharaan",
    "Liburan",
    "Lain (Pengeluaran)",
  ];

  // Function to handle navigation to add budget page
  const handleAddBudget = () => {
    navigate("/anggaran/tambah");
  };

  // Function to handle edit button click
  const handleEditClick = (budget) => {
    setEditingBudget(budget);
    setFormValues({
      total: budget.amount,
      category:{
        id: budget.category.id,
        name: budget.category.name
      },
      source: "All accounts",
    });
    setShowEditModal(true);
  };

  // Function to handle delete button click
  const handleDeleteClick = (budget) => {
    setDeletingBudget(budget);
    setShowDeleteModal(true);
  };

  // Function to close the edit modal
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingBudget(null);
  };

  // Function to close the delete modal
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingBudget(null);
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  // Function to save edited budget
  const handleSaveBudget = async (budgetId) => {
    try {
      if (editingBudget) {
        const updatedBudget = {
          ...editingBudget,
          amount: parseFloat(formValues.total) || editingBudget.amount,
          category: {
            id: formValues.category.id, // Store the category ID
            name: formValues.category.name || editingBudget.category.name, // Store the category name
          },
        };
  
        // Update the state directly
        if (updatedBudget.period === "weekly") {
          setWeeklyBudgets((prev) =>
            prev.map((budget) =>
              budget.id === updatedBudget.id ? updatedBudget : budget
            )
          );
        } else {
          setMonthlyBudgets((prev) =>
            prev.map((budget) =>
              budget.id === updatedBudget.id ? updatedBudget : budget
            )
          );
        }
      }
  
      // Send the updated data to the backend
      await axios.patch(`http://localhost:5000/budgets/${budgetId}`, {
        amount: formValues.total,
        category_id: formValues.category.id,
      });
  
      // Close the modal and reset editing state
      setShowEditModal(false);
      setEditingBudget(null);
    } catch (error) {
      console.error("Failed to save budget:", error.message);
    }
  };

  // Function to confirm budget deletion
  const handleConfirmDelete = async (budgetId) => {
    setWeeklyBudgets((prev) => prev.filter((budget) => budget.uuid !== budgetId));
    setMonthlyBudgets((prev) => prev.filter((budget) => budget.uuid !== budgetId));
  
    try {
      await axios.delete(`http://localhost:5000/budgets/${budgetId}`);
      setShowDeleteModal(false);
      setDeletingBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error("Failed to delete budget:", error.message);
      fetchBudgets();
    }
  };

  // Function to format currency to Rupiah
  const formatToRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Function to render budget list
  const renderBudgetList = (budgets, title) => (
    <section>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-3">
        {budgets.map((item) => (
          <div key={item.uuid} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-gray-300" />
                <div>
                  <h3 className="font-medium">{item.category.name}</h3>
                  <p className="text-sm text-gray-500">{item.start_date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-sm">
                  {formatToRupiah(item.amount)}
                </p>
                <div className="flex space-x-2">
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => handleEditClick(item)}
                  >
                    <Edit fontSize="small" className="text-gray-500" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <Delete fontSize="small" className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Weekly Budget Section */}
        {renderBudgetList(weeklyBudgets, "Anggaran Mingguan")}

        {/* Monthly Budget Section */}
        {renderBudgetList(monthlyBudgets, "Anggaran Bulanan")}

        {/* Add Budget Button */}
        <button
          className="fixed bottom-6 right-6 bg-green-500 text-white rounded-full p-3 shadow-lg hover:bg-green-600 transition-colors"
          onClick={handleAddBudget}
        >
          <AddCircle sx={{ fontSize: 24 }} />
        </button>

        {/* Edit Budget Modal */}
        {showEditModal && editingBudget && (
          <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
            <div
              className="rounded-lg p-6 w-full max-w-md shadow-xl"
              style={{ backgroundColor: "#f7f7f7" }}
            >
              <h2 className="text-xl font-bold text-center mb-4">
                EDIT ANGGARAN
              </h2>
              <p className="mb-4">Durasi: {editingBudget.period}</p>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <AccountBalanceWalletIcon className="mr-4 text-gray-600" />
                  <label className="block text-gray-700">Jumlah Anggaran</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    name="total"
                    className="border rounded p-2 w-full"
                    value={formValues.total}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2">Rp</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <CategoryIcon className="mr-4 text-gray-600" />
                  <label className="block text-gray-700">Kategori</label>
                </div>
                <div
                  className="border rounded p-2 w-full cursor-pointer flex justify-between items-center"
                  onClick={openCategoryModal}
                >
                  <span>{formValues.category.name || "Pilih kategori"}</span>
                  <ExpandMoreIcon />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <AccountBalanceIcon className="mr-4 text-gray-600" />
                  <label className="block text-gray-700">Sumber</label>
                </div>
                <input
                  type="text"
                  name="source"
                  className="border rounded p-2 w-full"
                  value={formValues.source}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex justify-between">
                <button
                  className="text-green-500 font-medium"
                  onClick={handleCloseModal}
                >
                  BATAL
                </button>
                <button
                  className="bg-green-500 text-white font-medium px-6 py-2 rounded"
                  onClick={() => handleSaveBudget(editingBudget.uuid)}
                >
                  SIMPAN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Budget Confirmation Modal */}
        {showDeleteModal && deletingBudget && (
          <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
            <div
              className="rounded-lg p-6 w-full max-w-md shadow-xl"
              style={{ backgroundColor: "#f7f7f7" }}
            >
              <h2 className="text-xl font-bold text-center mb-6">
                HAPUS "{deletingBudget.category.name.toUpperCase()}" ANGGARAN?
              </h2>

              <div className="mb-4">
                <p className="mb-1">
                  Jumlah Anggaran: {formatToRupiah(deletingBudget.amount)}
                </p>
                <p className="mb-1">Durasi: {deletingBudget.period}</p>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  className="bg-blue-500 text-white font-medium px-6 py-2 rounded"
                  onClick={handleCloseDeleteModal}
                >
                  BACK
                </button>
                <button
                  className="bg-red-500 text-white font-medium px-6 py-2 rounded"
                  onClick={() => handleConfirmDelete(deletingBudget.uuid)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Selection Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50">
            {/* Modal Backdrop - changed to fully transparent to show the budget form */}
            <div className="absolute inset-0 bg-transparent"></div>

            <div
              className="w-full max-w-md rounded shadow-lg z-10"
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
                      onClick={() =>
                        /* category.sublist.length > 0
                           ? toggleExpandCategory(category.name)
                           :*/ selectCategory(category)
                      }
                    >
                      {/* <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        {React.createElement(category.icon, {
                          className: "text-green-500",
                        })}
                      </div> */}
                      <div className="flex-grow">{category.name}</div>
                      {/* {category.sublist.length > 0 && (
                        <ExpandMoreIcon
                          className={`transform ${
                            expandedCategory === category.name
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      )} */}
                    </div>

                    {/* Sublist items if expanded */}
                    {/* {expandedCategory === category.name &&
                      category.sublist.length > 0 && (
                        <div className="pl-16 bg-gray-50">
                          {category.sublist.map((subcategory, subIdx) => (
                            <div
                              key={subIdx}
                              className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                              onClick={() =>
                                selectCategory(category, subcategory)
                              }
                            >
                              {subcategory.name}
                            </div>
                          ))}
                        </div>
                      )} */}
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
    </div>
  );
}

export default Anggaran;
