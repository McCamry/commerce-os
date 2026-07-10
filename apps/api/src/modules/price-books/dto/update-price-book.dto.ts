import { CreatePriceBookItemDto } from './create-price-book.dto';

export class UpdatePriceBookDto {
  customerGroupId?: string | null;
  code?: string;
  name?: string;
  description?: string | null;
  currency?: string;
  effectiveDate?: string;
  expiryDate?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  // When provided, existing items are fully replaced.
  items?: CreatePriceBookItemDto[];
}
