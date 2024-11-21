import CardWrapper from "../../ui/dashboard/cards";
import RevenueChart from "../../ui/dashboard/revenue-chart";
import LatestInvoices from "../../ui/dashboard/latest-invoices";
import { lusitana } from "../../ui/fonts";
//import { fetchCardData, fetchLatestInvoices} from "../../lib/data";
//import { LatestInvoice, Revenue } from "../../lib/definitions";
import { Suspense } from "react";
import { CardsSkeleton, LatestInvoicesSkeleton, RevenueChartSkeleton } from "@/app/ui/skeletons";

export default async function Page() {
    //const revenuew: Revenue[] = awawit fetch
    //const latestInvoices: LatestInvoice[] = await fetchLatestInvoices() || [];
    //const {totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers} = await fetchCardData();
    return (
        <main>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Dashboard</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* <Card title="Collected" value={totalPaidInvoices} type="collected" /> 
                <Card title="Pending" value={totalPendingInvoices} type="pending" />
                <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
                <Card title="Total Customers" value={numberOfCustomers} type="customers" /> */}
                <Suspense fallback={<CardsSkeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                {/* <RevenueChar revenue={revenue} /> */}
                <Suspense fallback={<RevenueChartSkeleton />}>
                <RevenueChart />
                </Suspense>
                {/* <LastestInvoices latestInvoices={latestInvoices} */}
                <Suspense fallback={<LatestInvoicesSkeleton />}>
                    <LatestInvoices />
                </Suspense>
            </div>
        </main>
    );

}