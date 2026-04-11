export interface VenueTableTypeResponseDto {
  id: string;
  venueId: string;
  tableTypeId: string;
  tableTypeName: string;
  tableTypeDescription: string;
  quantity: number;
  minCapacity: number;
  maxCapacity: number;
  createdAt: string;
  updatedAt: string;
}