"use client";

import { useState } from "react";
import CRMSidebar from "@/components/crm/sidebar";
import CRMTopbar from "@/components/crm/topbar";

export default function CRMShellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <CRMSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content (offset by sidebar width on desktop) */}
            <div className="lg:ml-[260px] transition-all duration-300">
                <CRMTopbar onMenuToggle={() => setSidebarOpen(true)} />
                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
