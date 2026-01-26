/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const adapters = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
        super({ adapter: adapters });
    }
}