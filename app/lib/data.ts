import { supabase } from './supabase';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { off } from 'process';



export async function fetchRevenue() {
  try {
    const {data} = await supabase.from('revenue').select('*');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const result = await supabase.from('invoices').select('amount, customers(id, name, image_url, email), id').order('date', {ascending: false}).limit(5);
  
    const latestInvoices = result.data?.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const {count: numberOfInvoices, error: invoiceCountError} = await supabase.from('invoices').select('*', {count: 'exact'});
    
    const {count: numberOfCustomers, error: customerCountError} = await supabase.from('customers').select('*', {count: 'exact'});

    const {data: invoicePaidData, error: invoicePaidError} = await supabase.from
    ('invoices').select('amount').eq('status', 'paid')
    
    const {data: invoicePendingData, error: invoicePendingError} = await supabase.from('invoices').select('amount').eq('status', 'pending');

    const totalPaidInvoices = invoicePaidData?.reduce((acc, obj) => acc + obj.amount, 0);

    const totalPendingInvoices = invoicePendingData?.reduce((acc, obj) => acc + obj.amount, 0);

    return {
      numberOfInvoices, 
      numberOfCustomers, 
      totalPaidInvoices,
      totalPendingInvoices
    }

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    
    const { data: invoices, error } = await supabase
    .rpc('get_invoices', { query, items_per_page: ITEMS_PER_PAGE, offset_val: offset });

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {

    const { data, error } = await supabase
    .rpc('get_invoice_count', { query });

    const totalPages = Math.ceil(Number(data) / ITEMS_PER_PAGE);
    
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    console.log(id)
    const {data, error} = await supabase.from('invoices').select('id, customer_id, amount, status').eq('id', id);
    console.log(data, error)

    const invoice = data?.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const {data: customers, error} = await supabase.from('customers').select('id, name').order('name')
   
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
