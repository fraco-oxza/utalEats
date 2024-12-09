import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { db } from "./db/connection";
import { accountTable, profileTable } from "./db/schema";
import { AccountRepository, ProfileRepository } from "./repositories";
import {
  IAccount,
  IProfile,
  IAccountRegistrationDTO,
  ILoginDTO,
} from "./domain-interfaces";

export class DrizzleAccountRepository extends AccountRepository {
  async register(data: IAccountRegistrationDTO): Promise<IAccount> {
    const passwordHash = await argon2.hash(data.password);

    const [account] = await db
      .insert(accountTable)
      .values({
        email: data.email,
        passwordHash,
      })
      .returning();

    await db.insert(profileTable).values({
      accountId: account.id,
      name: data.name,
      phone: data.phone,
      address: data.address,
      city: data.city,
    });

    return account;
  }

  async login(credentials: ILoginDTO): Promise<number | null> {
    const [account] = await db
      .select()
      .from(accountTable)
      .where(eq(accountTable.email, credentials.email));

    if (!account) return null;

    const isValid = await argon2.verify(
      account.passwordHash,
      credentials.password
    );

    return isValid ? account.id : null;
  }

  async emailExists(email: string): Promise<boolean> {
    const accounts = await db
      .select()
      .from(accountTable)
      .where(eq(accountTable.email, email));

    return accounts.length > 0;
  }
}

export class DrizzleProfileRepository extends ProfileRepository {
  async getByAccountId(accountId: number): Promise<IProfile | null> {
    const [profile] = await db
      .select()
      .from(profileTable)
      .where(eq(profileTable.accountId, accountId));

    return profile || null;
  }
}
