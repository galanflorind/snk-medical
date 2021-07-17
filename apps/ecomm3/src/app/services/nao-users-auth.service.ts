import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NaoHttp2ApiService } from "@naologic/nao-http2";
import { NaoDocumentInterface } from "@naologic/nao-interfaces";
import { NaoUserAccessService } from "@naologic/nao-user-access";

@Injectable({
    providedIn: 'root'
})
export class NaoUsersAuthService<T = any> {
    public readonly api = { root: 'users' };
    public readonly userAccessOptions;

    constructor(
        private readonly naoHttp2ApiService: NaoHttp2ApiService,
        private naoUsersService: NaoUserAccessService
    ) {
        this.userAccessOptions = this.naoUsersService.userAccessOptions;
    }


    /**
     * Create a new user
     */
    public createUser(data, naoQueryOptions = NaoDocumentInterface.naoQueryOptionsDefault({ docName: 'guest-external-ecommerce', userMode: 'guest-external' })) {
        // -->Request: user login
        return this.naoHttp2ApiService.postJson<any>(`${this.api.root}-public/guest/create/${naoQueryOptions.docName}/new`, {
            data: { data, naoQueryOptions: this.userAccessOptions.naoQueryOptions, cfpPath: this.userAccessOptions.cfpPath }, naoQueryOptions
        });
    }

    /**
     * Send the email for password reset
     */
    public sendResetPasswordEmail(email: string, naoQueryOptions = NaoDocumentInterface.naoQueryOptionsDefault({ docName: 'guest-external-ecommerce' })): Observable<T> {
        // -->Check: this invite
        return this.naoHttp2ApiService.postJson<T>(`${this.api.root}/password/${this.userAccessOptions.naoQueryOptions.docName}/forgot`, { data: { email }, naoQueryOptions: this.userAccessOptions.naoQueryOptions });
    }

}
