/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport"
import { BasicStragey as HTTPBasicStrategy } from "passport-http";


export class BasicStrategy extends PassportStrategy(HTTPBasicStrategy) {
    constructor() {
        super();
    }
    async validate(username: string, password: string) {
        if (username ===  'user' && password === 'secret') {
            return { username: 'user' };
        }
        throw new UnauthorizedException('Invalid credentials');
    }
}