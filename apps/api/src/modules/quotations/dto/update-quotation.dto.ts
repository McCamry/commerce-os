import { CreateQuotationItemDto } from './create-quotation.dto';

export class UpdateQuotationDto {
  quotationDate?: string;
  expireDate?: string | null;
  remark?: string | null;
  status?: string;
  // When provided, the existing line items are fully replaced and totals recalculated.
  items?: CreateQuotationItemDto[];
}
