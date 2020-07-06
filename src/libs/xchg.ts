import { Settings } from "../settings";
import { Entity } from "./crud";

const signIn = "sign-in";
const otp = "otp";
const token = "tk";
const publicToken = "pub-tk";
const resetPassword = "rst-pwd";
const signOut = "sign-out";

type AppUser<K = number> = Entity<K> & {
  person: Entity<K>;
};

type Token<K = number> = Entity<K> & {
  appUser: AppUser<K>;
  token: string;
};

type Credentials = Record<"email" | "phone" | "password" | "token", string>;

type SignUpReq<K> = Record<"email" | "phone", string> & {
  appUser: AppUser<K>;
};

class Exchanger {
  private settings: Settings;
  constructor(settings: Settings) {
    this.settings = settings;
  }
  token<K>(tk: string): Promise<Token<K>> {
    return new Promise((resolve, reject) => {
      this.settings.opt.rs
        .of(token)<Token<K>, string>(tk)
        .then(rsp => {
          resolve(rsp);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  signOut(): Promise<void> {
    return this.settings.opt.rs.of(signOut)();
  }
  signIn<K>(
    credentials:
      | Pick<Credentials, "email" | "password">
      | Pick<Credentials, "email" | "token">
      | Pick<Credentials, "phone" | "password">
      | Pick<Credentials, "phone" | "token">
  ): Promise<Token<K>> {
    return new Promise((resolve, reject) => {
      this.settings.opt.rs
        .of(signIn)<Token<K>, typeof credentials>(credentials)
        .then(rsp => {
          resolve(rsp);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  otp(
    credentials: Pick<Credentials, "email"> | Pick<Credentials, "phone">
  ): Promise<void> {
    return this.settings.opt.rs.of(otp)(credentials);
  }
  resetPassword(password: string): Promise<void> {
    return this.settings.opt.rs.of(resetPassword)(password);
  }
}

export { Exchanger, AppUser, Token, Credentials, SignUpReq };
