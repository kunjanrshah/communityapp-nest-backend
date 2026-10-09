import { Field, Int, Float, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

@ObjectType()
export class UserMatrimonyDTO {
  @Field(() => Int, { nullable: true }) // Auto-incremented ID (Optional for input)
  @IsOptional()
  @IsInt()
  id?: number;

  @Field(() => Int) // Required user_id (Must be provided)
  @IsInt()
  user_id: number;

  @Field({ nullable: true }) // Birth time (Optional)
  @IsOptional()
  @IsString()
  birth_time?: string;

  @Field(() => Int, { nullable: true }) // Birth place (Optional)
  @IsOptional()
  @IsInt()
  birth_place_id?: number;

  @Field() // Hobby (Required)
  @IsString()
  hobby: string;

  @Field({ nullable: true }) // About me (Optional)
  @IsOptional()
  @IsString()
  about_me?: string;

  @Field(() => Float, { nullable: true }) // Weight (Optional)
  @IsOptional()
  weight?: number;

  @Field(() => Float, { nullable: true }) // Height (Optional)
  @IsOptional()
  height?: number;

  @Field({ defaultValue: false }) // Is Spectacles (Default: false)
  @IsOptional()
  @IsBoolean()
  is_spect?: boolean;

  @Field({ defaultValue: false }) // Is Mangal (Default: false)
  @IsOptional()
  @IsBoolean()
  is_mangal?: boolean;

  @Field({ defaultValue: false }) // Is Shani (Default: false)
  @IsOptional()
  @IsBoolean()
  is_shani?: boolean;

  @Field({ nullable: true }) // Facebook Profile URL (Optional)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  facebook_profile?: string;

  @Field({ nullable: true }) // Expectation (Optional)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  expectation?: string;
}
