import type { ToastContext } from '@skeletonlabs/skeleton-svelte';

export function showInfo(toast: ToastContext, title: string, description: string, duration = 5000) {
    if (toast) {
        toast.create({
            title,
            description,
            type: 'info',
            duration
        });
    }
}

export function showError(toast: ToastContext, title: string, description: string, duration = 5000) {
    if (toast) {
        toast.create({
            title,
            description,
            type: 'error',
            duration
        });
    }
}

export function showSuccess(toast: ToastContext, title: string, description: string, duration = 2500) {
    if (toast) {
        toast.create({
            title,
            description,
            type: 'success',
            duration
        });
    }
}