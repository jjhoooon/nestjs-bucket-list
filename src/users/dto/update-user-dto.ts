import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user-dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    refreshToken: string;
}

// PartialType은 주어진 클래스의 모든 속성을 선택적으로 만드는 데 사용됩니다.
// CreateUserDto의 모든 속성을 선택적으로 만들고, UpdateUserDto에 추가 속성을 정의할 수 있습니다.
