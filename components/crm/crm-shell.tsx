"use client";

import CRMSidebar from "@/components/crm/sidebar";
import CRMTopbar from "@/components/crm/topbar";

export default function CRMShellLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <CRMSidebar />

            {/* Main Content (offset by sidebar width) */}
            <div className="lg:ml-[260px] transition-all duration-300">
                <CRMTopbar />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
