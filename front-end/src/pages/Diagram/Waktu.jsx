import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../../features/authSlice";
import { CalendarToday } from "@mui/icons-material";
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { current } from "@reduxjs/toolkit";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Waktu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isError } = useSelector((state) => state.auth);
  const [tipeData, setTipeData] = useState("PemasukanPengeluaran");
  const [chartData, setChartData] = useState(null);
  
  // State untuk tanggal dalam format YYYY-MM-DD untuk komponen input type="date"
  const [dariTanggal, setDariTanggal] = useState("");
  const [keTanggal, setKeTanggal] = useState("");
  
  // State untuk format tampilan DD/MM/YY 
  const [dariTanggalDisplay, setDariTanggalDisplay] = useState("DD/MM/YY");
  const [keTanggalDisplay, setKeTanggalDisplay] = useState("DD/MM/YY");
  
  const [periodeWaktu, setPeriodeWaktu] = useState("30 hari terakhir");
  const [rekening, setRekening] = useState("Semua Rekening");
  const [daftarRekening, setDaftarRekening] = useState(["Semua Rekening"]);
  
  // State untuk menampilkan laporan
  const [showReport, setShowReport] = useState(false);
  const chartResultRef = useRef(null);
  
  // State untuk mendeteksi ukuran layar
  const [isMobile, setIsMobile] = useState(false);

  const handleRekeningChange = (e) => {
    setRekening(e.target.value);
    setShowReport(false); // Sembunyikan laporan saat rekening berubah
  };

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      navigate("/login");
    }

    // Deteksi ukuran layar saat komponen dimuat
    checkIfMobile();

    // Tambahkan event listener untuk resize window
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [isError, navigate]);

  useEffect(() => {
    const fetchChartData = async () => {
      const data = await getChartData();
      setChartData(data);
    };

    fetchChartData();
  }, [showReport]);


  useEffect(() => {
    fetchAccounts();  
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rekening`);
      setDaftarRekening(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }
  
  // Fungsi untuk mengecek apakah layar mobile
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('setPageTitle', { 
      detail: "Diagram: Waktu" 
    }));
    
    // Set rentang tanggal default saat komponen dimuat
    updateDateRange("30 hari terakhir");
  }, []);
  
  // Fungsi untuk mengupdate rentang tanggal berdasarkan periode yang dipilih
  const updateDateRange = (selectedPeriod) => {
    const today = new Date();
    let startDate = new Date();
    
    switch(selectedPeriod) {
      case "30 hari terakhir":
        startDate.setDate(today.getDate() - 30);
        break;
      case "7 hari terakhir":
        startDate.setDate(today.getDate() - 7);
        break;
      case "Bulan ini":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "Bulan lalu":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        today.setDate(0); // Hari terakhir dari bulan sebelumnya
        break;
      case "Tahun ini":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case "Custom":
        // Tidak mengubah tanggal yang sudah ada
        return;
    }
    
    // Format tanggal untuk input date
    const formatInputDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startDateFormatted = formatInputDate(startDate);
    const endDateFormatted = formatInputDate(today);
    
    setDariTanggal(startDateFormatted);
    setKeTanggal(endDateFormatted);
    setDariTanggalDisplay(formatDateForDisplay(startDateFormatted));
    setKeTanggalDisplay(formatDateForDisplay(endDateFormatted));
  };
  
  // Fungsi untuk mengkonversi format tanggal YYYY-MM-DD ke DD/MM/YY
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "DD/MM/YY";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
  };
  
  // Fungsi untuk mengkonversi DD/MM/YY ke YYYY-MM-DD
  const formatDateForInput = (displayDate) => {
    if (displayDate === "DD/MM/YY") return "";
    const [day, month, yearShort] = displayDate.split('/');
    const year = `20${yearShort}`; // Asumsi tahun 2000-an
    return `${year}-${month}-${day}`;
  };
  
  // Handler untuk perubahan periode
  const handlePeriodeChange = (e) => {
    const selectedPeriod = e.target.value;
    setPeriodeWaktu(selectedPeriod);
    updateDateRange(selectedPeriod);
  };
  
  // Handler untuk perubahan tanggal
  const handleDariTanggalChange = (e) => {
    const dateValue = e.target.value;
    setDariTanggal(dateValue);
    setDariTanggalDisplay(formatDateForDisplay(dateValue));
    // Ubah ke mode custom jika user mengubah tanggal manual
    setPeriodeWaktu("Custom");
  };
  
  const handleKeTanggalChange = (e) => {
    const dateValue = e.target.value;
    setKeTanggal(dateValue);
    setKeTanggalDisplay(formatDateForDisplay(dateValue));
    // Ubah ke mode custom jika user mengubah tanggal manual
    setPeriodeWaktu("Custom");
  };

  const scrollToResults = () => {
    if (chartResultRef.current) {
      chartResultRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Update the handler for type changes to close the report
  const handleTipeDataChange = (value) => {
    // Only update if a different value is selected
    if (tipeData !== value) {
      // Set the new tipeData value
      setTipeData(value);
      
      // Always close the report when changing type
      setShowReport(false);
    }
  };

  const isChartDataKosong = () => {
    const labelsKosong =
      chartData.labels.length === 0;
    const nilaiKosong =
      chartData.datasets[0].data.length === 0;
    return labelsKosong && nilaiKosong;
  };

  // Mock data untuk chart - ini akan diganti dengan data dari API
  const getChartData = async () => {
    try {
      if (tipeData === "PemasukanPengeluaran") {
        let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions`, {
          params: { start_date: dariTanggal, end_date: keTanggal, rekening: (rekening === 'Semua Rekening' ? null : rekening) },
        });
        const transactionAmounts = response.data.map((transaction) => ({
          amount:
            transaction.category_type === "expense"
              ? -Number(transaction.amount)
              : Number(transaction.amount),
        }));

        const labels = response.data.map((transaction) =>
          new Date(transaction.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        );
        return {
          labels: labels,
          datasets: [
            {
              label: "Transaksi",
              data: transactionAmounts.map((t) => t.amount),
              backgroundColor: function (context) {
                const value = context.dataset.data[context.dataIndex];
                return value < 0
                  ? "rgba(255, 99, 132, 0.8)"
                  : "rgba(75, 192, 92, 0.8)";
              },
              borderColor: function (context) {
                const value = context.dataset.data[context.dataIndex];
                return value < 0 ? "rgb(255, 99, 132)" : "rgb(75, 192, 92)";
              },
              borderWidth: 1,
            },
          ],
        };
      } else {
        let response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions`, {
          params: {
            rekening: rekening === "Semua Rekening" ? null : rekening,
            grouped: true,
          },
        });

        const perAccountChanges = {};

        response.data.forEach((rekening) => {
          const accountName = rekening.rekening;
          if (!perAccountChanges[accountName])
            perAccountChanges[accountName] = {};

          const sortedTx = rekening.transactions.sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          sortedTx.forEach((t) => {
            const date = new Date(t.createdAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            console.log(t.amount);
            const signedAmount = +t.amount;
            if (!perAccountChanges[accountName][date]) {
              perAccountChanges[accountName][date] = 0;
            }

            perAccountChanges[accountName][date] += signedAmount;
          });

          // Optionally add initial balance to first transaction date
          if (sortedTx.length > 0) {
            const firstDate = new Date(
              sortedTx[0].createdAt
            ).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            perAccountChanges[accountName][firstDate] =
              (perAccountChanges[accountName][firstDate] || 0) +
              rekening.initialBalance;
          }
        });
        // Combine all dates across accounts
        const allDatesSet = new Set();

        Object.values(perAccountChanges).forEach((dateMap) => {
          Object.keys(dateMap).forEach((date) => allDatesSet.add(date));
        });

        const allDates = Array.from(allDatesSet).sort((a, b) => {
          const [d1, m1, y1] = a.split("/");
          const [d2, m2, y2] = b.split("/");
          return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        });

        // Build labels
        const labels = allDates;

        // Build cumulative balance per date
        const data = [];
        let runningTotal = 0;

        allDates.forEach((date) => {
          for (const account in perAccountChanges) {
            runningTotal += perAccountChanges[account][date] || 0;
          }
          data.push(runningTotal);
        });

        return {
          labels: labels,
          datasets: [
            {
              label: "Transaksi",
              data: data,
              backgroundColor: function (context) {
                const value = context.dataset.data[context.dataIndex];
                return value < 0
                  ? "rgba(255, 99, 132, 0.8)"
                  : "rgba(75, 192, 92, 0.8)";
              },
              borderColor: function (context) {
                const value = context.dataset.data[context.dataIndex];
                return value < 0 ? "rgb(255, 99, 132)" : "rgb(75, 192, 92)";
              },
              borderWidth: 1,
            },
          ],
        };
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: (tipeData === 'PemasukanPengeluaran' ? 'TRANSACTIONS' : 'ACCOUNT BALANCE'),
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let value = context.raw;
            return `${value < 0 ? '-' : ''}Rp ${Math.abs(value).toLocaleString('id-ID')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 90,
          minRotation: 0,
          autoSkipPadding: 5,
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'Rp ' + value.toLocaleString('id-ID');
          },
          font: {
            size: 10
          }
        },
        grid: {
          borderDash: [5, 5]
        }
      }
    }
  };

  const renderChartResult = () => {
    if (!showReport) return null;

    if (isChartDataKosong()) {
      return (
        <div
          ref={chartResultRef}
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            textAlign: "center",
            fontSize: "16px",
            color: "#888",
          }}
        >
          Tidak ada data transaksi untuk periode dan filter yang dipilih.
        </div>
      );
    }

      let totalPemasukan = chartData.datasets[0].data;
      totalPemasukan = totalPemasukan
        .filter((amount) => amount > 0)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      console.log("ini total pemasukan: ", totalPemasukan);

      let totalPengeluaran = chartData.datasets[0].data;
      totalPengeluaran = totalPengeluaran
        .filter((amount) => amount < 0)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      console.log("ini total pengeluaran: ", totalPengeluaran);
    
    return (
      <div 
        ref={chartResultRef}
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          width: "100%"
        }}
      >
        <div style={{ height: "400px", width: "100%" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
        
        {/* Tambahkan rincian transaksi jika diperlukan */}
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "15px" }}>
            Ringkasan Transaksi
          </h3>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            padding: "10px 0",
            borderBottom: "1px solid #eee"
          }}>
            <span>Total Pemasukan:</span>
            <span style={{ fontWeight: "500", color: "#4CAF50" }}>
              Rp {(totalPemasukan).toLocaleString()}
            </span>
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            padding: "10px 0",
            borderBottom: "1px solid #eee"
          }}>
            <span>Total Pengeluaran:</span>
            <span style={{ fontWeight: "500", color: "#F44336" }}>
              Rp {(-totalPengeluaran).toLocaleString()}
            </span>
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            padding: "10px 0",
            fontWeight: "500"
          }}>
            <span>Selisih:</span>
            <span style={{ color: "#2196F3" }}>
              Rp {(totalPemasukan-(-totalPengeluaran)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Effect untuk scroll ke hasil
  useEffect(() => {
    if (showReport) {
      setTimeout(scrollToResults, 100);
    }
  }, [showReport, tipeData]);

  return (
    <div style={{ padding: isMobile ? "10px" : "20px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ 
        border: "1px solid #eee", 
        borderRadius: "8px", 
        padding: isMobile ? "15px" : "30px", 
        backgroundColor: "#f9f9f9",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)" 
      }}>
        <form>
          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
              Tipe:
            </label>
            <div style={{ display: "flex", gap: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ 
                  width: "18px", 
                  height: "18px", 
                  borderRadius: "50%", 
                  border: "2px solid #3498db",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}>
                  {tipeData === "PemasukanPengeluaran" && (
                    <div style={{ 
                      width: "10px", 
                      height: "10px", 
                      borderRadius: "50%", 
                      backgroundColor: "#3498db" 
                    }}></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="tipeData"
                  value="PemasukanPengeluaran"
                  checked={tipeData === "PemasukanPengeluaran"}
                  onChange={(e) => handleTipeDataChange(e.target.value)}
                  style={{ display: "none" }}
                />
                Pemasukan / Pengeluaran
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ 
                  width: "18px", 
                  height: "18px", 
                  borderRadius: "50%", 
                  border: "2px solid #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center" 
                }}>
                  {tipeData === "Saldo" && (
                    <div style={{ 
                      width: "10px", 
                      height: "10px", 
                      borderRadius: "50%", 
                      backgroundColor: "#3498db" 
                    }}></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="tipeData"
                  value="Saldo"
                  checked={tipeData === "Saldo"}
                  onChange={(e) => handleTipeDataChange(e.target.value)}
                  style={{ display: "none" }}
                />
                Saldo
              </label>
            </div>
          </div>

          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: "25px", 
            gap: "15px",
            flexDirection: isMobile ? "column" : "row"
          }}>
            <div style={{ position: "relative", width: isMobile ? "100%" : "auto" }}>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "8px" }}>Dari:</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="date"
                  value={dariTanggal}
                  onChange={handleDariTanggalChange}
                  style={{ 
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: isMobile ? "100%" : "180px",
                    appearance: "none"
                  }}
                />
                <div style={{ 
                  position: "absolute", 
                  right: "12px", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#666"
                }}>
                  <CalendarToday style={{ fontSize: "18px" }} />
                </div>
              </div>
            </div>
            
            <div style={{ position: "relative", width: isMobile ? "100%" : "auto" }}>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "8px" }}>Ke:</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="date"
                  value={keTanggal}
                  onChange={handleKeTanggalChange}
                  style={{ 
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: isMobile ? "100%" : "180px",
                    appearance: "none"
                  }}
                />
                <div style={{ 
                  position: "absolute", 
                  right: "12px", 
                  top: "50%", 
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#666"
                }}>
                  <CalendarToday style={{ fontSize: "18px" }} />
                </div>
              </div>
            </div>
            
            <select 
              value={periodeWaktu}
              onChange={handlePeriodeChange}
              style={{ 
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                marginLeft: isMobile ? "0" : "10px",
                marginTop: isMobile ? "8px" : "32px",
                height: "40px",
                width: isMobile ? "100%" : "auto"
              }}
            >
              <option value="30 hari terakhir">30 hari terakhir</option>
              <option value="7 hari terakhir">7 hari terakhir</option>
              <option value="Bulan ini">Bulan ini</option>
              <option value="Bulan lalu">Bulan lalu</option>
              <option value="Tahun ini">Tahun ini</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ fontWeight: "500", marginRight: "10px", display: "block", marginBottom: "8px" }}>Rekening:</label>
            <select 
              style={{ 
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: isMobile ? "100%" : "300px",
                backgroundColor: "white"
              }}
              value={rekening}
              onChange={handleRekeningChange}
            >
              <option value="Semua Rekening">Semua Rekening</option>
              {daftarRekening.map((rekening, index) => (
                <option key={index} value={rekening.name}>{rekening.name}</option>
              ))}
            </select>
          </div>

          <div style={{ 
            display: "flex", 
            justifyContent: isMobile ? "center" : "flex-end" 
          }}>
            <button
              type="button"
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "500",
                width: isMobile ? "100%" : "auto"
              }}
              onClick={() => setShowReport(!showReport)}
            >
              {showReport ? "Sembunyikan Laporan" : "Tampilkan Laporan"}
            </button>
          </div>
        </form>
        
        {renderChartResult()}
      </div>
    </div>
  );
};

export default Waktu;