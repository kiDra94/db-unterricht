/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MemberService {

  constructor(private readonly prisma: PrismaService) { }
  
  async create(createMemberDto: CreateMemberDto) {
    return await this.prisma.member.create(
      { data: createMemberDto }
    )
  }

  async findAll() {
    return await this.prisma.member.findMany();
  }

  async findOne(id: number) {
    const member = await this.prisma.member.findUnique({ where: { id: id } });
    if(!member) { throw new NotFoundException(`Member with ID ${id} not found`); }
    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    return await this.prisma.member.update({
      data: updateMemberDto,
      where: {id: id}
    });
  }

  async remove(id: number) {
    return await this.prisma.member.delete({
      where: {id: id}
    });
  }
}
