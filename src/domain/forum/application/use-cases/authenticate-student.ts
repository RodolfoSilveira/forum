import { Either, left, right } from '@/core/either'
import { Inject, Injectable } from '@nestjs/common'
import { StudentsRepository } from '../repositories/students-repository'
import { Encrypter } from '../cryptography/encrypter'
import { HashComparer } from '../cryptography/hash-comparer'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

interface AuthenticateStudentUseCaseRequest {
  email: string
  password: string
}

type AuthenticateStudentUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
  }
>

@Injectable()
export class AuthenticateStudentUseCase {
  constructor(
    @Inject(StudentsRepository)
    private studentsRepository: StudentsRepository,
    @Inject(HashComparer)
    private hashComparer: HashComparer,
    @Inject(Encrypter)
    private encrypter: Encrypter
  ) {}

  async execute({
    email,
    password
  }: AuthenticateStudentUseCaseRequest): Promise<AuthenticateStudentUseCaseResponse> {
    const student = await this.studentsRepository.findByEmail(email)

    if (!student) {
      return left(new WrongCredentialsError())
    } 

    const isPasswordValid = await this.hashComparer.compare(password, student.password)

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({ sub: student.id.toString() })

    
    return right({
      accessToken
    })
  }
}
