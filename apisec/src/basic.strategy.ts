/* eslint-disable prettier/prettier */
import { PassportStrategy } from "@nestjs/passport"
import { BasicStragey as HTTPBasicStrategy } from "passport-http";


export class BasicStrategy extends PassportStrategy(HTTPBasicStrategy) {
    constructor() {
        
    }
}