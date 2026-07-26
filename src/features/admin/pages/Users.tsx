import { useState } from "react";
import { Search, Eye, EyeOff, Pencil, Trash2, Plus } from "lucide-react";
import WhatsAppPhone from "../../../components/ui/WhatsAppPhone";
import AddUserModal from "../../../components/modals/AddUserModal";
import EditUserModal from "../../../components/modals/EditUserModal";
import ViewUserModal from "../../../components/modals/ViewUserModal";
import Pagination from "../../../components/ui/Pagination";
import { useTranslation } from "react-i18next";
import {
  useStaff,
  useAddStaff,
  useUpdateStaff,
  useDeleteStaff,
} from "../hooks/useStaff";
import { StuffItem } from "../../../types/sttuf";
import { UserFormData } from "../../../lib/schemas/UserSchema";
import { useConfirm } from "../../../hooks/useConfirm";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";

const PasswordCell = ({ password }: { password?: string }) => {
  if (!password) return <span className="text-gray-400">---</span>;
  return <span className="font-mono text-sm text-gray-700">{password}</span>;
};

/** Map a StuffItem from the API to the flat shape the modals & table need */
const toModalUser = (item: StuffItem) => ({
  id: item.id,
  name: item.user.name,
  email: item.user.email,
  phone: item.user.phone,
  countryCode: item.user.code_country || "+20",
  role: item.role?.name || "",
  status: (item.user.status as "active" | "inactive") || "active",
  permissions: [] as string[],
  password: item.user.password || "",
});

type ModalUser = ReturnType<typeof toModalUser>;

export default function Users() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ModalUser | null>(null);
  const itemsPerPage = 7;

  // ── API hooks ──────────────────────────────────────────────────────────
  const { data: staffData, isLoading, isError } = useStaff(searchTerm);
  const addStaff = useAddStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const { confirm, ConfirmDialog } = useConfirm();

  const allUsers: ModalUser[] = (staffData?.stuff ?? []).map(toModalUser);

  const totalPages = Math.ceil(allUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = allUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleAddUser = (userData: UserFormData) =>
    new Promise<boolean>((resolve) => {
      addStaff.mutate(
        {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          code_country: userData.code_country,
          phone: userData.phone,
          roleId: userData.role,
        },
        {
          onSuccess: () => resolve(true),
          onError: () => resolve(false),
        },
      );
    });

  const handleEditUser = (userData: UserFormData & { id: string }) =>
    new Promise<boolean>((resolve) => {
      updateStaff.mutate(
        {
          id: userData.id,
          staff: {
            name: userData.name,
            email: userData.email,
            code_country: userData.code_country,
            phone: userData.phone,
            roleId: userData.role,
            ...(userData.password ? { password: userData.password } : {}),
          },
        },
        {
          onSuccess: () => {
            setSelectedUser(null);
            resolve(true);
          },
          onError: () => resolve(false),
        },
      );
    });

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await confirm({
      title: t("deleteUser"),
      message: t("deleteConfirmUser"),
    });
    if (confirmed) {
      deleteStaff.mutate(userId, {
        onSuccess: () => {},
      });
    }
  };

  const handleViewUser = (user: ModalUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (user: ModalUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 font-medium">
        <span>{t("home")}</span>
        <span>/</span>
        <span className="text-primary">{t("users")}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("userManagement")}
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 btn-primary text-white px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">{t("addNewUser")}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 sticky top-0 z-10">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder={t("search")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pr-12 pl-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-start placeholder:text-gray-400 font-medium"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={itemsPerPage} columns={7} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t("name")}
                  </th>
                  <th className="px-8 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t("email")}
                  </th>
                  <th className="px-8 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t("password")}
                  </th>
                  <th className="px-8 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t("phone")}
                  </th>
                  <th className="px-8 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t("role")}
                  </th>
                  <th className="px-8 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t("status")}
                  </th>
                  <th className="px-8 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isError ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-red-500 font-bold">
                          {t("errorLoadingData")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Search className="w-12 h-12 opacity-20" />
                        <span className="font-medium">{t("noData")}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-blue-50/30 transition-all duration-300"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                            <span className="text-white text-sm font-bold tracking-wider">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-start">
                            <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium">
                              Employee
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm text-gray-600 font-medium">
                          {user.email}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <PasswordCell password={user.password} />
                      </td>
                      <td className="px-8 py-5">
                        <WhatsAppPhone
                          phone={`${user.countryCode} ${user.phone}`}
                          className="text-gray-900 font-semibold"
                        />
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 text-[11px] font-bold uppercase tracking-wide border border-purple-100">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            user.status === "active"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}
                          />
                          {user.status === "active"
                            ? t("active")
                            : t("inactive")}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3 justify-start">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-md rounded-xl transition-all"
                            title={t("view")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* <button
                            onClick={() => handleEditClick(user)}
                            className="p-2.5 bg-blue-50 text-blue-400 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 rounded-xl transition-all"
                            title={t('edit')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button> */}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2.5 bg-red-50 text-red-400 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-200 rounded-xl transition-all"
                            title={t("delete")}
                            disabled={deleteStaff.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEditUser}
          userData={{
            name: selectedUser.name,
            email: selectedUser.email,
            phone: selectedUser.phone,
            code_country: selectedUser.countryCode,
            role: selectedUser.role,
            permissions: selectedUser.permissions,
            password: "",
            id: selectedUser.id,
          }}
        />
      )}

      {selectedUser && (
        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
          userData={selectedUser}
        />
      )}
      {ConfirmDialog}
    </div>
  );
}
