// Toast Notification System
// Displays temporary notification messages with animations

window.Toast = {
    // Show a toast notification
    show(message, type = 'success', duration = 3000) {
        const container = this.getContainer();

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type} transform translate-x-full opacity-0 transition-all duration-300 ease-out`;

        // Set icon based on type
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        const colors = {
            success: 'bg-green-600 border-green-500',
            error: 'bg-red-600 border-red-500',
            info: 'bg-blue-600 border-blue-500'
        };

        toast.innerHTML = `
            <div class="flex items-center gap-3 ${colors[type] || colors.success} text-white px-6 py-4 rounded-lg shadow-2xl border-l-4 min-w-[300px] max-w-md">
                <i class="fas ${icons[type] || icons.success} text-xl"></i>
                <span class="font-medium text-sm">${message}</span>
                <button class="ml-auto text-white/80 hover:text-white transition" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 10);

        // Auto-dismiss
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Get or create toast container
    getContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed top-4 right-4 z-50 space-y-3';
            document.body.appendChild(container);
        }
        return container;
    },

    // Convenience methods
    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};
