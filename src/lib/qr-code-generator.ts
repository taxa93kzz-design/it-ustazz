import QRCode from "qrcode";
import { validateResourceUrl } from "@/lib/interactive-resource-validator";

export async function generateResourceQr(url: string) {
  if (!validateResourceUrl(url).success) throw new Error("QR жасау үшін жарамды сілтеме қажет");
  return QRCode.toDataURL(url, { width: 360, margin: 2, errorCorrectionLevel: "M" });
}
