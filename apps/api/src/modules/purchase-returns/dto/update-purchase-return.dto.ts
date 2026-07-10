import { CreatePurchaseReturnItemDto } from './create-purchase-return.dto';

export class UpdatePurchaseReturnDto {
  returnNo?: string;
  returnDate?: string;
  reason?: string | null;
  status?: string;
  // When provided, existing items are fully replaced.
  items?: CreatePurchaseReturnItemDto[];
}
