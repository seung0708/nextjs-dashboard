import { supabase } from './supabase';
import {
  CustomersTableType,
  CustomerField,
  Revenue,
  InvoicesTable,
  InvoiceForm
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {
    const {data} = await supabase.from('revenue').select('*') as {data: Revenue[]}

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const {data: result } = await supabase.from('invoices').select('amount, customers(id, name, image_url, email), id').order('date', {ascending: false}).limit(5)
  
    const latestInvoices = result?.map((invoice) => ({
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
    const {count: numberOfInvoices}: {count: number | null} = await supabase.from('invoices').select('*', {count: 'exact'});

    const numberOfInvoicesSafe = numberOfInvoices ?? 0;
    
    const {count: numberOfCustomers }: {count: number | null} = await supabase.from('customers').select('*', {count: 'exact'});

    const numberOfCustomersSafe = numberOfCustomers ?? 0;

    const {data} = await supabase.rpc('get_invoice_status_totals');
    
    const totalPaidInvoices = formatCurrency(data[0]?.paid)
    const totalPendingInvoices = formatCurrency(data[0]?.pending)
    //console.log(data)
    return {
      numberOfInvoicesSafe, 
      numberOfCustomersSafe, 
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
    
    const { data: invoices} = await supabase
    .rpc('get_invoices', { query, items_per_page: ITEMS_PER_PAGE, offset_val: offset }) as {data: InvoicesTable[]};
  
    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {

    const { data} = await supabase
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
    const {data} = await supabase.from('invoices').select('id, customer_id, amount, status').eq('id', id) as {data: InvoiceForm[] };
    
    const invoice = data?.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice?.[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const {data: customers} = await supabase.from('customers').select('id, name').order('name') as {data: CustomerField[]}
    //console.log(customers)
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}
 
export async function fetchFilteredCustomers(query: string) {
  try {
    const {data} = await supabase.rpc('search_customers', {query}) as {data: CustomersTableType[]};

    const customers = data.map((customer) => ({
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
