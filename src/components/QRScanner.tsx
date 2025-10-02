import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QrCode, X, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  onScan: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const { toast } = useToast();
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = "qr-reader-camera-only";

  useEffect(() => {
    // Get available cameras when component mounts
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        setCameras(devices);
      } catch (error) {
        console.error("Error getting cameras:", error);
      }
    };
    getCameras();
  }, []);

  const startScanning = async () => {
    try {
      // Check if camera permission is available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        // Stop the stream immediately, we just wanted to check permissions
        stream.getTracks().forEach((track) => track.stop());

        setIsScanning(true);
        setTimeout(() => {
          initializeCameraScanner();
        }, 100);
      } else {
        toast({
          title: "Camera Not Available",
          description: "Your device doesn't support camera access",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Camera permission error:", error);
      toast({
        title: "Camera Permission Required",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive",
      });
    }
  };

  const initializeCameraScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }

      html5QrCodeRef.current = new Html5Qrcode(scannerElementId);

      // Use back camera if available, otherwise use first available camera
      const cameraId =
        cameras.length > 0
          ? (
              cameras.find((camera) =>
                camera.label.toLowerCase().includes("back")
              ) || cameras[0]
            ).id
          : { facingMode: "environment" };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        cameraId,
        config,
        (decodedText) => {
          // Success callback - QR code found
          onScan(decodedText);
          setIsOpen(false);
          setIsScanning(false);
          toast({
            title: "QR Code Scanned Successfully! ✅",
            description: `Product ID "${decodedText}" has been automatically filled`,
          });

          // Clean up scanner
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().then(() => {
              html5QrCodeRef.current?.clear();
              html5QrCodeRef.current = null;
            });
          }
        },
        (error) => {
          // Error callback - only log actual errors, not scanning states
          if (
            error &&
            !error.includes("NotFoundException") &&
            !error.includes("No QR code found")
          ) {
            console.log("QR Scanner Error:", error);
          }
        }
      );
    } catch (error) {
      console.error("Failed to start camera scanner:", error);
      toast({
        title: "Scanner Error",
        description: "Failed to start camera scanner. Please try again.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    setIsScanning(false);
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      stopScanning();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current?.clear();
          })
          .catch(console.error);
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 px-3 py-2 h-10 border-gray-300 hover:border-grass-500 hover:bg-grass-50 transition-colors duration-200"
          onClick={() => setIsOpen(true)}
        >
          <Camera className="h-4 w-4 text-grass-600" />
          <span className="text-xs font-medium text-grass-700">Scan QR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Camera QR Scanner</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full">
            {isScanning ? (
              <div className="w-full">
                <div
                  id={scannerElementId}
                  className="w-full border-2 border-grass-300 rounded-lg overflow-hidden"
                ></div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 h-64">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm font-medium">
                    Camera QR Scanner Ready
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Click "Start Camera" to begin scanning
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            {!isScanning ? (
              <Button
                onClick={startScanning}
                className="bg-grass-600 hover:bg-grass-700 flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Start Camera</span>
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Stop Scanning</span>
              </Button>
            )}
            <Button onClick={() => setIsOpen(false)} variant="outline">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;
