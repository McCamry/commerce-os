import { CreateSalesReturnItemDto } from './create-sales-return.dto';

export class UpdateSalesReturnDto {
  returnNo?: string;
  returnDate?: string;
  reason?: string | null;
  status?: string;
  // When provided, existing items are fully replaced.
  items?: CreateSalesReturnItemDto[];
}
