'use client'

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

// Ganti tipe 'any' dengan tipe data pengguna yang lebih spesifik jika memungkinkan
type User = any; 

interface ActionButtonProps {
    user: User;
}

export default function ActionButton({ user }: ActionButtonProps) {
    const router = useRouter();

    const handleEdit = () => {
        // Arahkan ke halaman edit dengan membawa data pengguna
        // Implementasi halaman edit akan dibahas selanjutnya
        router.push(`/dashboard/users/edit/${user.username}`);
    };

    const handleDelete = async () => {
        const confirmed = confirm("Are you sure you want to delete this user?");
        if (confirmed) {
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: user.username }),
            });

            if (response.ok) {
                router.refresh(); // Muat ulang data pada halaman
            } else {
                alert("Failed to delete user.");
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleEdit}>
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}