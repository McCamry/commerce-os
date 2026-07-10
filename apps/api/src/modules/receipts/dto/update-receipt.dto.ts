export class UpdateReceiptDto {
  receiptNo?: string;
  paymentMethod?: string;
  amount?: number;
  paymentDate?: string;
  reference?: string | null;
  status?: string;
}
