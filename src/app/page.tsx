import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Board de Tarefas Domésticas
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize as tarefas de casa com sua família
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg">Entrar</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
