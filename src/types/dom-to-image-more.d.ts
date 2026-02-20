declare module "dom-to-image-more" {
  interface Options {
    scale?: number;
    bgcolor?: string;
    width?: number;
    height?: number;
    style?: Partial<CSSStyleDeclaration> & Record<string, string>;
    quality?: number;
    imagePlaceholder?: string;
    cacheBust?: boolean;
    useCredentials?: boolean;
  }

  const domtoimage: {
    toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
    toPng(node: HTMLElement, options?: Options): Promise<string>;
    toJpeg(node: HTMLElement, options?: Options): Promise<string>;
    toSvg(node: HTMLElement, options?: Options): Promise<string>;
    toPixelData(
      node: HTMLElement,
      options?: Options,
    ): Promise<Uint8ClampedArray>;
  };

  export default domtoimage;
}
