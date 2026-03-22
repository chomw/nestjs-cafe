import { CafeComment } from "../entities/cafe-comment.entity";

export class CommentResponseDto {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;

    static from(entity: CafeComment): CommentResponseDto {
        const dto = new CommentResponseDto();
        dto.id = entity.id;
        dto.postId = entity.postId;
        dto.userId = entity.userId;
        dto.content = entity.content;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }
}