import { Expose, Type } from 'class-transformer';
import { IsString, IsNotEmpty } from 'class-validator';
import { SongDTO } from './song.dto';

abstract class SongListDTO {
	@Expose()
	@IsString()
	@IsNotEmpty()
	name!: string;

	@Expose()
	@Type(() => SongDTO)
	songs!: SongDTO[];
}

export class SongListGetDTO extends SongListDTO {
	@Expose()
	@IsString({ message: 'SongListDTO.listId must be a string' })
	@IsNotEmpty({ message: 'SongListDTO.listId must be defined' })
	listId!: number;
}

export class SongListPostDTO extends SongListDTO {}

// SongList:
//   properties:
//     listId:
//       type: string
//     songs:
//       type: array
//       items:
//         $ref: '#/definitions/Song'
//   required:
//     - listId
