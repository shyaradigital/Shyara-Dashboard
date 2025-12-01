import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum IncomeCategory {
  SMM = "SMM",
  Website = "Website",
  Ads = "Ads",
  POS = "POS",
  Consultation = "Consultation",
  Freelancing = "Freelancing",
  WeddingVideoInvitation = "Wedding Video Invitation",
  EngagementVideoInvitation = "Engagement Video Invitation",
  WeddingCardInvitation = "Wedding Card Invitation",
  EngagementCardInvitation = "Engagement Card Invitation",
  AnniversaryCardInvitation = "Anniversary Card Invitation",
  AnniversaryVideoInvitation = "Anniversary Video Invitation",
  BirthdayWishVideo = "Birthday Wish Video",
  BirthdayWishCard = "Birthday Wish Card",
  BirthdayVideoInvitation = "Birthday Video Invitation",
  BirthdayCardInvitation = "Birthday Card Invitation",
  Other = "Other",
}

export class CreateIncomeDto {
  @ApiProperty({ example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: "SMM", enum: IncomeCategory })
  @IsNotEmpty()
  @IsEnum(IncomeCategory)
  category: IncomeCategory;

  @ApiProperty({ example: "Client ABC" })
  @IsNotEmpty()
  @IsString()
  source: string;

  @ApiProperty({ example: "Monthly retainer", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "2024-01-15T00:00:00.000Z" })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  // Advance payment and dues fields
  @ApiProperty({ example: 10000.0, required: false, description: "Total project/transaction amount" })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ example: 5000.0, required: false, description: "Amount paid as advance" })
  @IsOptional()
  @IsNumber()
  advanceAmount?: number;

  @ApiProperty({ example: 5000.0, required: false, description: "Remaining amount due" })
  @IsOptional()
  @IsNumber()
  dueAmount?: number;

  @ApiProperty({ example: "2024-02-15T00:00:00.000Z", required: false, description: "Expected payment date for dues" })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

