import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Plus, MoreVertical, X, ChevronDown } from "lucide-react";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID").format(amount);
};

const AccountCard = ({ account, onOpenMenu, menuOpen, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg mb-3 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="font-medium text-gray-800">{account.rekening}</div>
          {/* <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>{" "}
            {account.type}
          </div> */}
          {account.notes && (
            <div className="text-xs text-gray-600 mt-2 italic">
              {account.notes}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <div
            className={`mr-3 text-right ${
              account.finalBalance < 0 ? "text-red-500" : "text-green-600"
            } font-medium`}
          >
            {account.finalBalance < 0 ? "-" : ""}Rp {formatCurrency(account.finalBalance)}
          </div>
          <div className="relative">
            <button
              onClick={() => onOpenMenu(account.rekening_uuid)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <MoreVertical size={18} className="text-gray-500" />
            </button>

            {menuOpen === account.rekening_uuid && (
              <div className="absolute right-0 top-8 bg-white shadow-lg rounded-md z-10 w-44 py-1 overflow-hidden">
                <div
                  className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700 flex items-center gap-2"
                  onClick={() => {
                    onEdit(account);
                    onOpenMenu(null); // Close menu after selecting an option
                  }}
                >
                  Edit rekening
                </div>
                <div
                  className="px-4 py-2.5 hover:bg-red-50 cursor-pointer text-red-500 flex items-center gap-2"
                  onClick={() => {
                    onDelete(account);
                    onOpenMenu(null); 
                  }}
                >
                  Hapus rekening
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AddAccountModal = ({ newAccount, setNewAccount, onClose, onSave, isEdit }) => {
  return (
    <div className="fixed inset-0  bg-opacity-30  flex items-center justify-center z-20 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto animate-fadeIn">
        <div className="p-5">
          <h2 className="text-xl font-bold mb-5 text-gray-800">
            {isEdit ? "Edit Rekening" : "Rekening Baru"}
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Nama
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              placeholder="Nama rekening"
              value={newAccount.name}
              onChange={(e) =>
                setNewAccount({ ...newAccount, name: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Jumlah Awal
            </label>
            <div className="flex items-center">
              <div className="flex-1 relative">
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  placeholder="0"
                  value={newAccount.balance}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, balance: e.target.value })
                  }
                />
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3">
                  <span className="text-gray-500">Rp</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              className="px-4 py-2.5 mr-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
              onClick={onSave}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteAccountModal = ({ account, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0  bg-opacity-30 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto p-5">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Hapus Rekening</h2>
        <p className="text-sm text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus rekening{" "}
          <strong>{account.rekening}</strong>?
        </p>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 mr-3 text-gray-700 hover:bg-gray-100 rounded-lg transition font-medium"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            onClick={onConfirm}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Banking Interface Component
export default function Rekening() {
  const [accounts, setAccounts] = useState([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: "",
    notes: "",
  });
  const [editAccount, setEditAccount] = useState(null);
  const [deleteAccount, setDeleteAccount] = useState(null);
  const containerRef = useRef(null);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/transactions`, {
        params: { grouped: true }
      });
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };
  
  // Fetch accounts from backend
  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && containerRef.current && !containerRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleAddAccount = async () => {
    try {
      // Use the original structure for compatibility
      const accountData = {
        name: newAccount.name,
        balance: parseFloat(newAccount.balance) || 0,
        notes: ""
      };
      
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/rekening`, accountData);
      
      fetchAccounts();
      setShowAddAccount(false);
      setNewAccount({ name: "", balance: "", notes: "" });
    } catch (error) {
      console.error('Failed to add account:', error);
      fetchAccounts();
    }
  };

  const handleEditAccount = async () => {
    if (!editAccount) return;
    
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/rekening/${editAccount.rekening_uuid}`,
        {
          name: editAccount.name,
          balance: parseFloat(editAccount.balance || 0),
          notes: ""
        }
      );
      
      fetchAccounts();
      setShowEditAccount(false);
      setEditAccount(null);
    } catch (error) {
      console.error('Failed to edit account:', error);
      fetchAccounts();
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccount) return;
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/${deleteAccount.rekening_uuid}`
      );
      
      fetchAccounts();
      setShowDeleteAccount(false);
      setDeleteAccount(null);
    } catch (error) {
      console.error("Failed to delete account:", error);
      fetchAccounts();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-lg md:my-6 md:min-h-0 md:rounded-xl lg:max-w-lg" ref={containerRef}>
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <div className="text-xs text-gray-500 flex items-center">
            <span className="mr-1">▼</span> Rekening Saya
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Total:{" "}
              <span className="text-green-600 font-semibold">
                Rp{" "}
                {formatCurrency(
                  accounts.reduce((sum, acc) => sum + acc.finalBalance, 0)
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.rekening_uuid}
              account={account}
              menuOpen={menuOpen}
              onOpenMenu={setMenuOpen}
              onEdit={(account) => {

                setEditAccount({
                  uuid: account.rekening_uuid,
                  name: account.rekening,
                  balance: account.finalBalance,
                  notes: ""
                });
                setShowEditAccount(true);
              }}
              onDelete={(account) => {
                setDeleteAccount({
                  uuid: account.rekening_uuid,
                  rekening: account.rekening
                });
                setShowDeleteAccount(true);
              }}
            />
          ))}
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-10">
        <button
          onClick={() => setShowAddAccount(true)}
          className="bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
          aria-label="Tambah rekening baru"
        >
          <Plus size={24} />
        </button>
      </div>

      {showAddAccount && (
        <AddAccountModal
          newAccount={newAccount}
          setNewAccount={setNewAccount}
          onClose={() => setShowAddAccount(false)}
          onSave={handleAddAccount}
          isEdit={false}
        />
      )}
      {showEditAccount && editAccount && (
        <AddAccountModal
          newAccount={editAccount}
          setNewAccount={setEditAccount}
          onClose={() => setShowEditAccount(false)}
          onSave={handleEditAccount}
          isEdit={true}
        />
      )}
      {showDeleteAccount && deleteAccount && (
        <DeleteAccountModal
          account={deleteAccount}
          onClose={() => setShowDeleteAccount(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
}
