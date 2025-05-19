import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generatePDFReport = async (data) => {
  try {
    console.log("Generating PDF with data:", data);
    
    // Collection for report data
    let pdfData = {
      income: [],
      expense: [],
      accounts: [],
      budget: []
    };
    
    if (data.includes.accounts) {
      try {
        const rekeningResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rekening`);
        
        if (rekeningResponse.data && Array.isArray(rekeningResponse.data)) {
          const transactionsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions`, {
            params: { grouped: true }
          });
          
          pdfData.accounts = rekeningResponse.data.map(rekening => {
            const matchedTransaction = Array.isArray(transactionsResponse.data) ? 
              transactionsResponse.data.find(t => t.rekening_uuid === rekening.uuid) : null;
            
            return {
              name: rekening.name,
              balance: matchedTransaction ? matchedTransaction.finalBalance : parseFloat(rekening.balance) || 0
            };
          });
        }
      } catch (error) {
        console.error("Error fetching accounts data:", error);
      }
    }
    
   
    try {
      const requestData = {...data};
      
      if (data.includes.accounts) {
        requestData.includes = {...data.includes, accounts: false};
      }
      
      if (data.includes.income || data.includes.expense || data.includes.budget) {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/pdf`, requestData, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.data) {
          if (data.includes.income && response.data.income) {
            pdfData.income = response.data.income;
          }
          if (data.includes.expense && response.data.expense) {
            pdfData.expense = response.data.expense;
          }
          if (data.includes.budget && response.data.budget) {
            pdfData.budget = response.data.budget;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching PDF data from API:", error);
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Laporan Keuangan - ${data.period}`, 15, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Tipe Laporan: ${data.type}`, 15, 30);
    doc.text(`Rekening: ${data.account}`, 15, 35);
    doc.text(
      `Tanggal Dicetak: ${new Date().toLocaleDateString("id-ID")}`,
      15,
      40
    );

    let yPos = 50;

    if (data.includes.income || data.includes.expense) {
      const totalIncome = data.includes.income && Array.isArray(pdfData.income)
        ? pdfData.income.reduce((sum, item) => sum + item.amount, 0)
        : 0;

      const totalExpense = data.includes.expense && Array.isArray(pdfData.expense)
        ? pdfData.expense.reduce((sum, item) => sum + item.amount, 0)
        : 0;

      const netAmount = totalIncome - totalExpense;

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Ringkasan", 15, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      if (data.includes.income) {
        doc.text(`Total Pemasukan: ${formatCurrency(totalIncome)}`, 20, yPos);
        yPos += 5;
      }

      if (data.includes.expense) {
        doc.text(`Total Pengeluaran: ${formatCurrency(totalExpense)}`, 20, yPos);
        yPos += 5;
      }

      if (data.includes.income || data.includes.expense) {
        doc.setFont("helvetica", "bold");
        doc.text(`Selisih Bersih: ${formatCurrency(netAmount)}`, 20, yPos);
        yPos += 10;
      }
    }

    if (data.includes.income && Array.isArray(pdfData.income) && pdfData.income.length > 0) {
      yPos += 5;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Pemasukan", 15, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["Tanggal", "Kategori", "Jumlah"]],
        body: pdfData.income.map((item) => [
          item.date,
          item.category,
          formatCurrency(item.amount),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [39, 174, 96] },
        columnStyles: {
          2: { halign: "left" },
        },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (data.includes.expense && Array.isArray(pdfData.expense) && pdfData.expense.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Pengeluaran", 15, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["Tanggal", "Kategori", "Jumlah"]],
        body: pdfData.expense.map((item) => [
          item.date,
          item.category,
          formatCurrency(item.amount),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [231, 76, 60] },
        columnStyles: {
          2: { halign: "left" },
        },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (data.includes.accounts && Array.isArray(pdfData.accounts) && pdfData.accounts.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Rekening", 15, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["Nama Rekening", "Saldo"]],
        body: pdfData.accounts.map((item) => [
          item.name,
          formatCurrency(item.balance),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [52, 152, 219] },
        columnStyles: {
          1: { halign: "left" },
        },
      });

      yPos = doc.lastAutoTable.finalY + 10;
    } else if (data.includes.accounts) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Rekening", 15, yPos);
      yPos += 5;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Tidak ada data rekening yang tersedia.", 20, yPos);
      yPos += 10;
    }

    if (data.includes.budget && Array.isArray(pdfData.budget) && pdfData.budget.length > 0) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Anggaran", 15, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [["Kategori", "Anggaran",]],
        body: pdfData.budget.map((item) => [
          item.category,
          formatCurrency(item.budgeted),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [155, 89, 182] },
        columnStyles: {
          0: { halign: "left" },
          1: { halign: "left" },
        },
      });
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
      doc.text(
        "Dibuat dengan Aplikasi Keuangan DompetIQ",
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    }

    doc.save(`Laporan-Keuangan-${data.period.replace(/\s+/g, "-")}.pdf`);
  } catch (error) {
    console.error("Error generating PDF report:", error);
    alert("Terjadi kesalahan saat membuat laporan PDF. Silakan coba lagi.");
  }
};
