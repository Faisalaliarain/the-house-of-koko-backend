export class CreatePaymentIntentDto {
  amount: number;
  currency: string;
  customerId?: string;
}
