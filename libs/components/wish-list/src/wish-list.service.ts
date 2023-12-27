import { FullConfig } from '@app/common/configuration';
import { WishListData, WishListReq } from '@app/common/dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import urlcat from 'urlcat';

const APIS = {
  sheets: 'https://api.airtable.com/v0',
};

@Injectable()
export class WishListService {
  private tableForWishListName: string;
  private wishListBaseId: string;

  constructor(private configService: ConfigService<FullConfig, true>) {
    this.wishListBaseId = this.configService.get('AIR_TABLE_BASE_ID');
    this.tableForWishListName = this.configService.get('AIR_TABLE_TABLE_NAME');
  }

  async createTableInBase({
    baseId,
    tableName,
    tableDescription,
    fields,
  }: {
    baseId: string;
    tableName: string;
    tableDescription: string;
    fields: { name: string; type: string }[];
  }) {
    try {
      const reqUrl = urlcat(APIS.sheets, '/meta/bases/:baseId/tables', {
        baseId: baseId,
      });

      const res = await axios.post(
        reqUrl,
        {
          description: tableDescription,
          fields,
          name: tableName,
        },
        {
          headers: this.getAccessHeaders(),
        }
      );

      return res.data;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getBaseSchema(baseId: string) {
    try {
      const reqUrl = urlcat(APIS.sheets, '/meta/bases/:baseId/tables', {
        baseId,
      });

      const res = await axios.get(reqUrl, {
        headers: this.getAccessHeaders(),
      });

      return res.data;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async appendSheet(body: object) {
    try {
      const reqUrl = urlcat(APIS.sheets, '/:baseId/:tableId', {
        baseId: this.wishListBaseId,
        tableId: this.tableForWishListName,
      });

      const schema = await this.getBaseSchema(this.wishListBaseId);

      if (
        !schema.tables
          .map((el: { name: string }) => el.name)
          .includes(this.tableForWishListName)
      ) {
        await this.createTableInBase({
          tableDescription: 'Table for getting data from wish list form',
          tableName: this.tableForWishListName,
          baseId: this.wishListBaseId,
          fields: Object.keys(body).map((el) => ({
            name: el,
            type: 'multilineText',
          })),
        });
      }

      const res = await axios.post(
        reqUrl,
        {
          records: [{ fields: body }],
        },
        {
          headers: this.getAccessHeaders(),
        }
      );

      return res.data;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  private getAccessHeaders() {
    return {
      Authorization: `Bearer ${this.configService.get(
        'AIR_TABLE_ACCESS_TOKEN'
      )}`,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
    };
  }

  formatDate(date: Date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.getMonth().toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  formatPayload(body: WishListReq) {
    const formattedUpload: WishListData = {
      /* eslint-disable @typescript-eslint/naming-convention */
      'User name': body.name,
      Email: body.email,
      'Social Media Links': body.socialMediaLinks.join(', '),
      'Date of birth': this.formatDate(new Date(body.birth)),
      'Social Media': body.socialMedia.join(', '),
      Role: body.role.join(', '),
      /* eslint-disable @typescript-eslint/naming-convention */
    };

    return formattedUpload;
  }
}
