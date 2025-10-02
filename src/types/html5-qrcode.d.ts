declare module 'html5-qrcode' {
  export class Html5QrcodeScanner {
    constructor(elementId: string, config: any, verbose?: boolean);
    render(successCallback: (decodedText: string) => void, errorCallback?: (error: any) => void): void;
    clear(): Promise<void>;
  }
  
  export class Html5Qrcode {
    constructor(elementId: string, config?: any);
    start(
      cameraIdOrConfig: string | any,
      configuration: any,
      successCallback: (decodedText: string) => void,
      errorCallback?: (error: any) => void
    ): Promise<void>;
    stop(): Promise<void>;
    clear(): Promise<void>;
    static getCameras(): Promise<Array<{id: string, label: string}>>;
  }
}