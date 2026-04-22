import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import LikeSchema from '../../schemas/Like.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';

@Module({})
@Module({
    imports: [
    MongooseModule.forFeature([{ name: "Like", schema: LikeSchema }]),
    forwardRef(() => AuthModule), // <--- AuthModule shu yerda bo'lishi shart
    ViewModule,
  ],
    providers: [LikeService],
})
export class LikeModule {}