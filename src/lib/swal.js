import Swal from 'sweetalert2';

/**
 * Show confirmation dialog
 */
export const confirmDelete = (title, message) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    reverseButtons: true,
  });
};

/**
 * Show success alert
 */
export const showSuccess = (title, message, autoClose = true) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'success',
    confirmButtonColor: '#10b981',
    timer: autoClose ? 2000 : undefined,
  });
};

/**
 * Show error alert
 */
export const showError = (title, message) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonColor: '#ef4444',
  });
};

/**
 * Show warning alert
 */
export const showWarning = (title, message) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'warning',
    confirmButtonColor: '#f59e0b',
  });
};

/**
 * Show info alert
 */
export const showInfo = (title, message) => {
  return Swal.fire({
    title,
    text: message,
    icon: 'info',
    confirmButtonColor: '#3b82f6',
  });
};
