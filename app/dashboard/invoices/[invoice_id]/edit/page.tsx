import Form from "@/app/ui/invoices/edit-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";

export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const invoice_id = params.id;
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(invoice_id),
        fetchCustomers()
    ])
    return(
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {label: 'Invoices', href: '/dashboard/invoices'},
                    {label: 'Edit Invoice', href: `dashboard/invoices/${invoice_id}/edit`, active: true}
                ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    )
}