import { Injectable, ErrorHandler } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private snackBar: MatSnackBar) {}

  handleError(error: Error | HttpErrorResponse) {
    let errorMessage: string;

    if (error instanceof HttpErrorResponse) {
      // Server or connection error
      errorMessage = this.handleHttpError(error);
    } else {
      // Client Error
      errorMessage = this.handleClientError(error);
    }

    // Show error to user
    this.showError(errorMessage);
    
    // Log error for debugging
    console.error('Error occurred:', error);
  }

  private handleHttpError(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Network error. Please check your connection.';
      case 404:
        return 'Resource not found.';
      case 403:
        return 'Access denied.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Server error: ${error.message}`;
    }
  }

  private handleClientError(error: Error): string {
    if (error.message.includes('IndexedDB')) {
      return 'Storage error. Please check your browser settings.';
    }
    if (error.message.includes('audio')) {
      return 'Audio playback error. Please try again.';
    }
    return 'An unexpected error occurred.';
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
} 