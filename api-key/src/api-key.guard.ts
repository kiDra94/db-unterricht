/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export class ApiKeyGuard implements CanActivate {

   private readonly API_KEY = "1234";

   canActivate(context: ExecutionContext): boolean {
     const request = context.switchToHttp().getRequest();

     const apiKey = request.headers['api-key'];

     if (apiKey != this.API_KEY){
      throw new UnauthorizedException("Nope, you're not allowed");
     }
     return true;
   }
}