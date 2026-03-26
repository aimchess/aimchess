"use client";

import { useEffect, useState } from "react";
import CRMShellLayout from "@/components/crm/crm-shell";
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Loader2,
    Check,
    Filter,
} from "lucide-react";

export default function StudentsPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        stage: "BEGINNER",
        coachId: "",
        joiningDate: "",
        birthDate: "",
        address: "",
        parentName: "",
        parentPhone: "",
        photoUrl: "",
        idCardUrl: "",
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                const mapped = data.map((u: any) => ({
                    ...u,
                    status: u.status || "ACTIVE",
                }));
                setUsers(mapped);
                setCoaches(
                    mapped.filter(
                        (u: any) => u.role === "COACH" || u.role === "ADMIN"
                    )
                );
            }
        } catch (e) {
            console.error("Failed to fetch users", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingId ? "PUT" : "POST";
        const payload = editingId ? { ...formData, id: editingId } : formData;

        try {
            const res = await fetch("/api/admin/users", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchUsers();
                resetForm();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to save user");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleStatus = async (user: any) => {
        const newStatus = user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
        if (
            !confirm(
                `Are you sure you want to ${newStatus === "BLOCKED" ? "block" : "activate"
                } ${user.name}?`
            )
        )
            return;
        try {
            const res = await fetch("/api/admin/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: user.id, status: newStatus }),
            });
            if (res.ok) fetchUsers();
        } catch (e) {
            console.error(e);
        }
    };

    const openEdit = (user: any) => {
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            stage: user.stage,
            coachId: user.coachId || "",
            password: "",
            joiningDate: user.joiningDate
                ? new Date(user.joiningDate).toISOString().split("T")[0]
                : "",
            birthDate: user.birthDate
                ? new Date(user.birthDate).toISOString().split("T")[0]
                : "",
            address: user.address || "",
            parentName: user.parentName || "",
            parentPhone: user.parentPhone || "",
            photoUrl: user.photoUrl || "",
            idCardUrl: user.idCardUrl || "",
        });
        setEditingId(user.id);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            password: "",
            role: "STUDENT",
            stage: "BEGINNER",
            coachId: "",
            joiningDate: "",
            birthDate: "",
            address: "",
            parentName: "",
            parentPhone: "",
            photoUrl: "",
            idCardUrl: "",
        });
        setEditingId(null);
    };

    const filteredUsers = users.filter((u) => {
        const matchSearch =
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRole = filterRole === "ALL" || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const roleColors: Record<string, string> = {
        ADMIN: "bg-purple-100 text-purple-700",
        COACH: "bg-blue-100 text-blue-700",
        STUDENT: "bg-gray-100 text-gray-700",
    };

    return (
        <CRMShellLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                            <Users className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                All Users ({filteredUsers.length})
                            </h2>
                            <p className="text-xs text-gray-500">
                                Manage students, coaches, and admins
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-sm font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={16} />
                        Add User
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter size={14} className="text-gray-400" />
                        {["ALL", "STUDENT", "COACH", "ADMIN"].map((role) => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${filterRole === role
                                    ? "bg-gray-900 text-white"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-gray-50/80 border-b border-gray-100">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Stage
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Coach
                                        </th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map((u) => (
                                        <tr
                                            key={u.id}
                                            className={`hover:bg-gray-50/50 transition-colors ${u.status === "BLOCKED" ? "bg-red-50/30" : ""
                                                }`}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                                                        {u.photoUrl ? (
                                                            <img 
                                                                src={u.photoUrl} 
                                                                alt={u.name} 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            u.name?.[0]?.toUpperCase() || "?"
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-sm">
                                                            {u.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {u.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${u.status === "BLOCKED"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-emerald-100 text-emerald-700"
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${u.status === "BLOCKED"
                                                            ? "bg-red-500"
                                                            : "bg-emerald-500"
                                                            }`}
                                                    />
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${roleColors[u.role] || "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {u.role === "STUDENT" ? u.stage : "—"}
                                            </td>
                                            <td className="p-4 text-sm text-sky-600 font-medium">
                                                {u.coach?.name || "—"}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleToggleStatus(u)}
                                                        className={`p-2 rounded-lg transition-colors ${u.status === "BLOCKED"
                                                            ? "text-emerald-600 hover:bg-emerald-50"
                                                            : "text-red-400 hover:bg-red-50"
                                                            }`}
                                                        title={
                                                            u.status === "BLOCKED"
                                                                ? "Activate User"
                                                                : "Block User"
                                                        }
                                                    >
                                                        {u.status === "BLOCKED" ? (
                                                            <Check size={16} />
                                                        ) : (
                                                            <X size={16} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(u)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-20 text-center text-gray-400 text-sm"
                                            >
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingId ? "Edit User" : "Add User"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none"
                                    placeholder={
                                        editingId
                                            ? "Leave blank to keep current"
                                            : "Secure Password"
                                    }
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                    Role
                                </label>
                                <select
                                    className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 outline-none"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                >
                                    <option value="STUDENT">Student</option>
                                    <option value="COACH">Coach</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            {formData.role === "STUDENT" && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                                Chess Level
                                            </label>
                                            <select
                                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white"
                                                value={formData.stage}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, stage: e.target.value })
                                                }
                                            >
                                                <option value="BEGINNER">Beginner</option>
                                                <option value="INTERMEDIATE">Intermediate</option>
                                                <option value="ADVANCED">Advanced</option>
                                                <option value="EXPERT">Expert</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                                Assign Coach
                                            </label>
                                            <select
                                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-white"
                                                value={formData.coachId}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, coachId: e.target.value })
                                                }
                                            >
                                                <option value="">— No Coach —</option>
                                                {coaches.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                                Joining Date
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none"
                                                value={formData.joiningDate}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        joiningDate: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                                Birth Date
                                            </label>
                                            <input
                                                type="date"
                                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none"
                                                value={formData.birthDate}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        birthDate: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                            Address
                                        </label>
                                        <textarea
                                            className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none h-20 resize-none"
                                            placeholder="Student Address"
                                            value={formData.address}
                                            onChange={(e) =>
                                                setFormData({ ...formData, address: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                                Parent Name
                                            </label>
                                            <input
                                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none"
                                                placeholder="Parent Name"
                                                value={formData.parentName}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        parentName: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                                Parent Phone
                                            </label>
                                            <input
                                                className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none"
                                                placeholder="Parent Phone"
                                                value={formData.parentPhone}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        parentPhone: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                                Student Photo
                                            </label>
                                            <input type="file" accept="image/*" className="text-xs w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const formDataCloud = new FormData();
                                                        formDataCloud.append("file", file);
                                                        formDataCloud.append("upload_preset", "aimchess");
                                                        try {
                                                            const res = await fetch("https://api.cloudinary.com/v1_1/dieciekpa/image/upload", {
                                                                method: "POST",
                                                                body: formDataCloud,
                                                            });
                                                            const data = await res.json();
                                                            if (data.secure_url) {
                                                                setFormData({ ...formData, photoUrl: data.secure_url });
                                                            }
                                                        } catch (error) {
                                                            console.error("Cloudinary upload failed", error);
                                                        }
                                                    }
                                                }} />
                                            {formData.photoUrl && <img src={formData.photoUrl} className="w-16 h-16 object-cover rounded-xl mt-2 border border-gray-200" alt="Preview" />}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                                ID Card (Photo)
                                            </label>
                                            <input type="file" accept="image/*" className="text-xs w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const formDataCloud = new FormData();
                                                        formDataCloud.append("file", file);
                                                        formDataCloud.append("upload_preset", "aimchess");
                                                        try {
                                                            const res = await fetch("https://api.cloudinary.com/v1_1/dieciekpa/image/upload", {
                                                                method: "POST",
                                                                body: formDataCloud,
                                                            });
                                                            const data = await res.json();
                                                            if (data.secure_url) {
                                                                setFormData({ ...formData, idCardUrl: data.secure_url });
                                                            }
                                                        } catch (error) {
                                                            console.error("Cloudinary upload failed", error);
                                                        }
                                                    }
                                                }} />
                                            {formData.idCardUrl && <img src={formData.idCardUrl} className="w-16 h-16 object-cover rounded-xl mt-2 border border-gray-200" alt="ID Preview" />}
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2"
                            >
                                {editingId ? "Update User" : "Create User"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </CRMShellLayout>
    );
}
