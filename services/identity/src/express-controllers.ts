import express, { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cors from "cors";
import { AuthService } from "./application-services";
import {
  DrizzleAccountRepository,
  DrizzleProfileRepository,
} from "./drizzle-repositories";
import { IAccountRegistrationDTO, ILoginDTO } from "./domain-interfaces";
import { runMigration } from "./db/connection";

export class AuthController {
  private app: Express;
  private authService: AuthService;

  constructor() {
    this.app = express();
    this.configureRateLimiting();
    this.configureMiddlewares();

    const accountRepo = new DrizzleAccountRepository();
    const profileRepo = new DrizzleProfileRepository();
    this.authService = new AuthService(accountRepo, profileRepo);

    this.registerRoutes();
  }

  private configureMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(morgan("dev"));
    this.app.use(cors());
  }

  private configureRateLimiting(): void {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);
  }

  private registerRoutes(): void {
    this.app.post("/account/register", this.handleRegister.bind(this));
    this.app.post("/account/login", this.handleLogin.bind(this));
    this.app.get("/profile", this.handleGetProfile.bind(this));
  }

  private async handleRegister(req: Request, res: Response): Promise<void> {
    try {
      const registrationData: IAccountRegistrationDTO = req.body;
      this.validateRegistrationData(registrationData);
      const account = await this.authService.register(registrationData);
      res.status(201).json(account.id);
    } catch (error) {
      this.handleError(res, error as Error);
    }
  }

  private async handleLogin(req: Request, res: Response): Promise<void> {
    try {
      const loginData: ILoginDTO = req.body;
      this.validateLoginData(loginData);
      const accountId = await this.authService.login(loginData);
      res.json({ accountId });
    } catch (error) {
      this.handleError(res, error as Error);
    }
  }

  private async handleGetProfile(req: Request, res: Response): Promise<void> {
    try {
      const accountId = this.validateAccountId(req.query.accountId);
      const profile = await this.authService.getProfile(accountId);
      res.json(profile);
    } catch (error) {
      this.handleError(res, error as Error);
    }
  }

  private validateRegistrationData(data: IAccountRegistrationDTO): void {
    const requiredFields: (keyof IAccountRegistrationDTO)[] = [
      "email",
      "password",
      "name",
      "phone",
      "address",
      "city",
    ];

    requiredFields.forEach((field) => {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    });
  }

  private validateLoginData(data: ILoginDTO): void {
    if (!data.email || !data.password) {
      throw new Error("email and password are required");
    }
  }

  private validateAccountId(accountId: unknown): number {
    if (accountId === undefined || accountId === null) {
      throw new Error("accountId is required");
    }

    const accountIdString = Array.isArray(accountId)
      ? accountId[0]
      : (accountId as string);

    if (!/^\d+$/.test(accountIdString)) {
      throw new Error("accountId must be a number");
    }
    return parseInt(accountIdString, 10);
  }

  private handleError(res: Response, error: Error): void {
    console.error(error);

    switch (error.message) {
      case "Email already registered":
        res.status(400).json({ message: error.message });
        break;
      case "Invalid credentials":
        res.status(401).json({ message: error.message });
        break;
      case "Profile not found":
        res.status(404).json({ message: error.message });
        break;
      default:
        res.status(500).json({ message: "Internal Server Error" });
    }
  }

  startServer(port: number = 3000): void {
    runMigration().then(() => {
      this.app.listen(port, () => {
        console.info(`Server running on port ${port}`);
      });
    });
  }
}
