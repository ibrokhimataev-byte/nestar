import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { StatisticModifier, T } from '../../libs/types.ts/common';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewInput } from '../../libs/dto/view/view.input';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private authService: AuthService,
		private readonly viewService: ViewService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		// TODO: Hash password
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		try {
			const result = await this.memberModel.create(input);
			// TODO: Authentication via TOKEN
			result.accessToken = await this.authService.createToken(result);
			return result;
		} catch (err) {
			console.log('Error, service.model:', err);
			throw new BadRequestException(err);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input;
		const response: Member = await this.memberModel
			.findOne({ memberNick: memberNick })
			.select('+memberPassword')
			.exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK_OR_PASSWORD);
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		// TODO: compare password
		const isMatch = await this.authService.comparePassword(input.memberPassword, response.memberPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
		response.accessToken = await this.authService.createToken(response); // Generate token and add to response

		return response;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result = await this.memberModel
			.findOneAndUpdate({ _id: memberId, memberStatus: MemberStatus.ACTIVE }, input, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPLOAD_FAILED);
		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};
		const targetMember = await this.memberModel.findOne(search).lean().exec(); //lean targetMemberni objectga aylantiradi.Korilayotgan odamni viewsi +1 ni amalga oshirish uchun lean ishlatdik
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput: ViewInput = {
				memberId: memberId,
				viewRefId: targetId,
				viewGroup: ViewGroup.MEMBER,
			};
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++;
			}
			//incraese memberView
		}

		return targetMember;
	}

	public async getAgents(memberId: ObjectId, input: AgentInquiry): Promise<Members> {
		const { text } = input.search;
		const match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input.direction ?? Direction.DESC }; //sort optionalligi sababli agar kiritilmagan bolsa createdAt avtomatik tanlanadi

		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('match', match);

		const result = await this.memberModel
			.aggregate([
				//aggregate pipelardan iborat bolib objectlardan iborat array qabul qiladi
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						//bir aggregate ichida bir nechta query natijalarini olish imkonini beradi
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }], //talab etilgan agentlar royxatini olib beradi
						metaCounter: [{ $count: 'total' }], //agentlar umumiy sonini hisoblaymiz
					},
				},
			])
			.exec();
		console.log('result:', result);
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, memberType, text } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input.direction ?? Direction.DESC }; //sort optionalligi sababli agar kiritilmagan bolsa createdAt avtomatik tanlanadi
		if (memberStatus) match.memberStatus = memberStatus;
		if (memberType) match.memberType = memberType;
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') };
		console.log('match', match);

		const result = await this.memberModel
			.aggregate([
				//aggregate pipelardan iborat bolib objectlardan iborat array qabul qiladi
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						//bir aggregate ichida bir nechta query natijalarini olish imkonini beradi
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }], //talab etilgan agentlar royxatini olib beradi
						metaCounter: [{ $count: 'total' }], //agentlar umumiy sonini hisoblaymiz
					},
				},
			])
			.exec();
		console.log('result:', result);
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		const result = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		//memberga dahldor kerakli qiymatni ozgartirish imkonini beruvchi method
		const { _id, targetKey, modifier } = input;
		return (await this.memberModel
			.findOneAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec()) as Member; //masalan {memberProperties: 1}
	}
}
