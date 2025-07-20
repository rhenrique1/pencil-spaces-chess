import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Fens,
  IframeToParentMessage,
  Messages,
  MessageType,
  ParentToIframeMessage,
  PlayerColor,
} from 'src/app/types';
import { GameService } from 'src/app/services';
import { GameOverDialogComponent } from '../dialog';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, GameOverDialogComponent],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild(PlayerColor.WHITE) whiteIframe!: ElementRef;
  @ViewChild(PlayerColor.BLACK) blackIframe!: ElementRef;

  currentFen: string = Fens.INITIAL;
  showNewGameAlert: boolean = false;
  dialogTitle: string = '';
  dialogText: string = '';

  private messageListener = (event: MessageEvent) =>
    this.handleIframeMessage(event);

  constructor(private gameService: GameService) {}

  private whiteReady: boolean = false;
  private blackReady: boolean = false;

  ngAfterViewInit(): void {
    window.addEventListener('message', this.messageListener);
    this.initializeGame();
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageListener);
  }

  private initializeGame(): void {
    const checkIframesReady = setInterval(() => {
      if (this.whiteReady && this.blackReady) {
        clearInterval(checkIframesReady);
        this.loadGameState();
        this.sendBoardUpdateToIframes(this.currentFen);
      }
    }, 100);
  }

  handleIframeMessage(event: MessageEvent<IframeToParentMessage>): void {
    // In a production environment, always verify event.origin for security reasons.
    // For this local example, '*' is used.
    // if (event.origin !== 'http://your-hosting-site') return;

    const { data } = event;

    switch (data.type) {
      case Messages.IFRAME_READY:
        if (data.id === PlayerColor.WHITE) {
          this.whiteReady = true;
        } else if (data.id === PlayerColor.BLACK) {
          this.blackReady = true;
        }
        if (this.whiteReady && this.blackReady) {
          if (this.currentFen !== Fens.INITIAL) {
            this.sendBoardUpdateToIframes(this.currentFen);
          }
        }
        break;
      case Messages.CHESS_MOVE:
        this.currentFen = data.payload.fen;
        this.gameService.saveGameState(this.currentFen);
        this.sendBoardUpdateToIframes(this.currentFen);
        break;
      case Messages.CHECKMATE:
        this.gameService.saveGameState(Fens.INITIAL);
        this.sendMessageToAllBoards(Messages.DISABLE);
        this.openNewGameDialog({
          title: `${data.payload.player} player wins!`,
          text: 'Do you want to start a new game?',
        });
        break;
      case Messages.DRAW:
        this.gameService.saveGameState(Fens.INITIAL);
        this.sendMessageToAllBoards(Messages.DISABLE);
        this.openNewGameDialog({
          title: 'Draw',
          text: 'Do you want to start a new game?',
        });
        break;
      default:
        break;
    }
  }

  private sendBoardUpdateToIframes(fen: string): void {
    const whiteUpdate: ParentToIframeMessage = {
      type: Messages.UPDATE_BOARD,
      payload: {
        fen: fen,
      },
    };
    const blackUpdate: ParentToIframeMessage = {
      type: Messages.UPDATE_BOARD,
      payload: {
        fen: fen,
      },
    };

    this.whiteIframe.nativeElement.contentWindow?.postMessage(whiteUpdate, '*');
    this.blackIframe.nativeElement.contentWindow?.postMessage(blackUpdate, '*');
  }

  private sendMessageToAllBoards(message: MessageType): void {
    this.whiteIframe.nativeElement.contentWindow.postMessage(
      { type: message },
      '*'
    );
    this.blackIframe.nativeElement.contentWindow.postMessage(
      { type: message },
      '*'
    );
  }

  private loadGameState(): void {
    const savedFen = this.gameService.loadGameState();
    if (savedFen) {
      this.currentFen = savedFen;
      this.sendBoardUpdateToIframes(this.currentFen);
    }
  }

  private resetGame(): void {
    this.currentFen = Fens.INITIAL;
    this.gameService.clearGameState();
    this.sendMessageToAllBoards(Messages.RESET);
  }

  confirmNewGame(shouldReset: boolean): void {
    if (shouldReset) {
      this.resetGame();
    }

    this.showNewGameAlert = false;
  }

  openNewGameDialog(dialogParams: { title: string; text: string }): void {
    const { title, text } = dialogParams;

    this.dialogTitle = title;
    this.dialogText = text;
    this.showNewGameAlert = true;
  }
}
