import { Providers } from "../providers";

export const metadata = {
    title: "AIM Chess Academy CRM",
    description: "Customer Relationship Management for AIM Chess Academy",
};

export default function CRMLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            {children}
        </Providers>
    );
}
