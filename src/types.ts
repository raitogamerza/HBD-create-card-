export interface StickerData {
  id: string;
  emojiOrUrl: string;
  x: number;
  y: number;
}

export interface CardData {
  sender: string;
  receiver: string;
  message: string;
  bgColor: string;
  envelopeColor: string;
  fontColor?: string;
  imageUrl: string;
  stickers: StickerData[];
}
