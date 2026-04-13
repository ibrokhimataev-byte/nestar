import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { MemberType, MemberAuthType } from '../../enums/member.enum';
import { availableAgentSorts } from '../../config';
import { Direction } from 'readline';

@InputType()
export class MemberInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => MemberAuthType, { nullable: true })
	memberAuthType?: MemberAuthType;
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberNick: string;

	@IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;
}


@InputType() //search paytida agentlarni nomlari orqali topish uchun
class AIsearch {
    @IsNotEmpty()
    @Field(() => String, {nullable: true})
    text?: string
}

@InputType()
export class AgentInquiry{
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page: number; //pagenation uchun kerak boladi

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;

    @IsOptional()
    @IsIn([availableAgentSorts]) //userlar agentlarni shu parametrlar boyicha sort qiladi
    @Field(() => String, {nullable: true}) //sorting mexanizm uchun
    sort?: string;

    @IsOptional()
    @Field(() => String, {nullable: true}) //sorting mexanizm uchun
    direction?: Direction;

    @IsNotEmpty()
    @Field(() => AIsearch)
    search: AIsearch;
}
