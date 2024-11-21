//directive marks all exported function here as Server Actions
'use server';

import {z} from 'zod';
import { supabase } from './supabase';
import { revalidatePath } from 'next/cache';
import {redirect} from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.'
    }),
    amount: z.coerce
        .number()
        .gt(0, {message: 'Please enter an amount greater than $0'}),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status'
    }),
    date: z.string()
})

const CreateInvoice = FormSchema.omit({id: true, date: true});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[]
    };
    message?: string | null;
}

export async function createInvoice(prevState: State, formData: FormData) {
    const validateFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if (!validateFields.success)  {
        return {
            errors: validateFields.error.flatten().fieldErrors,
            message: 'Missing fields. Failed to create invoice.'
        }
    }

    const {customerId, amount, status} = validateFields.data;
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
        await supabase.from('invoices').update({customer_id: customerId, amount: amountInCents, status}).eq('id', id);
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