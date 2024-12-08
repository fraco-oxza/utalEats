import { AccountRepository, ProfileRepository } from "./repositories";
import {
  IAccountRegistrationDTO,
  ILoginDTO,
  IProfile,
} from "./domain-interfaces";

export class AuthService {
  constructor(
    private accountRepository: AccountRepository,
    private profileRepository: ProfileRepository
  ) {}

  async register(data: IAccountRegistrationDTO) {
    if (await this.accountRepository.emailExists(data.email)) {
      throw new Error("Email already registered");
    }

    return this.accountRepository.register(data);
  }

  async login(credentials: ILoginDTO) {
    const accountId = await this.accountRepository.login(credentials);
    if (!accountId) throw new Error("Invalid credentials");
    return accountId;
  }

  async getProfile(accountId: number): Promise<IProfile> {
    const profile = await this.profileRepository.getByAccountId(accountId);
    if (!profile) throw new Error("Profile not found");
    return profile;
  }
}
