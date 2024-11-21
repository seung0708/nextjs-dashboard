//directive marks all exported function here as Server Actions
'use server';

import {z} from 'zod';
import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';
import {redirect} from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
})

const CreateInvoice = FormSchema.omit({id: true, date: true});

export async function createInvoice(formData: FormData) {
    const {customerId, amount, status} = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await supabase.from('invoices').insert({customer_id: customerId, amount: amountInCents, status, date});

    } catch(error) {
        return {
            message: `Database Error: Failed to create invoice (${error})`
        }
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({id: true, date: true});

export async function updateInvoice(id: string, formData: FormData) {
    const {customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
    const amountInCents = amount * 100;
    try {
        const {data, error} = await supabase.from('invoices').update({customer_id: customerId, amount: amountInCents, status}).eq('id', id);
    } catch(error) {
        return {
            message: `Database Error: Failed to update invoice (${error}`
        }
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    //throw new Error('Failed to delete Invoice')
    try {
        await supabase.from('invoices').delete().eq('id', id);
    } catch (error) {
        return {
            message: `Database Error: Failed to delete Invoice (${error})`
        }
    }

    revalidatePath('/dashboard/invoices')
}