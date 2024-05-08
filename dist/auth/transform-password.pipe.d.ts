import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
export declare class TransformPasswordPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
}
