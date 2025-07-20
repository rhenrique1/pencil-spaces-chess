import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MoveChange,
  NgxChessBoardModule,
  NgxChessBoardView,
} from 'ngx-chess-board';
import {
  Fens,
  Messages,
  ParentToIframeMessage,
  PlayerColor,
  PlayerColorType,
} from 'src/app/types';

@Component({
  selector: 'app-iframe-page',
  standalone: true,
  imports: [CommonModule, NgxChessBoardModule],
  templateUrl: './iframe-page.component.html',
  styleUrls: ['./iframe-page.component.css'],
})
export class IframePageComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;

  iframeId: string = '';
  currentFen: string = Fens.INITIAL;
  playerColor: PlayerColorType = PlayerColor.WHITE;
  lightDisabled: boolean = false;
  darkDisabled: boolean = false;

  private messageListener = (event: MessageEvent) =>
    this.handleParentMessage(event);

  ngOnInit(): void {
    const urlParams = new URLSearchParams(window.location.search);
    this.iframeId = urlParams.get('id') || '';
    this.setPlayerColor();
  }

  ngAfterViewInit(): void {
    window.addEventListener('message', this.messageListener);
    window.parent.postMessage(
      { type: Messages.IFRAME_READY, id: this.iframeId },
      '*'
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageListener);
  }

  setPlayerColor(): void {
    this.playerColor =
      this.iframeId === PlayerColor.WHITE
        ? PlayerColor.WHITE
        : PlayerColor.BLACK;
  }

  handleParentMessage(event: MessageEvent<ParentToIframeMessage>): void {
    const { data } = event;

    switch (data.type) {
      case Messages.UPDATE_BOARD:
        if (this.board) {
          const {
            payload: { fen: newFen },
          } = data;

          this.currentFen = newFen;
          this.board.setFEN(newFen);
          this.updateInteractionStates(newFen);
          this.reverseBlackBoard();
        }
        break;
      case Messages.DISABLE:
        this.disableBoard();
        break;
      case Messages.RESET:
        this.resetBoard();
        break;
      default:
        break;
    }
  }

  private updateInteractionStates(fen: string): void {
    const currentPlayer =
      fen.split(' ')[1] === 'w' ? PlayerColor.WHITE : PlayerColor.BLACK;

    this.playerColor === currentPlayer
      ? this.enableBoard()
      : this.disableBoard();
  }

  onMove(event: any): void {
    const baseMessage = {
      payload: {
        player: this.playerColor,
        fen: event.fen,
      },
    };

    let message = {};

    if (event.check && event.mate) {
      message = {
        ...baseMessage,
        type: Messages.CHECKMATE,
      };
    } else if (event.stalemate) {
      message = {
        ...baseMessage,
        type: Messages.DRAW,
      };
    } else {
      message = {
        ...baseMessage,
        type: Messages.CHESS_MOVE,
      };
    }

    window.parent.postMessage(message, '*');
  }

  reverseBlackBoard(): void {
    if (this.playerColor === PlayerColor.BLACK) {
      this.board.reverse();
    }
  }

  disableBoard(): void {
    this.lightDisabled = true;
    this.darkDisabled = true;
  }

  enableBoard(): void {
    this.lightDisabled = false;
    this.darkDisabled = false;
  }

  resetBoard(): void {
    this.board.reset();
    this.reverseBlackBoard();
    this.updateInteractionStates(Fens.INITIAL);
  }
}
