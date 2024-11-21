import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { supabase } from './app/lib/supabase';
import type { User } from './app/lib/definitions';
import bycrpt from 'bcrypt'

async function getUser(email: string): Promise<User | undefined> {
    try {
        const user = await supabase.from('users').select('*').eq('email', email)
    } catch(error) {
        console.error('Fiailed to fetch user', error);
        throw new Error('Failed to fetch user');
    }
}

export const {auth, signIn, signOut} = NextAuth({
    ...authConfig,
    providers: [Credentials({
        async authorize(credentials) {
            const parsedCredentials = z
                .object({email: z.string().email(), password: z.string().min(6)})
                .safeParse(credentials);
            
            if (parsedCredentials.success) {
                const {email, password} = parsedCredentials.data;
                const user = await getUser(email);
                if(!user) return null;
                const passwordMatch = await bycrpt.compare(password, user.password);

                if(passwordMatch) return user;
            }
            console.log('Invalid credentials')
            return null;
        }
    })]
})