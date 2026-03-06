import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly) {
        super({
            jwtFromRequest: (req: Request) => {
                let token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
                if(!token && req.cookies) {
                    token = req.cookies.accesToken;
                }
                return token;
            },
            secretOrKey: process.env.JWT_SECRET || 'fallback-secret',
        });
    }

    async validate(payload : any) {
        if(!payload.email) {
            throw new Error('Invalid token!');
        }

        return {
            name: payload.name,
            email: payload.email,
        }
    }
}