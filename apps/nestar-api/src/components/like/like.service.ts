import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema } from 'mongoose';
import { Like } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types.ts/common';
import { Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class LikeService {
    checkLikeExistence(likeInput: { memberId: Schema.Types.ObjectId; likeRefId: Schema.Types.ObjectId; likeGroup: LikeGroup; }): any {
        throw new Error('Method not implemented.');
    }
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
			exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;
		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			//agar member oldin like bosmagan bosa create qilamiz create mongoose object qaytarganligi sababli try catch qilamiz
			try {
				await this.likeModel.create(input);
			} catch (err) {
				console.log('ERROR, Service.model:', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log('-Like modifier:', modifier);
		return modifier;
	}
}
