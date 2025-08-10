declare module 'jsqr' {
  interface QRCode {
    data: string;
    location: {
      topLeftCorner: { x: number, y: number };
      topRightCorner: { x: number, y: number };
      bottomLeftCorner: { x: number, y: number };
      bottomRightCorner: { x: number, y: number };
    };
  }

  interface QROptions {
    inversionAttempts?: "dontInvert" | "onlyInvert" | "attemptBoth";
  }

  function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: QROptions
  ): QRCode | null;

  export default jsQR;
}