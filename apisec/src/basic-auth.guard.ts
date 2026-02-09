/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export class ApiKeyGuard implements CanActivate {
    private readonly validUsername = 'user';
    private readonly validPassword = 'secret';
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        const auth = request.headers['authorization'];
        if (!auth || !auth.startsWith('Basic ')) {
            throw new UnauthorizedException('Missing Basic authorization header');
        }
        const base64Credentials = auth.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        console.log('Received Basic auth header:', base64Credentials);
        console.log('Decoded credentials:', credentials);
        const [username, password] = credentials.split(':');
        console.log('Username:', username);
        console.log('Password:', password);
        if (username !== this.validUsername || password !== this.validPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return true;
    }
}
