import { Either, left, right } from '@/core/either'
import { Inject, Injectable } from '@nestjs/common'
import { StudentsRepository } from '../repositories/students-repository'
import { HashGenerator } from '../cryptography/hash-generator'
import { Student } from '../../enterprise/entities/student'
import { StudentAlreadyExistsError } from './errors/student-already-exists-error'

interface RegisterStudentUseCaseRequest {
  name: string
  email: string
  password: string
}

type RegisterStudentUseCaseResponse = Either<
  StudentAlreadyExistsError,
  {
    student: Student
  }
>

@Injectable()
export class RegisterStudentUseCase {
  constructor(
    @Inject(StudentsRepository)
    private studentsRepository: StudentsRepository,
    @Inject(HashGenerator)
    private hashGenerator: HashGenerator
  ) {}

  async execute({
    name,
    email,
    password
  }: RegisterStudentUseCaseRequest): Promise<RegisterStudentUseCaseResponse> {
    const studentWithSemeEmail = await this.studentsRepository.findByEmail(email)

    if (studentWithSemeEmail) {
      return left(new StudentAlreadyExistsError(email))
    } 

    const hashedPassword = await this.hashGenerator.hash(password)

    const student = Student.create({
      name,
      email,
      password: hashedPassword
    })

    await this.studentsRepository.create(student)

    return right({
      student
    })
  }
}
