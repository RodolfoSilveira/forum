import { BadRequestException, Body, Controller, HttpCode, Param, Put } from "@nestjs/common"
import { CurrentUser } from "@/infra/auth/current-user-decorator"
import type { UserPayload } from "@/infra/auth/jwt.strategy"
import { ZodValidationPipe } from "@/infra/http/pipes/zod-validation-pipe"
import z from "zod"
import { EditQuestionUseCase } from "@/domain/forum/application/use-cases/edit-question"

const editQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  attachments: z.array(z.uuid())
})

type EditQuestionBodySchema = z.infer<typeof editQuestionBodySchema>

@Controller('/questions/:id')
export class EditQuestionController {
  constructor(private createQuestion: EditQuestionUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') questionId: string,
    @Body(new ZodValidationPipe(editQuestionBodySchema)) body: EditQuestionBodySchema
  ) {
    const { content, title, attachments } = body
    const { sub: userId } = user

    const result = await this.createQuestion.execute({
      title,
      content,
      authorId: userId,
      attachmentsIds: attachments,
      questionId
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
