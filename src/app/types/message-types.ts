interface IframeReadyMessage {
  type: 'iframeReady';
  id: string;
}

interface ChessMoveMessage {
  type: 'chessMove' | 'checkmate' | 'draw';
  payload: {
    fen: string;
    player: 'white' | 'black';
  };
}

type IframeToParentMessage = IframeReadyMessage | ChessMoveMessage;

interface UpdateBoardMessage {
  type: 'updateBoard';
  payload: {
    fen: string;
  };
}

interface DisableMessage {
  type: 'disable';
}

interface ResetMessage {
  type: 'reset';
}

type ParentToIframeMessage = UpdateBoardMessage | DisableMessage | ResetMessage;

export { ParentToIframeMessage, IframeToParentMessage, ChessMoveMessage };

export const Messages = {
  CHESS_MOVE: 'chessMove',
  CHECKMATE: 'checkmate',
  DRAW: 'draw',
  IFRAME_READY: 'iframeReady',
  UPDATE_BOARD: 'updateBoard',
  DISABLE: 'disable',
  RESET: 'reset',
} as const;

export type MessageType = (typeof Messages)[keyof typeof Messages];
