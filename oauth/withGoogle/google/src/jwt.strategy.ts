import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly) {
        super({
            jwtFromRequest: (req: Request) => {
                return token;
            },
            secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
        });
    }

    async validate() {

    }
}