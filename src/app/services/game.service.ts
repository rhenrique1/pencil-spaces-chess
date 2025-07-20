import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private readonly STORAGE_KEY = 'chessGameState';

  /**
   * Saves the current game state to localStorage.
   * @param fen The FEN string representing the board state.
   */
  saveGameState(fen: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, fen);
    } catch (e) {
      console.error('Error saving game state to localStorage', e);
    }
  }

  /**
   * Loads the game state from localStorage.
   * @returns The saved FEN string or null if none is found.
   */
  loadGameState(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Error loading game state from localStorage', e);
      return null;
    }
  }

  /**
   * Clears the game state from localStorage.
   */
  clearGameState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Error clearing game state from localStorage', e);
    }
  }
}
