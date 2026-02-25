'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const passwordSchema = z.object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    // Optional root error handle if API fails uniquely
    const [apiError, setApiError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema)
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            // Validate session loading or absence.
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    setApiError(null);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const onSubmit = async (data: PasswordFormValues) => {
        setLoading(true);
        setApiError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (err: any) {
            setApiError(err?.message || 'Ocorreu um erro ao definir a senha.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Senha Definida!</h1>
                    <p className="text-gray-600">Sua senha foi criada com sucesso. Você será redirecionado para o painel em instantes.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo(a)!</h1>
                    <p className="text-gray-600">
                        Você foi convidado(a) para participar da equipe. Por favor, defina uma senha para a sua conta.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-600 font-medium mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Senha
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-600 font-medium mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {apiError && <p className="text-sm text-red-600 font-medium mt-2">{apiError}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Salvando...' : 'Definir Senha e Entrar'}
                    </Button>
                </form>
            </div>
        </main>
    );
}
