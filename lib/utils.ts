import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CnInput {
    [key: string]: unknown;
}

export function cn(...inputs: Array<string | number | CnInput | undefined | null | false>): string {
    return twMerge(clsx(inputs));
}