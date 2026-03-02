import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from "passport-google-oauth20"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') { // PassportStrategy eine funktion die eine klasse zurueck gibt
    constructor() {
        super({
            cleintID: process.env.CLIENT_ID,
            clientSecet: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: ['openid', 'email', 'profile'] // siehe docs von google was es so alles noch geben kann
        });
    };
    async validate(accesToken, refreshToken, profile) {
        return {
            googleId: profile.id,
            email: profile.emails?.[0], // es kommen mehere emails zueruck kommen ?. schaut nach ob es uberhaupt einen Wert gibt !
            name: profile.displayName,
        }
    };
}
