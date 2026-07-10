export class CreateReceiptDto {
  salesInvoiceId!: string;
  receiptNo!: string;
  paymentMethod!: string;
  amount!: number;
  paymentDate?: string;
  reference?: string;
  status?: string;
}
