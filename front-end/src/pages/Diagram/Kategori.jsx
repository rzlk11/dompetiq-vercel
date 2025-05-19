import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getMe } from "../../features/authSlice";
import { CalendarToday } from "@mui/icons-material";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Chart configuration functions
const getPieOptions = (kategoriValue) => {
  return {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: `Distribusi Kategori ${kategoriValue}`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce(
              (a, b) => a + b,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: Rp ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };
};

const getBarOptions = (kategoriValue) => {
  return {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Distribusi Kategori ${kategoriValue}`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Rp ${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "Rp " + value.toLocaleString();
          },
        },
      },
    },
  };
};

const Kategori = () => {
  const dispatch = useDispatch();
  const chartResultRef = useRef(null);

  // State declarations
  const [kategori, setKategori] = useState("Pengeluaran");
  const [tipeDiagram, setTipeDiagram] = useState("Lingkaran");

  // Date state
  const [dariTanggal, setDariTanggal] = useState("");
  const [keTanggal, setKeTanggal] = useState("");
  const [dariTanggalDisplay, setDariTanggalDisplay] = useState("DD/MM/YY");
  const [keTanggalDisplay, setKeTanggalDisplay] = useState("DD/MM/YY");
  const [periodeWaktu, setPeriodeWaktu] = useState("30 hari terakhir");

  // UI state
  const [isMobile, setIsMobile] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Di bagian state declarations
  const [rekening, setRekening] = useState("Semua Rekening");
  const [daftarRekening, setDaftarRekening] = useState(["Semua Rekening"]);

  const [jumlahTransaksi, setJumlahTransaksi] = useState(0);

  // Chart data state - moved from global to component state
  const [chartData, setChartData] = useState({
    labels: [
      "Makanan",
      "Transportasi",
      "Hiburan",
      "Belanja",
      "Kesehatan",
      "Lainnya",
    ],
    datasets: [
      {
        data: [250000, 150000, 100000, 200000, 80000, 120000],
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        borderWidth: 1,
      },
    ],
  });
  const isChartDataKosong = () => {
    const labelsKosong =
      chartData.labels.length === 1 && chartData.labels[0] === "Tidak ada data";
    const nilaiKosong =
      chartData.datasets[0].data.length === 1 &&
      chartData.datasets[0].data[0] === 1;
    return labelsKosong && nilaiKosong;
  };

  const fetchRekeningList = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rekening`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Tambahkan opsi "Semua Rekening" di awal array
      const rekeningList = [
        "Semua Rekening",
        ...response.data.map((rek) => rek.name),
      ];
      setDaftarRekening(rekeningList);
    } catch (err) {
      console.error("Error fetching rekening:", err);
    }
  }, []);

  // Initial data loading
  useEffect(() => {
    dispatch(getMe());
    checkIfMobile();
    fetchRekeningList();

    window.addEventListener("resize", checkIfMobile);
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, [dispatch, fetchRekeningList]);

  // Page title and initial date range
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("setPageTitle", {
        detail: "Diagram: Kategori",
      })
    );

    updateDateRange("30 hari terakhir");
  }, []);

  // Scroll to report when it's shown
  useEffect(() => {
    if (showReport) {
      setTimeout(scrollToResults, 100);
    }
  }, [showReport]);

  // Function to check if device is mobile
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  // Function to fetch category data based on filters
  const fetchCategoryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Parameter untuk request
      const params = {
        start_date: dariTanggal,
        end_date: keTanggal,
      };

      // Tambahkan parameter rekening jika bukan "Semua Rekening"
      if (rekening !== "Semua Rekening") {
        params.rekening = rekening;
      }

      // Ambil semua transaksi berdasarkan filter
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Olah data di frontend
      const transactions = response.data;

      // Filter berdasarkan jenis kategori (jika bukan "Keduanya")
      const filteredTransactions =
        kategori !== "Keduanya"
          ? transactions.filter(
              (t) =>
                t.category_type ===
                (kategori === "Pemasukan" ? "income" : "expense")
            )
          : transactions;

      setJumlahTransaksi(filteredTransactions.length);
      // Kelompokkan transaksi berdasarkan kategori
      const categorySummary = filteredTransactions.reduce(
        (acc, transaction) => {
          const categoryName = transaction.category || "Lainnya";
          if (!acc[categoryName]) {
            acc[categoryName] = 0;
          }
          acc[categoryName] += parseFloat(transaction.amount);
          return acc;
        },
        {}
      );

      // Format untuk ChartJS
      const labels = Object.keys(categorySummary);
      const dataValues = Object.values(categorySummary);

      setChartData({
        labels: labels.length > 0 ? labels : ["Tidak ada data"],
        datasets: [
          {
            data: dataValues.length > 0 ? dataValues : [1],
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ].slice(0, labels.length || 1),
            borderWidth: 1,
          },
        ],
      });
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dariTanggal, keTanggal, kategori, rekening]); // Tambahkan rekening sebagai dependency

  // Function to update date range based on period
  const updateDateRange = (selectedPeriod) => {
    const today = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
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
        const lastDayOfPreviousMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        // Use lastDayOfPreviousMonth if we're showing last month
        if (selectedPeriod === "Bulan lalu") {
          today.setTime(lastDayOfPreviousMonth.getTime());
        }
        break;
      case "Tahun ini":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case "Custom":
        // Tidak mengubah tanggal yang sudah ada
        return;
      default:
        break;
    }

    // Format tanggal untuk input date
    const formatInputDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const startDateFormatted = formatInputDate(startDate);
    const endDateFormatted = formatInputDate(today);

    setDariTanggal(startDateFormatted);
    setKeTanggal(endDateFormatted);
    setDariTanggalDisplay(formatDateForDisplay(startDateFormatted));
    setKeTanggalDisplay(formatDateForDisplay(endDateFormatted));
  };

  // Date format functions
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "DD/MM/YY";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year.slice(-2)}`;
  };

  const formatDateForInput = (displayDate) => {
    if (displayDate === "DD/MM/YY") return "";
    const [day, month, yearShort] = displayDate.split("/");
    const year = `20${yearShort}`;
    return `${year}-${month}-${day}`;
  };

  // Event handlers
  const handlePeriodeChange = (e) => {
    const selectedPeriod = e.target.value;
    setPeriodeWaktu(selectedPeriod);
    updateDateRange(selectedPeriod);
  };

  const handleDariTanggalChange = (e) => {
    const dateValue = e.target.value;
    setDariTanggal(dateValue);
    setDariTanggalDisplay(formatDateForDisplay(dateValue));
    setPeriodeWaktu("Custom");
  };

  const handleKeTanggalChange = (e) => {
    const dateValue = e.target.value;
    setKeTanggal(dateValue);
    setKeTanggalDisplay(formatDateForDisplay(dateValue));
    setPeriodeWaktu("Custom");
  };

  // Handler for kategori change that will hide the report
  const handleKategoriChange = (value) => {
    setKategori(value);
    setShowReport(false);
  };

  const handleRekeningChange = (e) => {
    setRekening(e.target.value);
    setShowReport(false); // Sembunyikan laporan saat rekening berubah
  };

  // Scroll function
  const scrollToResults = () => {
    if (chartResultRef.current) {
      chartResultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Render chart results
  const renderChartResult = useCallback(() => {
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

    return (
      <div
        ref={chartResultRef}
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          width: "100%",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "#333",
            fontSize: "18px",
            fontWeight: "500",
          }}
        >
          Hasil Laporan Kategori {kategori}
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "20px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: isMobile ? "100%" : "60%",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            {tipeDiagram === "Lingkaran" ? (
              <Pie data={chartData} options={getPieOptions(kategori)} />
            ) : (
              <Bar data={chartData} options={getBarOptions(kategori)} />
            )}
          </div>

          <div
            style={{
              width: isMobile ? "100%" : "40%",
              marginTop: isMobile ? "20px" : "0",
            }}
          >
            <div
              style={{
                backgroundColor: "#f8f8f8",
                borderRadius: "8px",
                padding: "15px",
                border: "1px solid #eee",
              }}
            >
              <h4
                style={{
                  marginBottom: "15px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                Ringkasan
              </h4>

              <div style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>
                    {kategori === "Pengeluaran"
                      ? "Total Pengeluaran:"
                      : kategori === "Pemasukan"
                      ? "Total Pemasukan:"
                      : "Total Transaksi:"}
                  </span>
                  <span style={{ fontWeight: "500" }}>
                    Rp{" "}
                    {chartData.datasets[0].data
                      .reduce((a, b) => a + b, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>Jumlah Transaksi:</span>
                  <span style={{ fontWeight: "500" }}>{jumlahTransaksi}</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Kategori Tertinggi:</span>
                  <span style={{ fontWeight: "500" }}>
                    {(() => {
                      // Temukan kategori dengan nilai tertinggi
                      const maxIndex = chartData.datasets[0].data.indexOf(
                        Math.max(...chartData.datasets[0].data)
                      );
                      const maxCategory = chartData.labels[maxIndex];
                      const total = chartData.datasets[0].data.reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = Math.round(
                        (chartData.datasets[0].data[maxIndex] / total) * 100
                      );

                      return `${maxCategory} (${percentage}%)`;
                    })()}
                  </span>
                </div>
              </div>

              <hr
                style={{
                  margin: "15px 0",
                  borderColor: "#ddd",
                  borderStyle: "solid",
                }}
              />

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "5px 0" }}>
                      Kategori
                    </th>
                    <th style={{ textAlign: "right", padding: "5px 0" }}>
                      Jumlah
                    </th>
                    <th style={{ textAlign: "right", padding: "5px 0" }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.labels.map((label, index) => {
                    const value = chartData.datasets[0].data[index];
                    const total = chartData.datasets[0].data.reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percentage = Math.round((value / total) * 100);

                    return (
                      <tr key={index}>
                        <td
                          style={{
                            padding: "5px 0",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              backgroundColor:
                                chartData.datasets[0].backgroundColor[index],
                              borderRadius: "2px",
                            }}
                          ></div>
                          {label}
                        </td>
                        <td style={{ textAlign: "right", padding: "5px 0" }}>
                          Rp {value.toLocaleString()}
                        </td>
                        <td style={{ textAlign: "right", padding: "5px 0" }}>
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }, [showReport, chartData, kategori, tipeDiagram, isMobile]);

  return (
    <div
      style={{
        padding: isMobile ? "10px" : "20px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: isMobile ? "15px" : "30px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <form>
          {/* Category Type Selection */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "500",
              }}
            >
              Tampilkan semua kategori dari:
            </label>
            <div
              style={{
                display: "flex",
                gap: "20px",
                flexDirection: isMobile ? "column" : "row",
                flexWrap: isMobile ? "nowrap" : "wrap",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      kategori === "Pengeluaran" ? "#3498db" : "#ccc"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {kategori === "Pengeluaran" && (
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#3498db",
                      }}
                    ></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="kategori"
                  value="Pengeluaran"
                  checked={kategori === "Pengeluaran"}
                  onChange={(e) => handleKategoriChange(e.target.value)}
                  style={{ display: "none" }}
                />
                Pengeluaran
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      kategori === "Pemasukan" ? "#3498db" : "#ccc"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {kategori === "Pemasukan" && (
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#3498db",
                      }}
                    ></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="kategori"
                  value="Pemasukan"
                  checked={kategori === "Pemasukan"}
                  onChange={(e) => handleKategoriChange(e.target.value)}
                  style={{ display: "none" }}
                />
                Pemasukan
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      kategori === "Keduanya" ? "#3498db" : "#ccc"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {kategori === "Keduanya" && (
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#3498db",
                      }}
                    ></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="kategori"
                  value="Keduanya"
                  checked={kategori === "Keduanya"}
                  onChange={(e) => handleKategoriChange(e.target.value)}
                  style={{ display: "none" }}
                />
                Keduanya
              </label>
            </div>
          </div>

          {/* Date Range Selection */}
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              marginBottom: "25px",
              gap: "15px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Dari:
              </label>
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
                    appearance: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#666",
                  }}
                >
                  <CalendarToday style={{ fontSize: "18px" }} />
                </div>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "8px",
                }}
              >
                Ke:
              </label>
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
                    appearance: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#666",
                  }}
                >
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
                width: isMobile ? "100%" : "auto",
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

          {/* Account Selection */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                fontWeight: "500",
                marginRight: "10px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Rekening:
            </label>
            <select
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: isMobile ? "100%" : "300px",
                backgroundColor: "white",
              }}
              value={rekening}
              onChange={handleRekeningChange}
            >
              {daftarRekening.map((rek, index) => (
                <option key={index} value={rek}>
                  {rek}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Selection */}
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "500",
              }}
            >
              Tipe Diagram:
            </label>
            <div
              style={{
                display: "flex",
                gap: "20px",
                flexDirection: isMobile ? "column" : "row",
                flexWrap: isMobile ? "nowrap" : "wrap",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      tipeDiagram === "Lingkaran" ? "#3498db" : "#ccc"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tipeDiagram === "Lingkaran" && (
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#3498db",
                      }}
                    ></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="tipeDiagram"
                  value="Lingkaran"
                  checked={tipeDiagram === "Lingkaran"}
                  onChange={(e) => setTipeDiagram(e.target.value)}
                  style={{ display: "none" }}
                />
                Diagram Lingkaran
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      tipeDiagram === "Batang" ? "#3498db" : "#ccc"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {tipeDiagram === "Batang" && (
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#3498db",
                      }}
                    ></div>
                  )}
                </div>
                <input
                  type="radio"
                  name="tipeDiagram"
                  value="Batang"
                  checked={tipeDiagram === "Batang"}
                  onChange={(e) => setTipeDiagram(e.target.value)}
                  style={{ display: "none" }}
                />
                Diagram Batang
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div
            style={{
              display: "flex",
              justifyContent: isMobile ? "center" : "flex-end",
            }}
          >
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
                width: isMobile ? "100%" : "auto",
              }}
              onClick={() => {
                // Fetch data when showing report
                if (!showReport) {
                  fetchCategoryData();
                }
                setShowReport(!showReport);
              }}
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

export default Kategori;
