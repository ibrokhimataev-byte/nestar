import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { Property } from '../../libs/dto/property/property';
import { MemberService } from '../member/member.service';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		private memberService: MemberService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		const newProperty = new this.propertyModel(input);
		console.log('executed');
		try {
			//TODO: Authentification via TOKEN
			const result = await this.propertyModel.create(input);
			// increase memberProperties
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberProperties', modifier: 1 });
			return result;
		} catch (err) {
			//console.log('Error, Servise.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}
}
