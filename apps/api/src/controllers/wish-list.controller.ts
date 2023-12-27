import { WishListReq, WishListRes } from '@app/common/dto';
import { WishListService } from '@app/components/wish-list';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('wish-list')
@Controller('wish-list')
export class WishListController {
  constructor(private wishListService: WishListService) {}

  @Post()
  async appendSpreadsheet(@Body() body: WishListReq): Promise<WishListRes> {
    return this.wishListService.appendSheet(
      this.wishListService.formatPayload(body)
    );
  }
}
