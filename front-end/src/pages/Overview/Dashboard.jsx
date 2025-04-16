import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  MoreVert, 
  AttachMoney, 
  Work, 
  AccountBalanceWallet,
  Close 
} from '@mui/icons-material';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../features/authSlice';
import axios from 'axios';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError, user } = useSelector((state => state.auth));
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [activities, setActivities] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentMonthCount, setCurrentMonthCount] = useState(0);
  const [lastMonthCount, setLastMonthCount] = useState(0);
  const [budgets, setBudgets] = useState([]);
  
  // State for popups and item counts
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [transactionItemCount, setTransactionItemCount] = useState(5);
  const [budgetItemCount, setBudgetItemCount] = useState(5);
  const [tempTransactionItemCount, setTempTransactionItemCount] = useState(5);
  const [tempBudgetItemCount, setTempBudgetItemCount] = useState(5);
  const userId = user?.email; // atau user?.id tergantung dari backend-mu
  console.log("userId:", userId); // untuk debugging
  
  
  useEffect(()=>{
    dispatch(getMe());
    getIncome();
    getExpense();
    getBalance();
    fetchRecentActivities();
    fetchMonthlySummary();
    fetchTransactionHistory();
    fetchMonthlyComparison();
    fetchBudgets();
  }, [dispatch]);


  useEffect(() => {
    console.log("User dari Redux:", user);
  }, [user]);

  const getIncome = async () => {
    try {
      const response = await axios.get("http://localhost:5000/dashboard/income-total", {
        withCredentials: true,
      });
      setIncome(response.data.incomeTotal);
    } catch (error) {
      console.error("Gagal ambil income:", error);
    }
  };

  const getExpense = async () => {
    try {
      const response = await axios.get("http://localhost:5000/dashboard/expense-total", {
        withCredentials: true,
      });
      setExpense(response.data.expenseTotal);
    } catch (error) {
      console.error("Gagal ambil expense:", error);
    }
  };

  const getBalance = async () => {
    try {
      const response = await axios.get("http://localhost:5000/dashboard/balance", {
        withCredentials: true,
      });
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Gagal ambil balance:", error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/dashboard/recent-activity", {
        withCredentials: true,
      });
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching recent activities:", err);
    }
  };

  const fetchMonthlyComparison = async () => {
    try {
      const response = await axios.get("http://localhost:5000/dashboard/monthly-comparison", {
        withCredentials: true,
      });
  
      setCurrentMonthCount(response.data.currentMonthCount || 0);
      setLastMonthCount(response.data.lastMonthCount || 0);
    } catch (error) {
      console.error("Gagal mengambil data perbandingan bulanan:", error);
    }
  };

  const fetchTransactionHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/dashboard/transaction-history", {
        withCredentials: true,
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transaction history:", err);
    }
  };

  const fetchMonthlySummary = async () => {
    try {
      const response = await axios.get("http://localhost:5000/dashboard/monthly-summary", {
        withCredentials: true,
      });

      const rawData = response.data;

      // Ubah dari object ke array format yang diinginkan
      const formatted = Object.entries(rawData).map(([month, value]) => ({
        name: monthMap[month] || month,
        value: value
      }));

      setMonthlySummary(formatted);
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/dashboard/budgets", {
        withCredentials: true,
      });
      setBudgets(res.data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
    }
  };

  useEffect(()=>{
    if(isError){
      navigate('/login');
    };
  }, [isError, navigate]);

  // Monthly chart data
  const monthMap = {
    Januari: "Jan",
    Februari: "Feb",
    Maret: "Mar",
    April: "Apr",
    Mei: "Mei",
    Juni: "Jun",
    Juli: "Jul",
    Agustus: "Agu",
    September: "Sep",
    Oktober: "Okt",
    November: "Nov",
    Desember: "Des"
  };

  // Handler for transaction dialog
  const handleTransactionDialogOpen = () => {
    setTempTransactionItemCount(transactionItemCount);
    setTransactionDialogOpen(true);
  };

  const handleTransactionDialogClose = () => {
    setTransactionDialogOpen(false);
  };

  const handleTransactionSave = () => {
    setTransactionItemCount(tempTransactionItemCount);
    setTransactionDialogOpen(false);
  };

  // Handler for budget dialog
  const handleBudgetDialogOpen = () => {
    setTempBudgetItemCount(budgetItemCount);
    setBudgetDialogOpen(true);
  };

  const handleBudgetDialogClose = () => {
    setBudgetDialogOpen(false);
  };

  const handleBudgetSave = () => {
    setBudgetItemCount(tempBudgetItemCount);
    setBudgetDialogOpen(false);
  };

  // Get limited transactions based on selected count
  const getLimitedTransactions = () => {
    return transactions.slice(0, transactionItemCount);
  };

  // Get limited budgets based on selected count
  const getLimitedBudgets = () => {
    return budgets.slice(0, budgetItemCount);
  };

  const total = 100;
  const currentPercentage = total > 0 ? (currentMonthCount / total) * 100 : 0;
  const lastPercentage = total > 0 ? (lastMonthCount / total) * 100 : 0;

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Total Balance Card */}
        <div className="bg-black text-white rounded-lg p-4 relative">
          <div className="absolute top-3 right-3">
            <MoreVert fontSize="small" />
          </div>
          <div className="flex items-center mb-2">
            <div className="bg-green-500 p-2 rounded-full mr-2">
              <AccountBalanceWallet fontSize="small" style={{ color: 'white' }} />
            </div>
          </div>
          <div className="text-sm opacity-70 mb-1">Jumlah Saldo</div>
          <div className="text-xl font-bold">Rp {income.toLocaleString()}</div>
        </div>
        
        {/* Total Expenses Card */}
        <div className="bg-white rounded-lg p-4 relative">
          <div className="absolute top-3 right-3">
            <MoreVert fontSize="small" />
          </div>
          <div className="flex items-center mb-2">
            <div className="bg-gray-200 p-2 rounded-full mr-2">
              <Work fontSize="small" style={{ color: 'black' }} />
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-1">Jumlah pengeluaran</div>
          <div className="text-xl font-bold">Rp {expense.toLocaleString()}</div>
        </div>
        
        {/* Saved Money Card */}
        <div className="bg-white rounded-lg p-4 relative">
          <div className="absolute top-3 right-3">
            <MoreVert fontSize="small" />
          </div>
          <div className="flex items-center mb-2">
            <div className="bg-gray-200 p-2 rounded-full mr-2">
              <AttachMoney fontSize="small" style={{ color: 'black' }} />
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-1">Uang disimpan</div>
          <div className="text-xl font-bold">Rp {balance.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1">
          {/* Summary Chart */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Ringkasan</h2>
            </div>
            <div className="relative h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} allowDecimals={false} />
                  <Bar dataKey="value" fill="#00E676" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Riwayat Transaksi</h2>
              <MoreVert 
                fontSize="small" 
                onClick={handleTransactionDialogOpen} 
                style={{ cursor: 'pointer' }} 
              />
            </div>
            <div className="space-y-4">
              {getLimitedTransactions().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium">{transaction.category?.name || 'No Category'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{transaction.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Dialog */}
          <Dialog
            open={transactionDialogOpen}
            onClose={handleTransactionDialogClose}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>TRANSAKSI</DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="normal">
                <InputLabel>Jumlah Input Yang Ditampilkan</InputLabel>
                <Select
                  value={tempTransactionItemCount}
                  label="Jumlah Input Yang Ditampilkan"
                  onChange={(e) => setTempTransactionItemCount(e.target.value)}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleTransactionDialogClose} color="primary">
                BATAL
              </Button>
              <Button onClick={handleTransactionSave} color="primary">
                SIMPAN
              </Button>
            </DialogActions>
          </Dialog>
        </div>

        <div className="md:col-span-1">
          {/* Activities Bubble Chart */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Aktivitas</h2>
            </div>
            <div className="relative h-48 flex items-center justify-center">
              {activities[0] && (
                <div className="absolute bg-green-500 rounded-full w-32 h-32 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="font-bold">Rp {activities[0].amount}</div>
                    <div className="text-xs">{activities[0].category?.name || 'No Category'}</div>
                  </div>
                </div>
              )}
              {activities[1] && (
                <div className="absolute top-24 right-24 bg-gray-200 rounded-full w-20 h-20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="font-bold text-sm">Rp {activities[1].amount}</div>
                    <div className="text-xs">{activities[1].category?.name || 'No Category'}</div>
                  </div>
                </div>
              )}
              {activities[2] && (
                <div className="absolute bottom-4 left-16 bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="font-bold text-xs">Rp {activities[2].amount}</div>
                    <div className="text-xs">{activities[2].category?.name || 'No Category'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Perbandingan (Bulan)</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm mb-1">
                  Bulan ini ({currentMonthCount} transaksi)
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${currentPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="text-sm mb-1">
                  Bulan lalu ({lastMonthCount} transaksi)
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-800 h-2 rounded-full"
                    style={{ width: `${lastPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Anggaran</h2>
              <MoreVert 
                fontSize="small" 
                onClick={handleBudgetDialogOpen} 
                style={{ cursor: 'pointer' }} 
              />
            </div>
            <div className="space-y-4">
              {getLimitedBudgets().map((budget) => (
                <div key={budget.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{budget.amount}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{budget.category.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Dialog */}
          <Dialog
            open={budgetDialogOpen}
            onClose={handleBudgetDialogClose}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>ANGGARAN</DialogTitle>
            <DialogContent>
              <FormControl fullWidth margin="normal">
                <InputLabel>Jumlah item yang ditampilkan</InputLabel>
                <Select
                  value={tempBudgetItemCount}
                  label="Jumlah item yang ditampilkan"
                  onChange={(e) => setTempBudgetItemCount(e.target.value)}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleBudgetDialogClose} color="primary">
                BATAL
              </Button>
              <Button onClick={handleBudgetSave} color="primary">
                SIMPAN
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;