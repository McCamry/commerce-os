import { CreatePurchaseRequestItemDto } from './create-purchase-request.dto';

export class UpdatePurchaseRequestDto {
  requestBy?: string;
  requestDate?: string;
  status?: string;
  remark?: string | null;
  // When provided, existing items are fully replaced.
  items?: CreatePurchaseRequestItemDto[];
}
