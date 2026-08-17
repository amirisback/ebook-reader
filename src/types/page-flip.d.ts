declare module "page-flip" {
  export interface FlipSetting {
    startPage?: number;
    size?: "fixed" | "stretch";
    width?: number;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface FlipEvent {
    data: number;
    object: PageFlip;
  }

  export class PageFlip {
    constructor(inBlock: HTMLElement, setting: Partial<FlipSetting>);
    destroy(): void;
    update(): void;
    loadFromImages(imagesHref: string[]): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    updateFromImages(imagesHref: string[]): void;
    updateFromHtml(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    clear(): void;
    turnToPrevPage(): void;
    turnToNextPage(): void;
    turnToPage(page: number): void;
    flipNext(corner?: "top" | "bottom"): void;
    flipPrev(corner?: "top" | "bottom"): void;
    flip(page: number, corner?: "top" | "bottom"): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    getOrientation(): "portrait" | "landscape";
    on(event: string, callback: (e: { data: number | string; object: PageFlip }) => void): this;
    off(event: string): void;
  }
}
